/**
 * Authentication Service
 *
 * Core authentication service providing user registration, login, JWT token management,
 * and account operations for the DiscordGym platform.
 *
 * Features:
 * - User registration with automatic ID generation
 * - Secure password hashing with bcrypt
 * - JWT token generation and validation
 * - Role-based access control (RBAC)
 * - Email domain-based role assignment
 * - Account existence validation
 * - Secure account deletion with protections
 * - Discord-style ID generation
 * - User-friendly display ID creation
 *
 * @author DiscordGym Team
 */
/* eslint-disable prettier/prettier */
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import { JwtPayload } from './jwt.strategy';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  /**
   * Constructor - Initialize authentication service
   * @param prisma - Prisma service for database operations
   * @param jwtService - JWT service for token management
   */
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Generate a Discord-style 18-digit ID
   * @returns Random 18-digit string ID
   */
  private generateDiscordId(): string {
    // Generate a random 18-digit Discord-like ID
    return Math.floor(
      Math.random() * 9000000000000000000 + 1000000000000000000,
    ).toString();
  }

  /**
   * Generate a user-friendly display ID in GitHub style
   * @param username - Base username for ID generation
   * @returns Formatted display ID (e.g., @username-gym123)
   */
  private generateDisplayId(username: string): string {
    // Generate a user-friendly display ID (GitHub-style)
    const suffixes = ['gym', 'fit', 'strong', 'power', 'beast', 'iron', 'flex', 'gains'];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const randomNumber = Math.floor(Math.random() * 999).toString().padStart(3, '0');
    return `@${username.toLowerCase()}-${randomSuffix}${randomNumber}`;
  }

  /**
   * Register a new user with automatic ID generation and role assignment
   * @param registerDto - Registration data transfer object
   * @returns Authentication response with user data and JWT token
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Generate Discord ID if not provided
    const discordId = registerDto.discordId || this.generateDiscordId();
    
    // Generate user-friendly display ID
    const displayId = this.generateDisplayId(registerDto.username);

    // Check if user already exists with any conflicting identifiers
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: registerDto.email },
          { discordId: discordId },
          { username: registerDto.username },
          { displayId: displayId },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === registerDto.email) {
        throw new ConflictException('Email already exists');
      }
      if (existingUser.discordId === registerDto.discordId) {
        throw new ConflictException('Discord ID already exists');
      }
      if (existingUser.username === registerDto.username) {
        throw new ConflictException('Username already exists');
      }
    }

    // Hash password securely with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // Determine role based on email domain for special access
    let userRole: UserRole = UserRole.MEMBER; // Default role
    
    if (registerDto.email.endsWith('@admin.de')) {
      userRole = UserRole.ADMIN;
    } else if (registerDto.email.endsWith('@superadmin.de')) {
      userRole = UserRole.SUPER_ADMIN;
    }

    // Create new user with generated IDs and role
    const user = await this.prisma.user.create({
      data: {
        discordId: discordId,
        displayId: displayId,
        username: registerDto.username,
        email: registerDto.email,
        password: hashedPassword,
        role: userRole, // Set role based on email domain
        avatar:
          registerDto.avatar ||
          `https://example.com/avatar/${registerDto.username}.png`,
      },
      select: {
        id: true,
        username: true,
        email: true,
        discordId: true,
        displayId: true,
        avatar: true,
        role: true, // Include role in response
        createdAt: true,
      },
    });

    // Generate JWT Token for new user
    const token = this.generateJwtToken(user);

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      user: user as any,
      token,
      message: 'Registration successful! Welcome to DiscordGym! 🏋️‍♂️',
    };
  }

  /**
   * Authenticate user login with email and password
   * @param loginDto - Login credentials data transfer object
   * @returns Authentication response with user data and JWT token
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user has a password set
    if (!user.password) {
      throw new UnauthorizedException('User has no password set');
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Remove password from response for security
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    // Generate JWT Token for authenticated user
    const token = this.generateJwtToken(userWithoutPassword);

    return {
      user: userWithoutPassword as { id: string; email: string; username: string; role: UserRole; discordId: string },
      token,
      message: 'Login successful! Welcome back! 💪',
    };
  }

  /**
   * Generate JWT token with user payload
   * @param user - User data for token payload
   * @returns Signed JWT token string
   */
  private generateJwtToken(user: { id: string; email: string; username: string; role: UserRole; discordId: string }): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  /**
   * Check if user exists with given identifiers
   * @param email - Email to check
   * @param username - Username to check
   * @param discordId - Optional Discord ID to check
   * @returns Object indicating existence and specific conflicts
   */
  async checkUserExists(email: string, username: string, discordId?: string) {
    const whereCondition: any[] = [{ email }, { username }];
    
    if (discordId) {
      whereCondition.push({ discordId });
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: whereCondition,
      },
      select: {
        email: true,
        username: true,
        discordId: true,
      },
    });

    return {
      exists: !!user,
      conflicts: user
        ? {
            email: user.email === email,
            username: user.username === username,
            discordId: discordId ? user.discordId === discordId : false,
          }
        : null,
    };
  }

  /**
   * Delete user account with protection for admin users
   * @param userId - ID of user to delete
   * @returns Confirmation message and deleted user info
   */
  async deleteAccount(userId: string) {
    // Find the user to ensure they exist
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent deletion of SUPER_ADMIN users for security
    if (user.role === 'SUPER_ADMIN') {
      throw new BadRequestException('Cannot delete SUPER_ADMIN users');
    }

    // Delete the user (cascade deletion handles related records)
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      message: 'Account successfully deleted',
      deletedUser: { id: user.id, username: user.username },
    };
  }
}
