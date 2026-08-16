import { IsEmail, MinLength } from 'class-validator';
import type { LoginDto, RegisterDto } from '@aprendaufu/shared-types';

export class RegisterBody implements RegisterDto {
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}

export class LoginBody implements LoginDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}
