import {
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  IsEmail,
} from 'class-validator';

export class CreateClientDto {
  id: number;

  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'Name must not contain any special characters',
  })
  name: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/[a-z]/, {
    message: 'Password must contain at least one lowercase character',
  })
  password: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^01\d{9}$/, {
    message: 'Phone number must start with 01 and be 11 digits long',
  })
  phone: string;

  file: string;
}
