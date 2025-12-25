import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/role.enum';
import { AccountStatus } from '../common/enums/account-status.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  @Get('pending-lawyers')
  async getPendingLawyers() {
    return this.userRepo.find({
      where: { role: UserRole.LAWYER, status: AccountStatus.PENDING },
      relations: ['lawyerProfile'], // <--- IMPORTANT: Load the profile details (BarID, etc)
    });
  }

  @Patch('approve-lawyer/:id')
  async approveLawyer(@Param('id') id: string) {
    await this.userRepo.update(id, { status: AccountStatus.ACTIVE });
    return { message: 'Lawyer approved successfully' };
  }
}