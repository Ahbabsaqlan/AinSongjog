import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  @Post('book')
  @Roles(UserRole.CLIENT)
  book(@Request() req, @Body() body: { lawyerId: string; date: string }) {
    return this.service.bookAppointment(req.user.userId, body.lawyerId, body.date);
  }
}