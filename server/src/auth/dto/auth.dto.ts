import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsIn,
} from 'class-validator';

// Define UserRole as string literals that match Prisma schema
export const USER_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'MODERATOR',
  'TRAINER',
  'PREMIUM_USER',
  'MEMBER',
  'GUEST',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

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
  @IsIn(USER_ROLES)
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
    role?: UserRole;
    createdAt?: Date;
  };
  token?: string;
  message: string;
}
