import { IsString, IsOptional } from 'class-validator';

export class UpdateClientProfileDto {
  @IsOptional() @IsString() nid?: string;
  @IsOptional() @IsString() mobileNumber?: string;
  @IsOptional() @IsString() photoUrl?: string;
  @IsOptional() @IsString() address?: string;
}