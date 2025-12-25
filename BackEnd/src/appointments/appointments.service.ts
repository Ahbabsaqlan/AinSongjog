import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment) private apptRepo: Repository<Appointment>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async bookAppointment(clientId: string, lawyerId: string, dateString: string) {
    const lawyer = await this.userRepo.findOne({ where: { id: lawyerId } });
    const client = await this.userRepo.findOne({ where: { id: clientId } });

    if (!lawyer || !client) throw new BadRequestException('Invalid User IDs');

    const appt = this.apptRepo.create({
        client,
        lawyer,
        scheduleDate: new Date(dateString),
        status: 'PENDING'
    });

    return this.apptRepo.save(appt);
  }
}