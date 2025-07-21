import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('🗄️ Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🗄️ Database disconnected');
  }

  // Helper method to clean up database for testing
  async cleanDatabase() {
    const modelNames = Reflect.ownKeys(this).filter(
      (key) =>
        key !== Symbol.for('nodejs.util.inspect.custom') &&
        typeof key === 'string' &&
        !key.startsWith('_') &&
        !key.startsWith('$'),
    );

    return Promise.all(
      modelNames.map((modelName) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
        (this as any)[modelName].deleteMany(),
      ),
    );
  }
}
