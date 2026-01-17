import { Module } from '@nestjs/common';
import { NotificationService } from './notifications.service';

@Module({
  providers: [NotificationService],
  exports: [NotificationService], // <--- This allows other modules to use it
})
export class NotificationsModule {}