import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { ManifestPassenger } from './entities/manifest-passenger.entity';
import { SeatMap } from './entities/seat-map.entity';
import { Trip } from '../fleet/entities/trip.entity';
import { SmsService } from '../common/config/sms.service';
import { v4 as uuidv4 } from 'uuid';

const HOLD_DURATION_MINUTES = 10;

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectRepository(Ticket) private ticketRepo: Repository<Ticket>,
    @InjectRepository(ManifestPassenger) private manifestRepo: Repository<ManifestPassenger>,
    @InjectRepository(SeatMap) private seatMapRepo: Repository<SeatMap>,
    @InjectRepository(Trip) private tripRepo: Repository<Trip>,
    private smsService: SmsService,
  ) {}

  async getSeatMap(tripId: string) {
    let seats = await this.seatMapRepo.find({
      where: { tripId },
      order: { seatNumber: 'ASC' },
    });

    const trip = await this.tripRepo.findOne({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Trip not found');

    if (seats.length === 0) {
      seats = await this.initializeSeatMap(trip);
    }

    const now = new Date();
    for (const seat of seats) {
      if (seat.status === 'held' && seat.holdExpiresAt && seat.holdExpiresAt < now) {
        seat.status = 'free';
        seat.heldByUserId = null;
        seat.heldByPhone = null;
        seat.holdExpiresAt = null;
        seat.holdVersion += 1;
        await this.seatMapRepo.save(seat);
      }
    }

    return seats;
  }

  async holdSeat(tripId: string, seatNumber: number, userId: string, phone?: string) {
    const trip = await this.tripRepo.findOne({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Trip not found');

    let seat = await this.seatMapRepo.findOne({ where: { tripId, seatNumber } });
    if (!seat) {
      seat = this.seatMapRepo.create({ tripId, seatNumber, status: 'free' });
    }

    if (seat.status === 'confirmed') {
      throw new ConflictException(`Seat ${seatNumber} is already booked`);
    }

    const now = new Date();
    if (seat.status === 'held' && seat.holdExpiresAt && seat.holdExpiresAt > now) {
      if (seat.heldByUserId !== userId) {
        throw new ConflictException(`Seat ${seatNumber} is currently held by another user`);
      }
      const expiresAt = new Date(now.getTime() + HOLD_DURATION_MINUTES * 60 * 1000);
      seat.holdExpiresAt = expiresAt;
      seat.holdVersion += 1;
      await this.seatMapRepo.save(seat);
      return { seat, holdExpiresAt: expiresAt };
    }

    seat.status = 'held';
    seat.heldByUserId = userId;
    seat.heldByPhone = phone || null;
    seat.holdExpiresAt = new Date(now.getTime() + HOLD_DURATION_MINUTES * 60 * 1000);
    seat.heldFare = Number(trip.baseFare) || 0;
    seat.holdVersion += 1;
    await this.seatMapRepo.save(seat);

    return { seat, holdExpiresAt: seat.holdExpiresAt };
  }

  async releaseExpiredHolds() {
    const now = new Date();
    const expired = await this.seatMapRepo.find({
      where: { status: 'held' as any, holdExpiresAt: LessThanOrEqual(now) },
    });
    for (const seat of expired) {
      seat.status = 'free';
      seat.heldByUserId = null;
      seat.heldByPhone = null;
      seat.holdExpiresAt = null;
      seat.holdVersion += 1;
      await this.seatMapRepo.save(seat);
    }
    return expired.length;
  }

  async confirmBooking(data: {
    tripId: string;
    seatNumber: number;
    passengerName: string;
    passengerPhone?: string;
    ticketClass?: string;
    paymentMethod?: string;
    bookedById?: string;
    mpesaReceipt?: string;
  }) {
    const trip = await this.tripRepo.findOne({ where: { id: data.tripId } });
    if (!trip) throw new NotFoundException('Trip not found');

    const seat = await this.seatMapRepo.findOne({ where: { tripId: data.tripId, seatNumber: data.seatNumber } });
    if (!seat) throw new NotFoundException('Seat not found');
    if (seat.status === 'confirmed') throw new ConflictException('Seat already booked');
    if (seat.status === 'held' && seat.heldByUserId !== data.bookedById) {
      throw new ConflictException('Seat held by another user');
    }

    const now = new Date();
    if (seat.status === 'held' && seat.holdExpiresAt && seat.holdExpiresAt < now) {
      throw new BadRequestException('Seat hold has expired — please hold again');
    }

    const multiplier = data.ticketClass === 'VIP' ? 1.35 : 1;
    const fare = (Number(trip.baseFare) || 0) * multiplier;

    const ticketRef = `TKT-${uuidv4().slice(0, 8).toUpperCase()}`;
    const bookingCode = uuidv4().slice(0, 6).toUpperCase();

    const ticket = this.ticketRepo.create({
      ticketRef,
      tripId: data.tripId,
      bookedById: data.bookedById,
      passengerName: data.passengerName,
      passengerPhone: data.passengerPhone,
      seatNumber: data.seatNumber,
      ticketClass: data.ticketClass || 'Regular',
      fare,
      paymentMethod: data.paymentMethod || 'M-Pesa',
      status: 'booked',
      bookingCode,
      mpesaReceipt: data.mpesaReceipt,
      qrCodeData: JSON.stringify({ ref: ticketRef, trip: data.tripId, seat: data.seatNumber, code: bookingCode }),
    });
    await this.ticketRepo.save(ticket);

    seat.status = 'confirmed';
    seat.ticketRef = ticketRef;
    seat.heldFare = fare;
    seat.holdVersion += 1;
    await this.seatMapRepo.save(seat);

    trip.bookedSeats += 1;
    await this.tripRepo.save(trip);

    const manifest = this.manifestRepo.create({
      tripId: data.tripId,
      ticketRef,
      passengerName: data.passengerName,
      seatNumber: data.seatNumber,
    });
    await this.manifestRepo.save(manifest);

    if (data.passengerPhone) {
      this.smsService.sendBookingConfirmation(
        data.passengerPhone,
        data.passengerName,
        ticketRef,
        trip.route,
        data.seatNumber,
        trip.departureTime,
      ).catch((err) => this.logger.warn(`SMS failed for ${ticketRef}: ${err.message}`));
    }

    return ticket;
  }

  async verifyTicketByConductor(ticketRef: string, conductorId: string) {
    const ticket = await this.ticketRepo.findOne({ where: { ticketRef } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.status === 'cancelled' || ticket.status === 'no_show') {
      throw new BadRequestException('Ticket is not valid for boarding');
    }

    ticket.status = 'boarded';
    ticket.verifiedByConductorId = conductorId;
    ticket.verifiedAt = new Date();
    await this.ticketRepo.save(ticket);

    const manifest = await this.manifestRepo.findOne({
      where: { tripId: ticket.tripId, seatNumber: ticket.seatNumber },
    });
    if (manifest) {
      manifest.boarded = true;
      manifest.boardingTime = new Date();
      await this.manifestRepo.save(manifest);
    }
    return ticket;
  }

  async findAll(filters?: { tripId?: string; status?: string }) {
    const qb = this.ticketRepo.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.trip', 'trip');
    if (filters?.tripId) qb.andWhere('ticket.tripId = :tripId', { tripId: filters.tripId });
    if (filters?.status) qb.andWhere('ticket.status = :status', { status: filters.status });
    return qb.orderBy('ticket."createdAt"', 'DESC').getMany();
  }

  async getStats(branch?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalTickets = await this.ticketRepo.count();
    const todayTickets = await this.ticketRepo
      .createQueryBuilder('t')
      .where('t."createdAt" >= :today', { today })
      .getCount();

    const totalRevenue = await this.ticketRepo
      .createQueryBuilder('t')
      .select('SUM(t.fare)', 'total')
      .getRawOne();

    return {
      totalTickets,
      todayTickets,
      totalRevenue: Number(totalRevenue?.total || 0),
    };
  }

  private async initializeSeatMap(trip: Trip): Promise<SeatMap[]> {
    const seats: SeatMap[] = [];
    for (let i = 1; i <= trip.totalSeats; i++) {
      const seat = this.seatMapRepo.create({
        tripId: trip.id,
        seatNumber: i,
        status: 'free',
      });
      seats.push(await this.seatMapRepo.save(seat));
    }
    return seats;
  }
}
