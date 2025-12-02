import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Case } from './case.entity';
import { ClientProfile } from './clientProfile.entity';

@Entity()
export class Client {
  // Switched to PrimaryGeneratedColumn for better relationship handling
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  file: string;

  @Column({ default: true })
  isActive: boolean;


  @OneToMany(() => Case, (userCase) => userCase.client)
  cases: Case[];

 
  @OneToOne(() => ClientProfile, (profile) => profile.client, { cascade: true })
  @JoinColumn()
  profile: ClientProfile;
}