/* eslint-disable prettier/prettier */
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import { JwtPayload } from './jwt.strategy';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private generateDiscordId(): string {
    // Generate a random 18-digit Discord-like ID
    return Math.floor(
      Math.random() * 9000000000000000000 + 1000000000000000000,
    ).toString();
  }

  private generateDisplayId(username: string): string {
    // Generate a user-friendly display ID (GitHub-style)
    const suffixes = ['gym', 'fit', 'strong', 'power', 'beast', 'iron', 'flex', 'gains'];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const randomNumber = Math.floor(Math.random() * 999).toString().padStart(3, '0');
    return `@${username.toLowerCase()}-${randomSuffix}${randomNumber}`;
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Generate Discord ID if not provided
    const discordId = registerDto.discordId || this.generateDiscordId();
    
    // Generate user-friendly display ID
    const displayId = this.generateDisplayId(registerDto.username);

    // Check if user already exists
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

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        discordId: discordId,
        displayId: displayId,
        username: registerDto.username,
        email: registerDto.email,
        password: hashedPassword,
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

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check password
    if (!user.password) {
      throw new UnauthorizedException('User has no password set');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    // Generate JWT Token
    const token = this.generateJwtToken(userWithoutPassword);

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      user: userWithoutPassword as any,
      token,
      message: 'Login successful! Welcome back! 💪',
    };
  }

  private generateJwtToken(user: any): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

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
}
