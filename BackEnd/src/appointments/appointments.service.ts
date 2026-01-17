import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/role.enum';

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

  async getAppointmentsForUser(userId: string, role: string, status?: string) {
    const queryBuilder = this.apptRepo.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.client', 'client')
      .leftJoinAndSelect('appointment.lawyer', 'lawyer')
      .leftJoinAndSelect('client.clientProfile', 'clientProfile')
      .leftJoinAndSelect('lawyer.lawyerProfile', 'lawyerProfile');

    if (role === UserRole.CLIENT) {
      queryBuilder.where('appointment.client.id = :userId', { userId });
    } else if (role === UserRole.LAWYER) {
      queryBuilder.where('appointment.lawyer.id = :userId', { userId });
    } else {
      throw new ForbiddenException('Invalid role for appointments');
    }

    if (status) {
      queryBuilder.andWhere('appointment.status = :status', { status });
    }

    queryBuilder.orderBy('appointment.scheduleDate', 'DESC');

    return queryBuilder.getMany();
  }

  async findOne(id: string, userId: string, role: string) {
    const appointment = await this.apptRepo.findOne({
      where: { id },
      relations: ['client', 'client.clientProfile', 'lawyer', 'lawyer.lawyerProfile'],
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    // Security Check: User must be either the client or lawyer
    if (role === UserRole.CLIENT && appointment.client.id !== userId) {
      throw new ForbiddenException('You do not have access to this appointment');
    }
    if (role === UserRole.LAWYER && appointment.lawyer.id !== userId) {
      throw new ForbiddenException('You do not have access to this appointment');
    }

    return appointment;
  }

  async updateStatus(id: string, userId: string, role: string, status: string) {
    const appointment = await this.findOne(id, userId, role);

    // Only lawyers can update status
    if (role !== UserRole.LAWYER) {
      throw new ForbiddenException('Only lawyers can update appointment status');
    }

    if (appointment.lawyer.id !== userId) {
      throw new ForbiddenException('You can only update appointments assigned to you');
    }

    // Validate status values
    const validStatuses = ['PENDING', 'CONFIRMED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    appointment.status = status;
    return this.apptRepo.save(appointment);
  }

  async cancelAppointment(id: string, userId: string, role: string) {
    const appointment = await this.findOne(id, userId, role);

    // Only clients can cancel
    if (role !== UserRole.CLIENT) {
      throw new ForbiddenException('Only clients can cancel appointments');
    }

    if (appointment.client.id !== userId) {
      throw new ForbiddenException('You can only cancel your own appointments');
    }

    // Can only cancel PENDING or CONFIRMED appointments
    if (appointment.status === 'REJECTED' || appointment.status === 'CANCELLED') {
      throw new BadRequestException(`Cannot cancel an appointment with status: ${appointment.status}`);
    }

    appointment.status = 'CANCELLED';
    return this.apptRepo.save(appointment);
  }
}