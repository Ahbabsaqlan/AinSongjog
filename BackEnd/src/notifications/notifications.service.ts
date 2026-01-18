import { Injectable } from '@nestjs/common';
import Pusher from 'pusher'; 
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationService {
  private pusher: Pusher;

  constructor(
    @InjectRepository(Notification) private notificationRepo: Repository<Notification>,
  ) {
    this.pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID || '',
      key: process.env.PUSHER_KEY || '',
      secret: process.env.PUSHER_SECRET || '',
      cluster: process.env.PUSHER_CLUSTER || 'ap2',
      useTLS: true,
    });
  }

  async triggerNotification(userId: string, title: string, message: string, type?: string, referenceId?: string) {
    const notif = this.notificationRepo.create({ 
      userId, 
      title, 
      message, 
      type, 
      referenceId 
    });
    await this.notificationRepo.save(notif);
  
    try {
      await this.pusher.trigger(`user-${userId}`, 'notification', notif);
    } catch (e) { console.error(e); }
  }

  // New: Get User Notifications
  async getUserNotifications(userId: string) {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 20 // Limit to last 20
    });
  }

  // New: Mark as Read
  async markAsRead(id: string) {
    return this.notificationRepo.update(id, { isRead: true });
  }
}
