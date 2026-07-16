import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, In } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { Trip } from './entities/trip.entity';
import { Employee } from '../employees/entities/employee.entity';
import { EmployeeDocument, REQUIRED_DOCS_BY_ROLE } from '../employees/entities/employee-document.entity';

@Injectable()
export class FleetService {
  constructor(
    @InjectRepository(Vehicle) private vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Trip) private tripRepo: Repository<Trip>,
    @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
    @InjectRepository(EmployeeDocument) private docRepo: Repository<EmployeeDocument>,
  ) {}

  async createVehicle(data: Partial<Vehicle>) {
    const vehicle = this.vehicleRepo.create(data);
    return this.vehicleRepo.save(vehicle);
  }

  async findAllVehicles(filters?: { status?: string; routeId?: string }) {
    const qb = this.vehicleRepo.createQueryBuilder('v');
    if (filters?.status) qb.andWhere('v.status = :status', { status: filters.status });
    if (filters?.routeId) qb.andWhere('v.routeId = :routeId', { routeId: filters.routeId });
    return qb.orderBy('v.registration', 'ASC').getMany();
  }

  async findVehicle(id: string) {
    const vehicle = await this.vehicleRepo.findOne({ where: { id } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }

  async updateVehicle(id: string, data: Partial<Vehicle>) {
    const vehicle = await this.findVehicle(id);
    Object.assign(vehicle, data);
    return this.vehicleRepo.save(vehicle);
  }

  async createTrip(data: Partial<Trip> & { driverId?: string; conductorId?: string }) {
    if (data.driverId) {
      const driverIssues = await this.validateCrewCompliance(data.driverId, 'driver');
      if (driverIssues.length > 0) {
        throw new BadRequestException(`Driver compliance issues: ${driverIssues.join(', ')}`);
      }
    }
    if (data.conductorId) {
      const conductorIssues = await this.validateCrewCompliance(data.conductorId, 'conductor');
      if (conductorIssues.length > 0) {
        throw new BadRequestException(`Conductor compliance issues: ${conductorIssues.join(', ')}`);
      }
    }

    const trip = this.tripRepo.create(data);
    return this.tripRepo.save(trip);
  }

  async validateCrewCompliance(employeeId: string, role: string): Promise<string[]> {
    const employee = await this.employeeRepo.findOne({ where: { id: employeeId } });
    if (!employee) return ['Employee not found'];
    if (employee.employmentStatus !== 'active') return ['Employee is not active'];

    const requiredDocs = REQUIRED_DOCS_BY_ROLE[role] || [];
    const today = new Date();
    const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const docs = await this.docRepo.find({ where: { employeeId } });
    const issues: string[] = [];

    for (const docType of requiredDocs) {
      const doc = docs.find((d) => d.documentType === docType);
      if (!doc) {
        issues.push(`Missing required document: ${docType}`);
        continue;
      }
      if (doc.expiryDate < today) {
        issues.push(`Document expired: ${docType} (expired ${doc.expiryDate.toISOString().split('T')[0]})`);
      } else if (doc.expiryDate < thirtyDays) {
        const days = Math.ceil((doc.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        issues.push(`Document expiring soon: ${docType} (in ${days} days)`);
      }
    }

    return issues;
  }

  async findAllTrips(filters?: { status?: string; route?: string; date?: string }) {
    const qb = this.tripRepo.createQueryBuilder('t')
      .leftJoinAndSelect('t.vehicle', 'vehicle');

    if (filters?.status) qb.andWhere('t.status = :status', { status: filters.status });
    if (filters?.route) qb.andWhere('t.route LIKE :route', { route: `%${filters.route}%` });
    if (filters?.date) qb.andWhere('t.travelDate = :date', { date: filters.date });

    return qb.orderBy('t.departureTime', 'ASC').getMany();
  }

  async findTrip(id: string) {
    const trip = await this.tripRepo.findOne({ where: { id }, relations: ['vehicle'] });
    if (!trip) throw new NotFoundException('Trip not found');
    return trip;
  }

  async updateTripStatus(id: string, status: string) {
    const trip = await this.findTrip(id);
    trip.status = status as any;
    return this.tripRepo.save(trip);
  }

  async getFleetStats() {
    const totalVehicles = await this.vehicleRepo.count();
    const activeVehicles = await this.vehicleRepo.count({ where: { status: 'active' } });
    const maintenanceVehicles = await this.vehicleRepo.count({ where: { status: 'maintenance' } });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeTrips = await this.tripRepo.count({
      where: { travelDate: MoreThanOrEqual(today), status: 'in_transit' as any },
    });

    const upcomingTrips = await this.tripRepo.count({
      where: { travelDate: MoreThanOrEqual(today), status: 'scheduled' as any },
    });

    return { totalVehicles, activeVehicles, maintenanceVehicles, activeTrips, upcomingTrips };
  }

  async getComplianceAlerts() {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const vehicles = await this.vehicleRepo.find();
    const alerts: any[] = [];

    for (const v of vehicles) {
      if (v.ntsaExpiry && v.ntsaExpiry < today) {
        alerts.push({ vehicle: v.registration, type: 'NTSA Inspection', severity: 'danger', due: 'Overdue' });
      } else if (v.ntsaExpiry && v.ntsaExpiry < thirtyDaysFromNow) {
        const days = Math.ceil((v.ntsaExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        alerts.push({ vehicle: v.registration, type: 'NTSA Inspection', severity: 'warning', due: `in ${days} days` });
      }
      if (v.insuranceExpiry && v.insuranceExpiry < thirtyDaysFromNow) {
        const days = Math.ceil((v.insuranceExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        alerts.push({ vehicle: v.registration, type: 'Insurance', severity: days < 0 ? 'danger' : 'warning', due: days < 0 ? 'Overdue' : `in ${days} days` });
      }
      if (v.tlbExpiry && v.tlbExpiry < thirtyDaysFromNow) {
        const days = Math.ceil((v.tlbExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        alerts.push({ vehicle: v.registration, type: 'TLB License', severity: days < 0 ? 'danger' : 'warning', due: days < 0 ? 'Overdue' : `in ${days} days` });
      }
    }
    return alerts;
  }

  async getEmployeeComplianceAlerts() {
    const today = new Date();
    const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const employees = await this.employeeRepo.find({ where: { employmentStatus: 'active' } });
    const alerts: any[] = [];

    for (const emp of employees) {
      const requiredDocs = REQUIRED_DOCS_BY_ROLE[emp.role] || [];
      const docs = await this.docRepo.find({ where: { employeeId: emp.id } });

      for (const docType of requiredDocs) {
        const doc = docs.find((d) => d.documentType === docType);
        if (!doc) {
          alerts.push({ employee: emp.name, role: emp.role, documentType: docType, severity: 'danger', due: 'Missing' });
        } else if (doc.expiryDate < today) {
          alerts.push({ employee: emp.name, role: emp.role, documentType: docType, severity: 'danger', due: 'Expired' });
        } else if (doc.expiryDate < thirtyDays) {
          const days = Math.ceil((doc.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          alerts.push({ employee: emp.name, role: emp.role, documentType: docType, severity: 'warning', due: `in ${days} days` });
        }
      }
    }
    return alerts;
  }
}
