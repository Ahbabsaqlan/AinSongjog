import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Case } from './case.entity';

@Entity('case_events')
export class CaseEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string; // e.g. "Case Filed", "Hearing", "Verdict"

  @Column({ type: 'timestamp' })
  eventDate: Date; // Stores Date AND Time

  @Column({ nullable: true })
  location: string; // e.g. "High Court, Room 404"

  @Column({ type: 'text', nullable: true })
  notes: string; // e.g. "Judge requested documents."

  @Column("text", { array: true, default: [] }) 
  attachments: string[]; // Array of file URLs or paths

  

  @ManyToOne(() => Case, (c) => c.events, { onDelete: 'CASCADE' })
  case: Case;

  @CreateDateColumn()
  createdAt: Date;
}