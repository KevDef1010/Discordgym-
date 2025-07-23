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

@Module({
  imports: [
    PrismaModule,
    UserModule,
    DatabaseModule,
    WorkoutModule,
    AuthModule,
    AdminModule,
    FriendsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
