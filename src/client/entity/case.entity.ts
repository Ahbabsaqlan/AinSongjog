import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Client } from './client.entity';

@Entity()
export class Case {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  caseTitle: string;

  @Column()
  description: string;

  @Column({ default: 'Pending' })
  status: string;

  @ManyToOne(() => Client, (client) => client.cases)
  client: Client;
}