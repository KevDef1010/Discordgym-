import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  private generateDiscordId(): string {
    // Generate a random 18-digit Discord-like ID
    return Math.floor(Math.random() * 9000000000000000000 + 1000000000000000000).toString();
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Generate Discord ID if not provided
    const discordId = registerDto.discordId || this.generateDiscordId();

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: registerDto.email },
          { discordId: discordId },
          { username: registerDto.username },
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
        avatar: true,
        createdAt: true,
      },
    });

    return {
      user,
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
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      message: 'Login successful! Welcome back! 💪',
    };
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
