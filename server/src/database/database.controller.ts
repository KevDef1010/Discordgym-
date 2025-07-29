import { Controller, Get, Post, Delete, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('database')
export class DatabaseController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('stats')
  async getStats() {
    const [users, workouts, exercises, challenges, progress] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.workout.count(),
        this.prisma.exercise.count(),
        this.prisma.challenge.count(),
        this.prisma.progress.count(),
      ]);

    return {
      message: 'DiscordGym Database Statistics',
      data: {
        users,
        workouts,
        exercises,
        challenges,
        progress,
        total: users + workouts + exercises + challenges + progress,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Post('seed-simple')
  async seedSimple() {
    try {
      // Clear existing data first
      await this.clearDatabase();

      // Create test users
      const user1 = await this.prisma.user.create({
        data: {
          discordId: '111111111111111111',
          username: 'FitnessKing',
          email: 'king@discordgym.com',
          avatar: 'https://example.com/avatar1.png',
        },
      });

      const user2 = await this.prisma.user.create({
        data: {
          discordId: '222222222222222222',
          username: 'CardioQueen',
          email: 'queen@discordgym.com',
          avatar: 'https://example.com/avatar2.png',
        },
      });

      // Create test workouts
      const workout1 = await this.prisma.workout.create({
        data: {
          userId: user1.id,
          name: 'Morning Strength Training',
          description: 'Upper body strength workout',
          type: 'STRENGTH',
          duration: 60,
          caloriesBurned: 350,
          exercises: {
            create: [
              {
                name: 'Bench Press',
                sets: 4,
                reps: 10,
                weight: 80,
                order: 1,
              },
              {
                name: 'Pull-ups',
                sets: 3,
                reps: 12,
                order: 2,
              },
            ],
          },
        },
        include: { exercises: true },
      });

      const workout2 = await this.prisma.workout.create({
        data: {
          userId: user2.id,
          name: 'Cardio Blast',
          description: 'High intensity cardio session',
          type: 'CARDIO',
          duration: 45,
          caloriesBurned: 400,
          exercises: {
            create: [
              {
                name: 'Running',
                duration: 1800, // 30 minutes
                distance: 5, // 5km
                order: 1,
              },
              {
                name: 'Cool down walk',
                duration: 900, // 15 minutes
                distance: 1, // 1km
                order: 2,
              },
            ],
          },
        },
        include: { exercises: true },
      });

      // Create progress entries
      const progress1 = await this.prisma.progress.create({
        data: {
          userId: user1.id,
          type: 'WEIGHT',
          value: 75.5,
          unit: 'kg',
          notes: 'Weekly weigh-in',
        },
      });

      const progress2 = await this.prisma.progress.create({
        data: {
          userId: user2.id,
          type: 'WEIGHT',
          value: 68.2,
          unit: 'kg',
          notes: 'Weekly weigh-in',
        },
      });

      return {
        message: 'Database seeded successfully! 🌱',
        data: {
          users: [user1, user2],
          workouts: [workout1, workout2],
          progress: [progress1, progress2],
        },
        stats: {
          totalUsers: 2,
          totalWorkouts: 2,
          totalExercises: 4,
          totalProgress: 2,
        },
      };
    } catch (error: unknown) {
      return {
        error: 'Failed to seed database',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Delete('clear')
  async clearDatabase() {
    try {
      // Delete in correct order to respect foreign keys
      await this.prisma.userChallenge.deleteMany();
      await this.prisma.challenge.deleteMany();
      await this.prisma.serverMember.deleteMany();
      await this.prisma.server.deleteMany();
      await this.prisma.exercise.deleteMany();
      await this.prisma.workout.deleteMany();
      await this.prisma.progress.deleteMany();
      await this.prisma.user.deleteMany();

      return {
        message: 'Database cleared successfully! 🧹',
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      return {
        error: 'Failed to clear database',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('users-with-data')
  async getUsersWithData() {
    return this.prisma.user.findMany({
      include: {
        workouts: {
          include: {
            exercises: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        progress: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            workouts: true,
            challenges: true,
            progress: true,
          },
        },
      },
    });
  }

  @Post('promote-admin')
  async promoteToAdmin(@Body() { email }: { email: string }) {
    return await this.prisma
      .$executeRaw`UPDATE users SET role = 'SUPER_ADMIN' WHERE email = ${email}`;
  }
}
