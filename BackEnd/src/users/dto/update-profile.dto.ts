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
}