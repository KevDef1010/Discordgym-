/**
 * Prisma Service
 *
 * Database service providing Prisma ORM integration and connection management
 * for the DiscordGym application. Handles database lifecycle, logging, and utilities.
 *
 * Features:
 * - Automatic database connection on module initialization
 * - Graceful disconnection on module destruction
 * - Comprehensive query logging (query, info, warn, error)
 * - Database cleanup utilities for testing
 * - Connection status monitoring
 * - Prisma client configuration and management
 *
 * @author DiscordGym Team
 */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * Constructor - Initialize Prisma client with logging configuration
   */
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'], // Enable comprehensive logging
    });
  }

  /**
   * Module initialization lifecycle hook
   * Establishes database connection when the module starts
   */
  async onModuleInit() {
    await this.$connect();
    console.log('🗄️ Database connected successfully');
  }

  /**
   * Module destruction lifecycle hook
   * Gracefully closes database connection when the module shuts down
   */
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🗄️ Database disconnected');
  }

  /**
   * Helper method to clean up database for testing purposes
   * Deletes all data from all models - USE WITH CAUTION
   * @returns Promise that resolves when all data is deleted
   */
  async cleanDatabase() {
    // Get all model names from Prisma client
    const modelNames = Reflect.ownKeys(this).filter(
      (key) =>
        key !== Symbol.for('nodejs.util.inspect.custom') &&
        typeof key === 'string' &&
        !key.startsWith('_') &&
        !key.startsWith('$'),
    );

    // Delete all records from each model
    return Promise.all(
      modelNames.map((modelName) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
        (this as any)[modelName].deleteMany(),
      ),
    );
  }
}
