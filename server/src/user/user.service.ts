/**
 * User Service
 *
 * Core service for user management operations including CRUD operations,
 * user data retrieval, workout tracking, and progress monitoring.
 *
 * Features:
 * - User creation and management
 * - Comprehensive user data retrieval with relationships
 * - User lookup by ID and Discord ID
 * - User profile updates
 * - User account deletion
 * - Workout history management
 * - Progress tracking and analytics
 * - Pagination support for large datasets
 * - Relationship-aware data fetching
 *
 * @author DiscordGym Team
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  /**
   * Constructor - Initialize user service
   * @param prisma - Prisma service for database operations
   */
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new user account
   * @param createUserDto - User creation data transfer object
   * @returns Created user object
   */
  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  /**
   * Retrieve all users with pagination and related data
   * @param take - Number of users to retrieve (optional)
   * @param skip - Number of users to skip for pagination (optional)
   * @returns Array of users with workouts, progress, and counts
   */
  async findAll(take?: number, skip?: number) {
    return this.prisma.user.findMany({
      take,
      skip,
      include: {
        workouts: {
          take: 5, // Limit recent workouts for performance
          orderBy: { createdAt: 'desc' },
        },
        progress: {
          take: 5, // Limit recent progress entries
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            workouts: true,
            challenges: true,
          },
        },
      },
    });
  }

  /**
   * Find a specific user by ID with comprehensive data
   * @param id - User ID to search for
   * @returns User object with all related data
   * @throws NotFoundException if user not found
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        workouts: {
          include: {
            exercises: true, // Include exercise details
          },
          orderBy: { createdAt: 'desc' },
        },
        progress: {
          orderBy: { createdAt: 'desc' },
        },
        challenges: {
          include: {
            challenge: true, // Include challenge details
          },
        },
        servers: {
          include: {
            server: true, // Include server details
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Find user by Discord ID with workout and progress data
   * @param discordId - Discord ID to search for
   * @returns User object with recent workouts and progress
   * @throws NotFoundException if user not found
   */
  async findByDiscordId(discordId: string) {
    const user = await this.prisma.user.findUnique({
      where: { discordId },
      include: {
        workouts: {
          take: 10, // Limit recent workouts
          orderBy: { createdAt: 'desc' },
        },
        progress: {
          take: 10, // Limit recent progress entries
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(
        `User with Discord ID ${discordId} not found`,
      );
    }

    return user;
  }

  /**
   * Update user information
   * @param id - User ID to update
   * @param updateUserDto - Updated user data
   * @returns Updated user object
   * @throws NotFoundException if user not found
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  /**
   * Delete a user account
   * @param id - User ID to delete
   * @returns Deleted user object
   * @throws NotFoundException if user not found
   */
  async remove(id: string) {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  /**
   * Get all workouts for a specific user
   * @param id - User ID to get workouts for
   * @returns Array of user's workouts with exercise details
   * @throws NotFoundException if user not found
   */
  async getUserWorkouts(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prisma.workout.findMany({
      where: { userId: id },
      include: {
        exercises: true, // Include detailed exercise information
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get progress tracking data for a specific user
   * @param id - User ID to get progress for
   * @returns Array of user's progress entries ordered by date
   * @throws NotFoundException if user not found
   */
  async getUserProgress(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prisma.progress.findMany({
      where: { userId: id },
      orderBy: { date: 'desc' },
    });
  }
}
