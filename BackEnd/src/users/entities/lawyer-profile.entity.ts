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

  @Column({ nullable: true }) 
  lawyerType: string; // e.g. "Advocate", "Barrister", "Senior Advocate"

  @Column({ nullable: true }) 
  currentWorkplace: string; // e.g. "Dhaka Judge Court"

  @Column({ type: 'text', nullable: true }) 
  educationalBackground: string; // e.g. "LLB (Hon's), LLM (Dhaka University)"

  @Column({ nullable: true }) 
  practiceAreas: string; // e.g. "Criminal Law, Civil Litigation, Family Law" (Comma separated)

  @OneToOne(() => User, (user) => user.lawyerProfile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}