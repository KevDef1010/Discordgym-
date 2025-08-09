import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { WorkoutModule } from './workout/workout.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { FriendsModule } from './friends/friends.module';
import { ChatModule } from './chat/chat.module';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    DatabaseModule,
    WorkoutModule,
    AuthModule,
    AdminModule,
    FriendsModule,
    ChatModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, HealthService],
})
export class AppModule {}
