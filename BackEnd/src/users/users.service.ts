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
import { Brackets } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(LawyerProfile) private profileRepo: Repository<LawyerProfile>,
    @InjectRepository(ClientProfile) private clientProfileRepo: Repository<ClientProfile>,
  ) {}

  async findOne(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      // IMPORTANT: Load relations so the frontend knows the Bar ID / NID
      relations: ['lawyerProfile', 'clientProfile'], 
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // NEW: Get specific user by ID (Public Profile)
  async getUserById(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      // Load both profiles so this endpoint works for checking Clients or Lawyers
      relations: ['lawyerProfile', 'clientProfile'], 
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Safety: Ensure password is removed (TypeORM usually does this if select: false, but good to be safe)
    const { password, ...safeUser } = user as any;
    return safeUser;
  }
  
  async searchActiveLawyers(search: string) {
    const queryBuilder = this.userRepo.createQueryBuilder('user')
      .leftJoinAndSelect('user.lawyerProfile', 'profile') // Join the profile
      .where('user.role = :role', { role: UserRole.LAWYER })
      .andWhere('user.status = :status', { status: AccountStatus.ACTIVE });

    if (search) {
      // Use Brackets to wrap OR conditions correctly
      queryBuilder.andWhere(new Brackets(qb => {
        qb.where('user.firstName ILIKE :search', { search: `%${search}%` })
          .orWhere('user.lastName ILIKE :search', { search: `%${search}%` })
          // SEARCH LOCATION (Chamber Address, Workplace)
          .orWhere('profile.chamberAddress ILIKE :search', { search: `%${search}%` })
          .orWhere('profile.currentWorkplace ILIKE :search', { search: `%${search}%` })
          // SEARCH EXPERTISE (Practice Areas)
          .orWhere('profile.practiceAreas ILIKE :search', { search: `%${search}%` });
      }));
    }

    return queryBuilder.getMany();
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