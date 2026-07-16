import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from './auth/auth.module';
import { TicketsModule } from './tickets/tickets.module';
import { ParcelsModule } from './parcels/parcels.module';
import { FleetModule } from './fleet/fleet.module';
import { FinanceModule } from './finance/finance.module';
import { EmployeesModule } from './employees/employees.module';
import { IntegrationsModule } from './common/config/integrations.module';
import { redisStore } from 'cache-manager-ioredis-yet';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5432),
        username: config.get('DATABASE_USER', 'buspawa'),
        password: config.get('DATABASE_PASSWORD', 'buspawa'),
        database: config.get('DATABASE_NAME', 'buspawa'),
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: await redisStore({
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          ttl: 60,
        }),
      }),
    }),
    AuthModule,
    TicketsModule,
    ParcelsModule,
    FleetModule,
    FinanceModule,
    EmployeesModule,
    IntegrationsModule,
  ],
})
export class AppModule {}
