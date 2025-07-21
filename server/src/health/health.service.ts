import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    try {
      // Test database connection
      await this.prisma.user.count();

      return {
        status: 'OK',
        database: 'Connected',
        timestamp: new Date().toISOString(),
        message: 'DiscordGym API is running! 🏋️‍♂️',
      };
    } catch (error: unknown) {
      return {
        status: 'Error',
        database: 'Disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
