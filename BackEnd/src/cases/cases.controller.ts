import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { CasesService } from './cases.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('cases')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post()
  @Roles(UserRole.LAWYER)
  createCase(@Request() req, @Body() body: { clientEmail: string; title: string; caseNumber: string }) {
    return this.casesService.createCase(req.user.userId, body);
  }

  @Get()
  getMyCases(@Request() req) {
    return this.casesService.getCasesForUser(req.user.userId, req.user.role);
  }
}