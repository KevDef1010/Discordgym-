/**
 * Admin Service
 *
 * Administrative service providing comprehensive user management, system statistics,
 * and platform oversight capabilities for DiscordGym administrators.
 *
 * Features:
 * - User search and filtering with pagination
 * - Role-based user management and updates
 * - User account status management (activate/deactivate)
 * - Secure user deletion with protections
 * - System statistics and analytics
 * - User details and activity tracking
 * - Comprehensive user data retrieval
 * - Admin-level security validations
 *
 * @author DiscordGym Team
 */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
 
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from './dto/admin.dto';

@Injectable()
export class AdminService {
  /**
   * Constructor - Initialize admin service
   * @param prisma - Prisma service for database operations
   */
  constructor(private prisma: PrismaService) {}

  /**
   * Find users with search, filtering, and pagination capabilities
   * @param params - Search and pagination parameters
   * @returns Paginated user results with counts and metadata
   */
  async findUsers(params: {
    search?: string;
    role?: string;
    take: number;
    skip: number;
  }) {
    const { search, role, take, skip } = params;
    
    const where: any = {};
    
    // Build search conditions for multiple fields
    if (search) {
      where.OR = [
        { username: { contains: search } },
        { email: { contains: search } },
        { discordId: { contains: search } },
      ];
    }
    
    // Filter by specific role if provided
    if (role) {
      where.role = role;
    }

    // Execute parallel queries for users and total count
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        take,
        skip,
        include: {
          _count: {
            select: {
              workouts: true,
              challenges: true,
              servers: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      hasMore: skip + take < total,
    };
  }

  /**
   * Search users by query string across multiple fields
   * @param query - Search query string
   * @returns Array of matching users with basic information
   */
  async searchUsers(query: string) {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query } },
          { email: { contains: query } },
          { discordId: { contains: query } },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
      take: 20, // Limit results for performance
      orderBy: { username: 'asc' },
    });

    return users;
  }

  /**
   * Get detailed information about a specific user
   * @param id - User ID to retrieve details for
   * @returns Comprehensive user data including workouts and activity
   */
  async getUserDetails(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        workouts: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            type: true,
            date: true,
            duration: true,
            caloriesBurned: true,
          },
        },
        challenges: {
          take: 10,
          orderBy: { joinedAt: 'desc' },
          include: {
            challenge: {
              select: {
                id: true,
                name: true,
                type: true,
                endDate: true,
              },
            },
          },
        },
        servers: {
          take: 10,
          include: {
            server: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
          },
        },
        _count: {
          select: {
            workouts: true,
            challenges: true,
            servers: true,
            progress: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserRole(id: string, role: UserRole) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { role: role as any },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return {
      message: `User role updated to ${role}`,
      user: updatedUser,
    };
  }

  async toggleUserStatus(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentUser = await this.prisma.user.findUnique({
      where: { id },
    });

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: !currentUser?.isActive },
      select: {
        id: true,
        username: true,
        updatedAt: true,
      },
    });

    return {
      message: `User status updated`,
      user: updatedUser,
    };
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const fullUser = await this.prisma.user.findUnique({
      where: { id },
    });

    // Prevent deletion of SUPER_ADMIN users
    if (fullUser?.role === 'SUPER_ADMIN') {
      throw new BadRequestException('Cannot delete SUPER_ADMIN users');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return {
      message: `User ${user.username} has been deleted`,
      deletedUser: { id: user.id, username: user.username },
    };
  }

  async getAdminStats() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalUsers,
      recentRegistrations,
      totalWorkouts,
      totalChallenges,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      this.prisma.workout.count(),
      this.prisma.challenge.count(),
    ]);

    return {
      totalUsers,
      recentRegistrations,
      totalWorkouts,
      totalChallenges,
    };
  }
}
