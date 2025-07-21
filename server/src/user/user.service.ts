import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll(take?: number, skip?: number) {
    return this.prisma.user.findMany({
      take,
      skip,
      include: {
        workouts: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        progress: {
          take: 5,
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

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        workouts: {
          include: {
            exercises: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        progress: {
          orderBy: { createdAt: 'desc' },
        },
        challenges: {
          include: {
            challenge: true,
          },
        },
        servers: {
          include: {
            server: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByDiscordId(discordId: string) {
    const user = await this.prisma.user.findUnique({
      where: { discordId },
      include: {
        workouts: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        progress: {
          take: 10,
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

  async remove(id: string) {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

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
        exercises: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

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
