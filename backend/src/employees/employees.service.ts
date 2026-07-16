import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { EmployeeDocument, REQUIRED_DOCS_BY_ROLE } from './entities/employee-document.entity';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
    @InjectRepository(EmployeeDocument) private docRepo: Repository<EmployeeDocument>,
  ) {}

  async create(data: Partial<Employee>) {
    const employee = this.employeeRepo.create(data);
    return this.employeeRepo.save(employee);
  }

  async findAll(filters?: { role?: string; branch?: string; status?: string }) {
    const qb = this.employeeRepo.createQueryBuilder('e');
    if (filters?.role) qb.andWhere('e.role = :role', { role: filters.role });
    if (filters?.branch) qb.andWhere('e.branch = :branch', { branch: filters.branch });
    if (filters?.status) qb.andWhere('e.employmentStatus = :status', { status: filters.status });
    return qb.orderBy('e.name', 'ASC').getMany();
  }

  async findOne(id: string) {
    const employee = await this.employeeRepo.findOne({ where: { id }, relations: ['documents'] });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async update(id: string, data: Partial<Employee>) {
    const employee = await this.findOne(id);
    Object.assign(employee, data);
    return this.employeeRepo.save(employee);
  }

  async addDocument(employeeId: string, data: Partial<EmployeeDocument>) {
    const employee = await this.findOne(employeeId);
    const doc = this.docRepo.create({ ...data, employeeId });
    return this.docRepo.save(doc);
  }

  async getDocuments(employeeId: string) {
    return this.docRepo.find({ where: { employeeId } });
  }

  async getExpiringDocuments() {
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);

    return this.docRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.employee', 'e')
      .where('d.expiryDate <= :thirtyDays', { thirtyDays })
      .orderBy('d.expiryDate', 'ASC')
      .getMany();
  }

  async getStats() {
    const total = await this.employeeRepo.count();
    const active = await this.employeeRepo.count({ where: { employmentStatus: 'active' } });
    const onLeave = await this.employeeRepo.count({ where: { employmentStatus: 'on_leave' } });
    const byRole = await this.employeeRepo
      .createQueryBuilder('e')
      .select('e.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('e.role')
      .getRawMany();

    return { total, active, onLeave, byRole };
  }

  async isCompliant(employeeId: string): Promise<{ compliant: boolean; issues: string[] }> {
    const employee = await this.findOne(employeeId);
    if (employee.employmentStatus !== 'active') {
      return { compliant: false, issues: ['Employee is not active'] };
    }

    const requiredDocs = REQUIRED_DOCS_BY_ROLE[employee.role] || [];
    const today = new Date();
    const docs = await this.docRepo.find({ where: { employeeId } });
    const issues: string[] = [];

    for (const docType of requiredDocs) {
      const doc = docs.find((d) => d.documentType === docType);
      if (!doc) {
        issues.push(`Missing: ${docType}`);
      } else if (doc.expiryDate < today) {
        issues.push(`Expired: ${docType}`);
      }
    }

    return { compliant: issues.length === 0, issues };
  }
}
