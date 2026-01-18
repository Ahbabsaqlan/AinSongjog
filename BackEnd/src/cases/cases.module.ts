import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { Case } from './entities/case.entity';
import { User } from '../users/entities/user.entity';
import { CaseEvent } from './entities/case-event.entity';
// 1. Import the NotificationsModule
import { NotificationsModule } from '../notifications/notifications.module'; 

@Module({
  imports: [
    // 2. Register Entities
    TypeOrmModule.forFeature([Case, User, CaseEvent]), 
    // 3. Add NotificationsModule here
    NotificationsModule 
  ],
  controllers: [CasesController],
  providers: [CasesService],
  exports: [CasesService],
})
export class CasesModule {}