import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { LawyerProfile } from './entities/lawyer-profile.entity'; // Import
import { ClientProfile } from './entities/client-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, LawyerProfile,ClientProfile])], // Add LawyerProfile here
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}