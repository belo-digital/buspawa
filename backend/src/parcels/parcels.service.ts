import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parcel } from './entities/parcel.entity';
import { ManifestParcel } from './entities/manifest-parcel.entity';
import { ParcelScanEvent } from './entities/parcel-scan-event.entity';
import { SmsService } from '../common/config/sms.service';
import { v4 as uuidv4 } from 'uuid';

const WEIGHT_BANDS = [
  { maxKg: 5, baseRate: 350 },
  { maxKg: 10, baseRate: 500 },
  { maxKg: 20, baseRate: 800 },
  { maxKg: 30, baseRate: 1100 },
  { maxKg: Infinity, baseRate: 1500 },
];

const ROUTE_MULTIPLIER: Record<string, number> = {
  'Nairobi-Mombasa': 1.0,
  'Nairobi-Kisumu': 0.9,
  'Nairobi-Eldoret': 0.85,
  'Nairobi-Nakuru': 0.7,
  'Mombasa-Kisumu': 1.1,
};

const MODIFIER_RATES = {
  fragile: 0.10,
  perishable: 0.15,
  document: 0.50,
};

const INSURANCE_RATE = 0.02;

const EXPRESS_MULTIPLIER = 1.5;

function computeVolumetricWeight(l: number, w: number, h: number): number {
  return (l * w * h) / 5000;
}

function getWeightBandRate(weightKg: number): number {
  for (const band of WEIGHT_BANDS) {
    if (weightKg <= band.maxKg) return band.baseRate;
  }
  return WEIGHT_BANDS[WEIGHT_BANDS.length - 1].baseRate;
}

function getRouteMultiplier(origin: string, destination: string): number {
  const key1 = `${origin}-${destination}`;
  const key2 = `${destination}-${origin}`;
  return ROUTE_MULTIPLIER[key1] || ROUTE_MULTIPLIER[key2] || 1.0;
}

@Injectable()
export class ParcelsService {
  private readonly logger = new Logger(ParcelsService.name);

  constructor(
    @InjectRepository(Parcel) private parcelRepo: Repository<Parcel>,
    @InjectRepository(ManifestParcel) private manifestRepo: Repository<ManifestParcel>,
    @InjectRepository(ParcelScanEvent) private scanEventRepo: Repository<ParcelScanEvent>,
    private smsService: SmsService,
  ) {}

  async create(data: {
    description: string;
    actualWeight: number;
    origin: string;
    destination: string;
    senderName: string;
    senderPhone?: string;
    receiverName: string;
    receiverPhone?: string;
    paymentMethod?: string;
    createdById?: string;
    length?: number;
    width?: number;
    height?: number;
    serviceLevel?: string;
    isFragile?: boolean;
    isPerishable?: boolean;
    isHighValue?: boolean;
    declaredValue?: number;
    isDocument?: boolean;
  }) {
    let chargeableWeight = data.actualWeight;
    let volumetricWeight: number | null = null;

    if (data.length && data.width && data.height) {
      volumetricWeight = computeVolumetricWeight(data.length, data.width, data.height);
      chargeableWeight = Math.max(data.actualWeight, volumetricWeight);
    }

    const baseFare = getWeightBandRate(chargeableWeight);
    const routeMultiplier = getRouteMultiplier(data.origin, data.destination);
    let modifierFare = 0;

    if (data.isFragile) modifierFare += baseFare * MODIFIER_RATES.fragile;
    if (data.isPerishable) modifierFare += baseFare * MODIFIER_RATES.perishable;
    if (data.isDocument) modifierFare += baseFare * MODIFIER_RATES.document;

    let insuranceFee = 0;
    let insuranceRate = 0;
    if (data.isHighValue && data.declaredValue && data.declaredValue > 0) {
      insuranceRate = INSURANCE_RATE;
      insuranceFee = data.declaredValue * insuranceRate;
    }

    const subtotal = (baseFare + modifierFare) * routeMultiplier + insuranceFee;
    const expressMultiplier = data.serviceLevel === 'express' ? EXPRESS_MULTIPLIER : 1;
    const fare = Math.round(subtotal * expressMultiplier);

    const trackingCode = `PCL-${uuidv4().slice(0, 8).toUpperCase()}`;

    const parcel = this.parcelRepo.create({
      trackingCode,
      description: data.description,
      actualWeight: data.actualWeight,
      volumetricWeight,
      chargeableWeight,
      length: data.length || null,
      width: data.width || null,
      height: data.height || null,
      origin: data.origin,
      destination: data.destination,
      senderName: data.senderName,
      senderPhone: data.senderPhone,
      receiverName: data.receiverName,
      receiverPhone: data.receiverPhone,
      fare,
      baseFare,
      modifierFare,
      serviceLevel: (data.serviceLevel as any) || 'standard',
      isFragile: data.isFragile || false,
      isPerishable: data.isPerishable || false,
      isHighValue: data.isHighValue || false,
      declaredValue: data.declaredValue || 0,
      insuranceRate,
      insuranceFee,
      isDocument: data.isDocument || false,
      paymentMethod: (data.paymentMethod as any) || 'M-Pesa',
      status: 'created',
      createdById: data.createdById,
      qrCodeData: JSON.stringify({
        code: trackingCode,
        origin: data.origin,
        destination: data.destination,
        receiver: data.receiverName,
      }),
    });
    return this.parcelRepo.save(parcel);
  }

