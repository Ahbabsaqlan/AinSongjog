import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/role.enum';
import { NotificationService } from '../notifications/notifications.service';
import { AccountStatus } from 'src/common/enums/account-status.enum';


@Injectable()
export class AppointmentsService {
  
  constructor(
    @InjectRepository(Appointment) private apptRepo: Repository<Appointment>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private notificationService: NotificationService,
  ) {}

  async bookAppointment(clientId: string, lawyerId: string, dateString: string) {
    console.log(`[Booking] Client: ${clientId} attempting to book Lawyer: ${lawyerId}`);

    const lawyer = await this.userRepo.findOne({ where: { id: lawyerId } });
    const client = await this.userRepo.findOne({ where: { id: clientId } });

    if (!lawyer) throw new BadRequestException('Lawyer not found');
    if (!client) throw new BadRequestException('Client not found');

    // Check if the target is actually a lawyer
    if (lawyer.role !== UserRole.LAWYER) {
        console.error(`[Booking Failed] Target user ${lawyer.firstName} is a ${lawyer.role}, not a LAWYER`);
        throw new BadRequestException('Target user is not a lawyer');
    }

    // Check Status
    if (lawyer.status !== AccountStatus.ACTIVE) {
        console.error(`[Booking Failed] Lawyer ${lawyer.firstName} is ${lawyer.status}`);
        throw new ForbiddenException('Lawyer is not currently accepting appointments');
    }

    const appt = this.apptRepo.create({
        client,
        lawyer,
        scheduleDate: new Date(dateString),
        status: 'PENDING'
    });

    const savedAppt = await this.apptRepo.save(appt);

    // Send Notification
    await this.notificationService.triggerNotification(
      lawyerId,
      "New Appointment Request",
      `${client.firstName} requested a consultation.`
    );

    return savedAppt;
  }

  // 1. RESCHEDULE (Propose new time)
  async reschedule(id: string, userId: string, newDate: string) {
    const appt = await this.apptRepo.findOne({
      where: { id },
      relations: ['client', 'lawyer'],
    });

    if (!appt) throw new NotFoundException('Appointment not found');

    const dateObj = new Date(newDate);
    if (isNaN(dateObj.getTime())) throw new BadRequestException("Invalid date");

    // Logic: If Lawyer updates -> Status: PROPOSED_BY_LAWYER
    // Logic: If Client updates -> Status: PENDING (Reset to start)
    if (appt.lawyer.id === userId) {
      appt.status = 'PROPOSED_BY_LAWYER';
    } else if (appt.client.id === userId) {
      appt.status = 'PENDING';
    } else {
      throw new ForbiddenException('Not authorized');
    }

    appt.scheduleDate = dateObj;
    const savedAppt = await this.apptRepo.save(appt);

    // Notify the OTHER party
    const recipientId = appt.lawyer.id === userId ? appt.client.id : appt.lawyer.id;
    await this.notificationService.triggerNotification(
        recipientId,
        "Appointment Update",
        "A new time has been proposed for your appointment."
    );

    return savedAppt;
  }

  // 2. ACCEPT PROPOSAL (Confirm)
  async confirm(id: string, userId: string) {
    const appt = await this.apptRepo.findOne({
      where: { id },
      relations: ['client', 'lawyer'],
    });

    if (!appt) throw new NotFoundException('Appointment not found');

    // Only Client can accept a Lawyer's proposal
    if (appt.status === 'PROPOSED_BY_LAWYER' && appt.client.id !== userId) {
        throw new ForbiddenException("Only the client can accept this proposal");
    }
    
    // Only Lawyer can accept a Client's request (PENDING)
    if (appt.status === 'PENDING' && appt.lawyer.id !== userId) {
        throw new ForbiddenException("Only the lawyer can confirm this request");
    }

    appt.status = 'CONFIRMED';
    const savedAppt = await this.apptRepo.save(appt);

    // Notify Client
    await this.notificationService.triggerNotification(
        appt.client.id,
        "Appointment Confirmed",
        `Your consultation with ${appt.lawyer.lastName} is confirmed!`
    );

    return savedAppt;
  }

  // 3. CANCEL
  async cancel(id: string, userId: string) {
    const appt = await this.apptRepo.findOne({ where: { id }, relations: ['client', 'lawyer'] });
    if (!appt) throw new NotFoundException('Appointment not found');
    
    if (appt.client.id !== userId && appt.lawyer.id !== userId) {
        throw new ForbiddenException("Not authorized");
    }

    appt.status = 'CANCELLED';
    return this.apptRepo.save(appt);
  }
  
  // 4. GET MY APPOINTMENTS
  async findAll(userId: string, role: string) {
    const query = { [role.toLowerCase()]: { id: userId } };
    return this.apptRepo.find({ 
        where: query, 
        relations: ['client', 'lawyer', 'lawyer.lawyerProfile', 'client.clientProfile'],
        order: { scheduleDate: 'ASC' }
    });
  }
}