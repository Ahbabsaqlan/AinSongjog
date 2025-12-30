import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case } from './entities/case.entity';
import { User } from '../users/entities/user.entity';
import { AccountStatus } from '../common/enums/account-status.enum';
import { UserRole } from '../common/enums/role.enum';

@Injectable()
export class CasesService {
  constructor(
    @InjectRepository(Case) private caseRepo: Repository<Case>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async createCase(lawyerId: string, data: { clientEmail: string; title: string; caseNumber: string }) {
    // 1. Verify Lawyer
    const lawyer = await this.userRepo.findOne({ where: { id: lawyerId } });
    
    if (!lawyer) throw new NotFoundException('Lawyer not found'); // Fix: Null check
    if (lawyer.status !== AccountStatus.ACTIVE) {
        throw new ForbiddenException('You must be an Active lawyer to create cases');
    }

    // 2. Find Client
    const client = await this.userRepo.findOne({ where: { email: data.clientEmail } });
    if (!client) throw new NotFoundException('Client email not found');

    // 3. Create Case
    const newCase = this.caseRepo.create({
        title: data.title,
        caseNumber: data.caseNumber,
        lawyer: lawyer, // Pass the FULL entity object
        client: client  // Pass the FULL entity object
    });

    return this.caseRepo.save(newCase);
  }

  async getCasesForUser(userId: string, role: string) {
    if (role === UserRole.LAWYER) {
        return this.caseRepo.find({ where: { lawyer: { id: userId } } });
    } else {
        return this.caseRepo.find({ where: { client: { id: userId } } });
    }
  }

  async findOne(id: string, userId: string) {
    const caseItem = await this.caseRepo.findOne({
      where: { id },
      relations: ['lawyer', 'lawyer.lawyerProfile', 'client', 'client.clientProfile'], // Load ALL details
    });

    if (!caseItem) throw new NotFoundException('Case not found');

    // Security Check: Is the requester the Lawyer OR the Client?
    if (caseItem.lawyer.id !== userId && caseItem.client.id !== userId) {
      throw new ForbiddenException('You do not have access to this case');
    }

    return caseItem;
  }

  // 2. UPDATE STATUS (Lawyer Only)
  async updateStatus(id: string, userId: string, status: string) {
    const caseItem = await this.findOne(id, userId); // Re-use security check

    if (caseItem.lawyer.id !== userId) {
      throw new ForbiddenException('Only the assigned lawyer can update status');
    }

    caseItem.status = status as any;
    return this.caseRepo.save(caseItem);
  }
}