  async findAll(filters?: { status?: string; origin?: string; destination?: string }) {
    const qb = this.parcelRepo.createQueryBuilder('p');
    if (filters?.status) qb.andWhere('p.status = :status', { status: filters.status });
    if (filters?.origin) qb.andWhere('p.origin = :origin', { origin: filters.origin });
    if (filters?.destination) qb.andWhere('p.destination = :destination', { destination: filters.destination });
    return qb.orderBy('p."createdAt"', 'DESC').getMany();
  }

  async findByTracking(trackingCode: string) {
    const parcel = await this.parcelRepo.findOne({ where: { trackingCode } });
    if (!parcel) throw new NotFoundException('Parcel not found');
    return parcel;
  }

  async getScanHistory(trackingCode: string) {
    const parcel = await this.findByTracking(trackingCode);
    return this.scanEventRepo.find({
      where: { parcelId: parcel.id },
      order: { scannedAt: 'ASC' },
    });
  }

  async assignToTrip(trackingCode: string, tripId: string, vehicleReg: string) {
    const parcel = await this.findByTracking(trackingCode);
    parcel.assignedTripId = tripId;
    parcel.assignedVehicleReg = vehicleReg;
    parcel.status = 'in_transit';
    await this.parcelRepo.save(parcel);

    const manifest = this.manifestRepo.create({
      tripId,
      parcelTrackingCode: trackingCode,
      description: parcel.description,
      receiverName: parcel.receiverName,
    });
    await this.manifestRepo.save(manifest);

    return parcel;
  }

  async scanParcel(trackingCode: string, scanType: 'loaded' | 'received' | 'collected', data: {
    scannedByUserId?: string;
    scannedByName?: string;
    location?: string;
    vehicleReg?: string;
    notes?: string;
    receiverSignatureUrl?: string;
  }) {
    const parcel = await this.findByTracking(trackingCode);

    if (scanType === 'loaded' && parcel.status !== 'in_transit') {
      throw new BadRequestException('Parcel must be assigned to a trip before loading');
    }
    if (scanType === 'received' && parcel.status !== 'in_transit') {
      throw new BadRequestException('Parcel must be in transit before receiving');
    }
    if (scanType === 'collected' && parcel.status !== 'arrived') {
      throw new BadRequestException('Parcel must have arrived before collection');
    }

    const event = this.scanEventRepo.create({
      parcelId: parcel.id,
      scanType,
      scannedByUserId: data.scannedByUserId || null,
      scannedByName: data.scannedByName || null,
      location: data.location || null,
      vehicleReg: data.vehicleReg || null,
      notes: data.notes || null,
      receiverSignatureUrl: data.receiverSignatureUrl || null,
    });
    await this.scanEventRepo.save(event);

    if (scanType === 'collected') {
      parcel.status = 'delivered';
      parcel.receiverSignatureUrl = data.receiverSignatureUrl || null;
    } else if (scanType === 'received') {
      parcel.status = 'arrived';
    }
    await this.parcelRepo.save(parcel);

    if (scanType === 'received' && parcel.receiverPhone) {
      this.smsService.sendParcelNotification(
        parcel.receiverPhone, trackingCode, 'arrived at destination', data.location || '',
      ).catch((err) => this.logger.warn(`SMS failed for ${trackingCode}: ${err.message}`));
    }
    if (scanType === 'collected' && parcel.senderPhone) {
      this.smsService.sendParcelNotification(
        parcel.senderPhone, trackingCode, 'collected by recipient', data.location || '',
      ).catch((err) => this.logger.warn(`SMS failed for ${trackingCode}: ${err.message}`));
    }

    return { parcel, event };
  }

  async getManifest(tripId: string) {
    return this.manifestRepo.find({ where: { tripId } });
  }

  async getStats() {
    const total = await this.parcelRepo.count();
    const inTransit = await this.parcelRepo.count({ where: { status: 'in_transit' as any } });
    const delivered = await this.parcelRepo.count({ where: { status: 'delivered' as any } });
    const totalRevenue = await this.parcelRepo
      .createQueryBuilder('p')
      .select('SUM(p.fare)', 'total')
      .getRawOne();

    return { total, inTransit, delivered, totalRevenue: Number(totalRevenue?.total || 0) };
  }
}
