import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LawyerProfile } from './entities/lawyer-profile.entity';
import { AccountStatus } from '../common/enums/account-status.enum';
import { UserRole } from '../common/enums/role.enum';
import { UpdateLawyerProfileDto } from './dto/update-profile.dto';
import { ClientProfile } from './entities/client-profile.entity';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(LawyerProfile) private profileRepo: Repository<LawyerProfile>,
    @InjectRepository(ClientProfile) private clientProfileRepo: Repository<ClientProfile>,
  ) {}

  async searchActiveLawyers(search: string) {
    const query = this.userRepo.createQueryBuilder('user')
      .leftJoinAndSelect('user.lawyerProfile', 'profile')
      .where('user.role = :role', { role: UserRole.LAWYER })
      .andWhere('user.status = :status', { status: AccountStatus.ACTIVE }); // Only ACTIVE

    if (search) {
      query.andWhere('(user.firstName ILIKE :s OR user.lastName ILIKE :s OR profile.chamberAddress ILIKE :s)', { s: `%${search}%` });
    }
    return query.getMany();
  }

  async updateLawyerProfile(userId: string, dto: UpdateLawyerProfileDto) {
    const profile = await this.profileRepo.findOne({ where: { user: { id: userId } } });
    if (!profile) throw new NotFoundException('Profile not found');

    // Update fields
    Object.assign(profile, dto);
    await this.profileRepo.save(profile);

    return { message: 'Profile updated. Please wait for Admin approval.' };
  }

  async updateClientProfile(userId: string, dto: UpdateClientProfileDto) {
    const profile = await this.clientProfileRepo.findOne({ where: { user: { id: userId } } });
    
    if (!profile) {
        // Fallback: create if not exists (for old users)
        const newProfile = this.clientProfileRepo.create({ ...dto, user: { id: userId } as User });
        await this.clientProfileRepo.save(newProfile);
    } else {
        Object.assign(profile, dto);
        await this.clientProfileRepo.save(profile);
    }

    return { message: 'Client profile updated successfully' };
  }
}