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
import * as bcrypt from 'bcrypt';

import { User } from '../users/entities/user.entity';
import { Otp } from './entities/otp.entity';
import { LawyerProfile } from '../users/entities/lawyer-profile.entity';
import { InitSignupDto, VerifyOtpDto, CompleteSignupDto } from './dto/signup.dto';
import { UserRole } from '../common/enums/role.enum';
import { AccountStatus } from '../common/enums/account-status.enum';
import { ClientProfile } from 'src/users/entities/client-profile.entity';
import { EmailService } from '../email/email.service'; // <-- Import EmailService

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Otp) private otpRepo: Repository<Otp>,
    @InjectRepository(LawyerProfile) private lawyerProfileRepo: Repository<LawyerProfile>, 
    @InjectRepository(ClientProfile) private clientProfileRepo: Repository<ClientProfile>,
    private jwtService: JwtService,
    private emailService: EmailService, // <-- Replace MailerService with EmailService
  ) {}

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

    // Send Email using Resend API
    try {
      const emailSent = await this.emailService.sendOtpEmail(dto.email, otpCode);
      
      if (!emailSent) {
        await this.otpRepo.delete({ email: dto.email });
        throw new InternalServerErrorException('Failed to send verification email.');
      }
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
        
        // Send welcome email to lawyer
        try {
          await this.emailService.sendWelcomeEmail(
            savedUser.email, 
            `${savedUser.firstName} ${savedUser.lastName}`
          );
        } catch (emailError) {
          console.error('Welcome email failed:', emailError);
          // Don't throw error, just log it
        }
    }

    if (savedUser.role === UserRole.CLIENT) {
      const profile = this.clientProfileRepo.create({ user: savedUser });
      await this.clientProfileRepo.save(profile);
      
      // Send welcome email to client
      try {
        await this.emailService.sendWelcomeEmail(
          savedUser.email, 
          `${savedUser.firstName} ${savedUser.lastName}`
        );
      } catch (emailError) {
        console.error('Welcome email failed:', emailError);
        // Don't throw error, just log it
      }
    }
    
    await this.otpRepo.delete({ email: dto.email });

    return { 
      message: 'Account created successfully', 
      userId: savedUser.id,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
        status: savedUser.status
      }
    };
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
        status: user.status
      },
    };
  }

  // 6. Forgot Password (Optional - you can add later)
    // 6. Forgot Password
    async forgotPassword(email: string) {
      const user = await this.userRepo.findOne({ 
        where: { email },
        select: ['id', 'email', 'firstName', 'lastName']
      });
      
      if (!user) {
        // For security, don't reveal if user exists or not
        return { message: 'If an account exists, a reset email has been sent' };
      }
  
      const resetToken = this.jwtService.sign(
        { 
          sub: user.id, 
          email: user.email,
          purpose: 'password-reset' 
        },
        { 
          secret: process.env.RESET_TOKEN_SECRET || 'reset-secret',
          expiresIn: '15m' 
        },
      );
  
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
      // Send reset email using Resend
      try {
        const emailSent = await this.emailService.sendPasswordResetEmail(
          user.email, 
          resetLink, 
          user.firstName || 'User'
        );
        
        if (!emailSent) {
          throw new InternalServerErrorException('Failed to send reset email');
        }
        
        return { 
          message: 'Password reset email sent successfully',
          note: 'Check your email for the reset link (valid for 15 minutes)'
        };
      } catch (error) {
        console.error('Password reset email error:', error);
        throw new InternalServerErrorException('Failed to send reset email');
      }
    }
  
    // 7. Reset Password (Optional - you can add this later)
    async resetPassword(token: string, newPassword: string) {
      try {
        const payload = this.jwtService.verify(token, {
          secret: process.env.RESET_TOKEN_SECRET || 'reset-secret'
        });
  
        if (payload.purpose !== 'password-reset') {
          throw new UnauthorizedException('Invalid token');
        }
  
        const userId = payload.sub;
        const hashedPassword = await bcrypt.hash(newPassword, 10);
  
        await this.userRepo.update(userId, { password: hashedPassword });
  
        return { message: 'Password reset successfully' };
        
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Reset token has expired');
        }
        throw new UnauthorizedException('Invalid reset token');
      }
    }
}