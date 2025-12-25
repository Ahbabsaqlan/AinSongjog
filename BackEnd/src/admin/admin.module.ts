import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { User } from '../users/entities/user.entity';

@Module({
  // Admin module also needs access to the User table
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AdminController],
})
export class AdminModule {}