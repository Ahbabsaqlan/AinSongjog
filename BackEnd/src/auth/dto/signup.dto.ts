import { IsEmail, IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../common/enums/role.enum';

export class InitSignupDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsDateString()
  dob: string;

  @IsEnum(UserRole)
  role: UserRole;
  
}

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  otp: string;
}

export class CompleteSignupDto {
  @IsEmail()
  email: string;

  @IsString()
  signupToken: string;

  @IsString()
  password: string;
}