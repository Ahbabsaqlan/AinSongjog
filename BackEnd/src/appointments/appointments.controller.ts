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

  // --- BOOKING ENDPOINT ---
  @Post('book')
  @Roles(UserRole.CLIENT) // <--- CRITICAL: Must be CLIENT
  book(@Request() req, @Body() body: { lawyerId: string; date: string }) {
    console.log("Booking Request from:", req.user); // Debug Log
    return this.service.bookAppointment(req.user.userId, body.lawyerId, body.date);
  }

  @Patch(':id/reschedule')
  @UseGuards(JwtAuthGuard) // Both roles can access
  reschedule(@Param('id') id: string, @Request() req, @Body() body: { date: string }) {
    return this.service.reschedule(id, req.user.userId, body.date);
  }

  @Patch(':id/confirm')
  @UseGuards(JwtAuthGuard)
  confirm(@Param('id') id: string, @Request() req) {
    return this.service.confirm(id, req.user.userId);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancel(@Param('id') id: string, @Request() req) {
    return this.service.cancel(id, req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getAll(@Request() req) {
    return this.service.findAll(req.user.userId, req.user.role);
  }
}