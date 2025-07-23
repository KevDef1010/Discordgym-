import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DatabaseService {
  constructor(private prisma: PrismaService) {}

  async promoteToSuperAdmin(email: string) {
    return await this.prisma.user.update({
      where: { email },
      data: { role: 'SUPER_ADMIN' }
    });
  }
}
