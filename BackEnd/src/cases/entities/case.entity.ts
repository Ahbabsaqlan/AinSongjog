import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CaseEvent } from './case-event.entity';


export enum CaseStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  PENDING = 'PENDING'
}

@Entity('cases')
export class Case {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  caseNumber: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  hearingDate: Date | null;
  
  @Column({ type: 'enum', enum: CaseStatus, default: CaseStatus.OPEN })
  status: CaseStatus;

  @Column("text", { array: true, default: [] }) 
  documents: string[];
  
  // The Lawyer who manages the case
  @ManyToOne(() => User, { eager: true ,cascade: true})
  lawyer: User;

  // The Client assigned to the case
  @ManyToOne(() => User, { eager: true , cascade: true})
  client: User;

  @OneToMany(() => CaseEvent, (event) => event.case)
  events: CaseEvent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}