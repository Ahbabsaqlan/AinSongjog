import { IsString, IsEmail, MinLength, Matches, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateClientDto {
  
  @IsString()
  name: string;

  @IsNotEmpty()
  @MinLength(6)
  @Matches(/[a-z]/, { message: 'Password must contain lowercase letter' })
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(/^01\d{9}$/)
  phone: string;

  
  @IsOptional()
  address: string;

  @IsOptional()
  nationalId: string;

  file: string;
}