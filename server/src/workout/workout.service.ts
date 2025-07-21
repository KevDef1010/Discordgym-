import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutDto, UpdateWorkoutDto } from './dto/workout.dto';

@Injectable()
export class WorkoutService {
  constructor(private prisma: PrismaService) {}

  async create(createWorkoutDto: CreateWorkoutDto) {
    const { exercises, ...workoutData } = createWorkoutDto;

    return this.prisma.workout.create({
      data: {
        ...workoutData,
        exercises: exercises
          ? {
              create: exercises.map((exercise, index) => ({
                ...exercise,
                order: exercise.order ?? index,
              })),
            }
          : undefined,
      },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
        },
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }

  async findAll(take?: number, skip?: number) {
    return this.prisma.workout.findMany({
      take,
      skip,
      include: {
        exercises: {
          orderBy: { order: 'asc' },
        },
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const workout = await this.prisma.workout.findUnique({
      where: { id },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
        },
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    if (!workout) {
      throw new NotFoundException(`Workout with ID ${id} not found`);
    }

    return workout;
  }

  async update(id: string, updateWorkoutDto: UpdateWorkoutDto) {
    try {
      return await this.prisma.workout.update({
        where: { id },
        data: updateWorkoutDto,
        include: {
          exercises: {
            orderBy: { order: 'asc' },
          },
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });
    } catch {
      throw new NotFoundException(`Workout with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.workout.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException(`Workout with ID ${id} not found`);
    }
  }

  async getWorkoutsByUser(userId: string) {
    return this.prisma.workout.findMany({
      where: { userId },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWorkoutStats(userId: string) {
    const stats = await this.prisma.workout.aggregate({
      where: { userId },
      _count: {
        id: true,
      },
      _sum: {
        duration: true,
        caloriesBurned: true,
      },
    });

    const workoutsByType = await this.prisma.workout.groupBy({
      by: ['type'],
      where: { userId },
      _count: {
        type: true,
      },
    });

    return {
      totalWorkouts: stats._count.id,
      totalDuration: stats._sum.duration || 0,
      totalCalories: stats._sum.caloriesBurned || 0,
      workoutsByType,
    };
  }
}
