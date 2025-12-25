import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn ,OneToOne} from 'typeorm';
import { UserRole } from '../../common/enums/role.enum';
import { AccountStatus } from '../../common/enums/account-status.enum';
import { LawyerProfile } from './lawyer-profile.entity';
import { ClientProfile } from './client-profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // Do not return password in API responses
  password: string;

  @Column({ type: 'date' })
  dob: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  status: AccountStatus;

  @OneToOne(() => LawyerProfile, (profile) => profile.user)
  lawyerProfile: LawyerProfile;
  
  @OneToOne(() => ClientProfile, (profile) => profile.user)
  clientProfile: ClientProfile;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


}