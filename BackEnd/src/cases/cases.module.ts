import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { Case } from './entities/case.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    // Cases need access to Case Table and User Table (to find clients)
    TypeOrmModule.forFeature([Case, User]) 
  ],
  controllers: [CasesController],
  providers: [CasesService],
  exports: [CasesService], // Export if other modules need it
})
export class CasesModule {}