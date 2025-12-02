import { IsString, IsNotEmpty } from 'class-validator';
export class CreateCaseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;
}