import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './entities/appointment.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    // Appointments need access to Appointment Table and User Table
    TypeOrmModule.forFeature([Appointment, User])
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}