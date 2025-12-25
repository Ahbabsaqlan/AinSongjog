import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  scheduleDate: Date;

  @Column({ default: 'PENDING' }) // PENDING, CONFIRMED, REJECTED
  status: string;

  @ManyToOne(() => User, (user) => user.id)
  client: User;

  @ManyToOne(() => User, (user) => user.id)
  lawyer: User;

  @CreateDateColumn()
  createdAt: Date;
}