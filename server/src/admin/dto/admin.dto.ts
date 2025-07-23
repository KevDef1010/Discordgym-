import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  TRAINER = 'TRAINER',
  PREMIUM_USER = 'PREMIUM_USER',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST',
}

export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}

export class UserSearchQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  take?: number;

  @IsOptional()
  skip?: number;
}

export class AdminUserResponseDto {
  id: string;
  discordId: string;
  username: string;
  email: string;
  displayId: string | null;
  avatar: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    workouts: number;
    challenges: number;
    servers: number;
  };
}

export class AdminStatsResponseDto {
  totalUsers: number;
  activeUsers: number;
  usersByRole: Record<UserRole, number>;
  recentRegistrations: number; // Last 7 days
  totalWorkouts: number;
  totalChallenges: number;
}
