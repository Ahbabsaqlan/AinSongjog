import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  title: string;

  @Column()
  message: string;

  // NEW FIELDS
  @Column({ nullable: true })
  type: string; // e.g., "APPOINTMENT", "CASE_UPDATE"

  @Column({ nullable: true })
  referenceId: string; // The ID of the Case or Appointment

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}