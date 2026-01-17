import { Controller, Post, Body, UseGuards, Request, Get, Param, Patch, Delete, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  @Post('book')
  @Roles(UserRole.CLIENT)
  book(@Request() req, @Body() body: { lawyerId: string; date: string }) {
    return this.service.bookAppointment(req.user.userId, body.lawyerId, body.date);
  }

  @Get()
  getAppointments(@Request() req, @Query('status') status?: string) {
    return this.service.getAppointmentsForUser(req.user.userId, req.user.role, status);
  }

  @Get(':id')
  getOne(@Param('id') id: string, @Request() req) {
    return this.service.findOne(id, req.user.userId, req.user.role);
  }

  @Patch(':id/status')
  @Roles(UserRole.LAWYER)
  updateStatus(@Param('id') id: string, @Request() req, @Body() body: { status: string }) {
    return this.service.updateStatus(id, req.user.userId, req.user.role, body.status);
  }

  @Delete(':id')
  @Roles(UserRole.CLIENT)
  cancel(@Param('id') id: string, @Request() req) {
    return this.service.cancelAppointment(id, req.user.userId, req.user.role);
  }
}