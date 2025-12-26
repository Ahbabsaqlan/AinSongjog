import { 
  BadRequestException, 
  ConflictException, 
  Injectable, 
  UnauthorizedException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';

import { User } from '../users/entities/user.entity';
import { Otp } from './entities/otp.entity';
import { LawyerProfile } from '../users/entities/lawyer-profile.entity'; // Import this
import { InitSignupDto, VerifyOtpDto, CompleteSignupDto } from './dto/signup.dto';
import { UserRole } from '../common/enums/role.enum';
import { AccountStatus } from '../common/enums/account-status.enum';
import { ClientProfile } from 'src/users/entities/client-profile.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Otp) private otpRepo: Repository<Otp>,
    @InjectRepository(LawyerProfile) private lawyerProfileRepo: Repository<LawyerProfile>, 
    @InjectRepository(ClientProfile) private clientProfileRepo: Repository<ClientProfile>,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async testMail() {
      await this.mailerService.sendMail({
        to: process.env.MAIL_USER,
        subject: 'Test OTP Email',
        text: 'If you received this, email works.',
      });
  
    return { ok: true };
  }

  // 1. Init Signup
  async initSignup(dto: InitSignupDto) {
    const existingUser = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existingUser) throw new ConflictException('Email already exists');

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.otpRepo.delete({ email: dto.email });

    const otpEntry = this.otpRepo.create({
      email: dto.email,
      otpCode,
      expiresAt,
      tempUserData: dto, 
    });
    
    await this.otpRepo.save(otpEntry);

    // Send Email
    try {
      await this.mailerService.sendMail({
        to: dto.email,
        subject: 'Verify your AinShongjog Account',
        template: './otp', 
        context: { 
          name: dto.firstName,
          otp: otpCode,
          year: new Date().getFullYear(),
        },
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      await this.otpRepo.delete({ email: dto.email });
      throw new InternalServerErrorException('Failed to send verification email.');
    }

    return { message: 'OTP sent successfully to your email' };
  }

  // 2. Verify OTP
  async verifyOtp(dto: VerifyOtpDto) {
    const record = await this.otpRepo.findOne({
      where: { email: dto.email },
      order: { createdAt: 'DESC' },
    });

    if (!record || record.otpCode !== dto.otp || new Date() > record.expiresAt) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const signupToken = this.jwtService.sign(
      { email: dto.email, purpose: 'signup-complete' },
      { secret: process.env.VERIFICATION_TOKEN_SECRET, expiresIn: '15m' },
    );

    return { message: 'OTP Verified', signupToken };
  }

  // 3. Complete Signup
  async completeSignup(dto: CompleteSignupDto) {
    try {
      this.jwtService.verify(dto.signupToken, { secret: process.env.VERIFICATION_TOKEN_SECRET });
    } catch (e) {
      throw new UnauthorizedException('Invalid signup session');
    }

    const record = await this.otpRepo.findOne({
      where: { email: dto.email },
      order: { createdAt: 'DESC' },
    });

    if (!record) throw new BadRequestException('Registration session expired');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const userData = record.tempUserData;

    const status = userData.role === UserRole.LAWYER ? AccountStatus.PENDING : AccountStatus.ACTIVE;

    // Create User
    const newUser = this.userRepo.create({
      ...(userData as Partial<User>),
      password: hashedPassword,
      status,
    });

    const savedUser = await this.userRepo.save(newUser);

    // If Lawyer, create empty profile shell
    if (savedUser.role === UserRole.LAWYER) {
        const profile = this.lawyerProfileRepo.create({ user: savedUser });
        await this.lawyerProfileRepo.save(profile);
    }

    if (savedUser.role === UserRole.CLIENT) {
      const profile = this.clientProfileRepo.create({ user: savedUser });
      await this.clientProfileRepo.save(profile);
    }
    await this.otpRepo.delete({ email: dto.email });

    return { message: 'Account created successfully', userId: savedUser.id };
  }

  // 4. Validate User (Local Strategy)
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userRepo.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'role', 'status', 'firstName', 'lastName'] 
    });

    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // 5. Login
  async login(user: any) {
    // REMOVED: The check that blocked PENDING users. 
    // Now Pending users can log in to update their profile.

    if (user.status === AccountStatus.BLOCKED) {
      throw new UnauthorizedException('Account has been blocked by Admin');
    }

    const payload = { 
      email: user.email, 
      sub: user.id || user.userId, 
      role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id || user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status // Frontend checks this. If PENDING -> Redirect to Profile Update
      },
    };
  }
}