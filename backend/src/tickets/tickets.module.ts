import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { Ticket } from './entities/ticket.entity';
import { ManifestPassenger } from './entities/manifest-passenger.entity';
import { SeatMap } from './entities/seat-map.entity';
import { Trip } from '../fleet/entities/trip.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, ManifestPassenger, SeatMap, Trip])],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
