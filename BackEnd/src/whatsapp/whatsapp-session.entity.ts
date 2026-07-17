import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('whatsapp_sessions')
export class WhatsappSession {
  @PrimaryColumn()
  sessionId: string; // This will be the userId

  @Column('jsonb')
  creds: any; // Stores the auth credentials
}