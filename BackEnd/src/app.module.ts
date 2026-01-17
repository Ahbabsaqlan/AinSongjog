import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { CasesModule } from './cases/cases.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { EmailModule } from './email/email.module'; // <-- Add this

// Entities
import { User } from './users/entities/user.entity';
import { Otp } from './auth/entities/otp.entity';
import { LawyerProfile } from './users/entities/lawyer-profile.entity';
import { Case } from './cases/entities/case.entity';
import { Appointment } from './appointments/entities/appointment.entity';
import { ClientProfile } from './users/entities/client-profile.entity';
import { StorageModule } from './storage/storage.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    // Database Connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: +config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        
        entities: [User, Otp, LawyerProfile, ClientProfile, Case, Appointment], 
        autoLoadEntities: true,
        synchronize: true,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        extra: {
          ssl: process.env.NODE_ENV === 'production' ? { 
            rejectUnauthorized: false,
            require: true,
            mode: 'require'
          } : null,
          family: 4,
          max: 20,
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 30000,
          statement_timeout: 60000,
        },
        connectTimeoutMS: 10000,
      }),
      inject: [ConfigService],
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    AdminModule,
    CasesModule,
    AppointmentsModule,
    EmailModule,
    StorageModule,
    NotificationsModule,
  ],
})
export class AppModule {}