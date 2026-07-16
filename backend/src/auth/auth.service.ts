import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User } from './entities/user.entity';
import { Station } from './entities/station.entity';
import { ServiceRoute } from './entities/route.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Station) private stationRepo: Repository<Station>,
    @InjectRepository(ServiceRoute) private routeRepo: Repository<ServiceRoute>,
    private jwtService: JwtService,
  ) {}

  async register(data: { email: string; password: string; name: string; role: string; phone?: string }) {
    const existing = await this.userRepo.findOne({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = this.userRepo.create({ ...data, password: hashedPassword });
    await this.userRepo.save(user);

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    return this.sanitizeUser(user);
  }

  async getStations() {
    return this.stationRepo.find({ order: { name: 'ASC' } });
  }

  async getRoutes() {
    return this.routeRepo.find({ order: { origin: 'ASC' } });
  }

  async createStation(data: Partial<Station>) {
    const station = this.stationRepo.create(data);
    return this.stationRepo.save(station);
  }

  async createRoute(data: Partial<ServiceRoute>) {
    const route = this.routeRepo.create(data);
    return this.routeRepo.save(route);
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      return { message: 'If an account exists with that email, a reset link has been sent.' };
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await this.userRepo.save(user);

    return {
      message: 'If an account exists with that email, a reset link has been sent.',
      resetToken,
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepo.findOne({ where: { resetToken: token } });
    if (!user) throw new BadRequestException('Invalid or expired reset token');
    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await this.userRepo.save(user);

    return { message: 'Password reset successfully' };
  }

  private generateToken(user: User): string {
    return this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
  }

  private sanitizeUser(user: User) {
    const { password, ...result } = user;
    return result;
  }
}
