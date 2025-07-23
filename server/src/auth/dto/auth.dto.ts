import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  TRAINER = 'TRAINER',
  PREMIUM_USER = 'PREMIUM_USER',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST',
}

export class RegisterDto {
  @IsOptional()
  @IsString()
  discordId?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AuthResponseDto {
  user: {
    id: string;
    username: string;
    email: string;
    discordId: string;
    avatar?: string | null;
  };
  token?: string;
  message: string;
}
