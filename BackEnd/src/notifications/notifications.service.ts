import { Injectable } from '@nestjs/common';
import Pusher from 'pusher'; 

@Injectable()
export class NotificationService {
  private pusher: Pusher;

  constructor() {
    this.pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID || '',
      key: process.env.PUSHER_KEY || '',
      secret: process.env.PUSHER_SECRET || '',
      cluster: process.env.PUSHER_CLUSTER || 'ap2',
      useTLS: true,
    });
  }

  async triggerNotification(userId: string, title: string, message: string) {
    if (!userId) return; // Safety check
    
    try {
      await this.pusher.trigger(`user-${userId}`, 'notification', {
        title,
        message,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Pusher Error:", error);
    }
  }
}