// forget-password.dto.ts
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class ForgetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
