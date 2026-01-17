import { Controller, Post, Body, UseGuards, Request, Get, Param, Patch } from '@nestjs/common';
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

  @Post(':id/events')
  @Roles(UserRole.LAWYER)
  addEvent(@Param('id') id: string, @Request() req, @Body() body: any) {
    return this.casesService.addEvent(id, req.user.userId, body);
  }

  @Get()
  getMyCases(@Request() req) {
    return this.casesService.getCasesForUser(req.user.userId, req.user.role);
  }

  @Get(':id')
  getOne(@Param('id') id: string, @Request() req) {
    return this.casesService.findOne(id, req.user.userId);
  }

  @Patch('events/:eventId') // Route: /cases/events/123
  @Roles(UserRole.LAWYER)
  updateEvent(@Param('eventId') eventId: string, @Request() req, @Body() body: any) {
    return this.casesService.updateEvent(eventId, req.user.userId, body);
  }

  @Patch(':id/status')
  @Roles(UserRole.LAWYER)
  updateStatus(@Param('id') id: string, @Request() req, @Body() body: { status: string }) {
    return this.casesService.updateStatus(id, req.user.userId, body.status);
  }

  @Patch(':id/hearing-date')
  @Roles(UserRole.LAWYER)
  updateHearingDate(@Param('id') id: string, @Request() req, @Body() body: { hearingDate: string }) {
    return this.casesService.updateHearingDate(id, req.user.userId, body.hearingDate);
  }

  @Patch(':id/documents')
  @Roles(UserRole.LAWYER)
  addDocument(@Param('id') id: string, @Request() req, @Body() body: { url: string }) {
    return this.casesService.addDocument(id, req.user.userId, body.url);
  }
}