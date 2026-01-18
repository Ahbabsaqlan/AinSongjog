import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { User } from '../users/entities/user.entity';
import { NotificationService } from '../notifications/notifications.service';
import { AccountStatus } from '../common/enums/account-status.enum';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly apptRepo: Repository<Appointment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationService: NotificationService,
  ) {}

  // 1. Initial Booking (Client -> Lawyer)
  async bookAppointment(clientId: string, lawyerId: string, dateString: string) {
    const lawyer = await this.userRepo.findOne({ where: { id: lawyerId } });
    const client = await this.userRepo.findOne({ where: { id: clientId } });

    // FIX for Error: 'client/lawyer is possibly null'
    // Throwing an error here guarantees to TypeScript that if code continues, 
    // these variables are NOT null.
    if (!lawyer) throw new NotFoundException('Lawyer not found');
    if (!client) throw new NotFoundException('Client not found');

    if (lawyer.status !== AccountStatus.ACTIVE) {
      throw new ForbiddenException('Lawyer is not available');
    }

    // FIX for Error: 'No overload matches this call'
    // Pass the objects explicitly to ensure TypeORM uses the single-entity 'create' method
    const appt = this.apptRepo.create({
      client: client,
      lawyer: lawyer,
      scheduleDate: new Date(dateString),
      status: 'PENDING',
    });

    // FIX for Error: 'Property id does not exist on type Appointment[]'
    // We ensure 'saved' is treated as a single Appointment
    const saved = await this.apptRepo.save(appt);

    // Trigger Notification
    await this.notificationService.triggerNotification(
      lawyerId,
      'New Appointment Request',
      `${client.firstName} requested a consultation.`, // Now safe because we checked if client exists
      'APPOINTMENT',
      saved.id      
    );

    return saved;
  }

  // 2. Reschedule / Propose New Time
  async reschedule(id: string, userId: string, newDate: string) {
    const appt = await this.apptRepo.findOne({
      where: { id },
      relations: ['client', 'lawyer'],
    });

    if (!appt) throw new NotFoundException('Appointment not found');

    const isLawyer = appt.lawyer.id === userId;
    const recipientId = isLawyer ? appt.client.id : appt.lawyer.id;

    appt.status = isLawyer ? 'PROPOSED_BY_LAWYER' : 'PENDING';
    appt.scheduleDate = new Date(newDate);
    
    const saved = await this.apptRepo.save(appt);

    await this.notificationService.triggerNotification(
      recipientId,
      'Schedule Updated',
      `A new time has been proposed for your appointment.`,
      'APPOINTMENT',
      saved.id
    );

    return saved;
  }

  // 3. Confirm (Accepting the current proposal)
  async confirm(id: string, userId: string) {
    const appt = await this.apptRepo.findOne({ 
        where: { id }, 
        relations: ['client', 'lawyer'] 
    });

    if (!appt) throw new NotFoundException('Appointment not found');

    // Simple security logic
    if (appt.status === 'PROPOSED_BY_LAWYER' && appt.client.id !== userId) {
        throw new ForbiddenException('Only the client can accept this proposal');
    }
    if (appt.status === 'PENDING' && appt.lawyer.id !== userId) {
        throw new ForbiddenException('Only the lawyer can confirm this request');
    }

    appt.status = 'CONFIRMED';
    const saved = await this.apptRepo.save(appt);

    const recipientId = appt.lawyer.id === userId ? appt.client.id : appt.lawyer.id;
    await this.notificationService.triggerNotification(
      recipientId,
      'Appointment Confirmed',
      'Your legal consultation has been confirmed.',
      'APPOINTMENT',
      saved.id
    );

    return saved;
  }

  // 4. Cancel
  async cancel(id: string, userId: string) {
    const appt = await this.apptRepo.findOne({ 
        where: { id }, 
        relations: ['client', 'lawyer'] 
    });
    
    if (!appt) throw new NotFoundException('Appointment not found');
    
    if (appt.client.id !== userId && appt.lawyer.id !== userId) {
        throw new ForbiddenException('Not authorized to cancel this');
    }

    appt.status = 'CANCELLED';
    return this.apptRepo.save(appt);
  }

  async findAll(userId: string, role: string) {
    const query = { [role.toLowerCase()]: { id: userId } };
    return this.apptRepo.find({
      where: query,
      relations: ['client', 'lawyer', 'lawyer.lawyerProfile', 'client.clientProfile'],
      order: { createdAt: 'DESC' }, 
    });
  }
}