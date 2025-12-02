import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Client } from './client.entity';

@Entity()
export class ClientProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  nationalId: string;

  @OneToOne(() => Client, (client) => client.profile, { onDelete: 'CASCADE' })
  client: Client;
}