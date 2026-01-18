import { Controller, Get, Patch, Param, Request, UseGuards } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get()
  getMyNotifications(@Request() req) {
    return this.service.getUserNotifications(req.user.userId);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }
}