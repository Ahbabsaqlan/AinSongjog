import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

// Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { CasesModule } from './cases/cases.module'; // Import CasesModule
import { AppointmentsModule } from './appointments/appointments.module'; // Import AppointmentsModule

// Entities
import { User } from './users/entities/user.entity';
import { Otp } from './auth/entities/otp.entity';
import { LawyerProfile } from './users/entities/lawyer-profile.entity'; // <--- IMPORT
import { Case } from './cases/entities/case.entity'; // <--- IMPORT
import { Appointment } from './appointments/entities/appointment.entity'; // <--- IMPORT
import { ClientProfile } from './users/entities/client-profile.entity';

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
        
        // IMPORTANT: Add ALL entities here so TypeORM knows about them
        entities: [User, Otp, LawyerProfile,ClientProfile, Case, Appointment], 
        autoLoadEntities: true,
        synchronize: true, // Only for development
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        extra: {
          ssl: process.env.NODE_ENV === 'production' ? { 
            rejectUnauthorized: false,
            // Add these to help with connection issues
            require: true,
            mode: 'require'
          } : null,
          // Force IPv4 to prevent ENETUNREACH error
          family: 4,
          // Connection pool settings for production
          max: 20, // Max connections
          connectionTimeoutMillis: 5000, // 5 seconds timeout
          idleTimeoutMillis: 30000, // 30 seconds idle timeout
          statement_timeout: 60000,
        },
        // Additional TypeORM settings
        connectTimeoutMS: 10000, // 10 seconds connection timeout
      }),
      inject: [ConfigService],
    }),

    // Mailer Configuration
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST'),
          port: +config.get('MAIL_PORT'),
          // FIX: Automatically enable SSL if using port 465
          secure: +config.get('MAIL_PORT') === 465, 
          auth: {
            user: config.get('MAIL_USER'),
            pass: config.get('MAIL_PASS'),
          },
        },
        defaults: {
          from: `"AinShongjog Support" <${config.get('MAIL_FROM')}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    AdminModule,
    CasesModule,
    AppointmentsModule,
  ],
})
export class AppModule {}