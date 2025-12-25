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
}