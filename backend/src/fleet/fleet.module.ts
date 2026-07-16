import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FleetController } from './fleet.controller';
import { FleetService } from './fleet.service';
import { Vehicle } from './entities/vehicle.entity';
import { Trip } from './entities/trip.entity';
import { Employee } from '../employees/entities/employee.entity';
import { EmployeeDocument } from '../employees/entities/employee-document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, Trip, Employee, EmployeeDocument])],
  controllers: [FleetController],
  providers: [FleetService],
  exports: [FleetService],
})
export class FleetModule {}
