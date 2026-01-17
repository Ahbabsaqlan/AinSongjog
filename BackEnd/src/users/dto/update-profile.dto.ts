import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateLawyerProfileDto {
  @IsOptional() 
  @IsString() 
  barCouncilId?: string;

  @IsOptional() 
  @IsString() 
  chamberAddress?: string;

  @IsOptional() 
  @IsNumber() 
  hourlyRate?: number;

  @IsOptional() 
  @IsString() 
  mobileNumber?: string;

  @IsOptional() 
  @IsString() 
  bio?: string;

  @IsOptional() 
  @IsString() 
  photoUrl?: string;

  @IsOptional() @IsString() lawyerType?: string;
  @IsOptional() @IsString() currentWorkplace?: string;
  @IsOptional() @IsString() educationalBackground?: string;
  @IsOptional() @IsString() practiceAreas?: string;
}