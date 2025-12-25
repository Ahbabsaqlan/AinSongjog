import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('lawyer_profiles')
export class LawyerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // This should be the ONLY place for barCouncilId
  @Column({ nullable: true }) 
  barCouncilId: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ nullable: true })
  chamberAddress: string;

  @Column({ nullable: true })
  hourlyRate: number;

  @Column({ nullable: true })
  mobileNumber: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @OneToOne(() => User, (user) => user.lawyerProfile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}