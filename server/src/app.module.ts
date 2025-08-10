/**
 * App Module - Root Module
 *
 * Main application module that orchestrates all feature modules and dependencies.
 * Serves as the central configuration point for the DiscordGym NestJS application.
 *
 * Integrated Modules:
 * - PrismaModule: Database ORM integration
 * - UserModule: User management and profiles
 * - DatabaseModule: Database operations and utilities
 * - WorkoutModule: Fitness tracking and workout management
 * - AuthModule: Authentication and authorization
 * - AdminModule: Administrative tools and user management
 * - FriendsModule: Social features and friend connections
 * - ChatModule: Real-time messaging and server communication
 *
 * Controllers:
 * - AppController: Root-level application endpoints
 * - HealthController: System health and monitoring endpoints
 *
 * @author DiscordGym Team
 */
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
    PrismaModule, // Database ORM and connection management
    UserModule, // User-related functionality and profiles
    DatabaseModule, // Database operations and utilities
    WorkoutModule, // Fitness tracking and workout management
    AuthModule, // Authentication and JWT handling
    AdminModule, // Administrative tools and user management
    FriendsModule, // Social features and friend connections
    ChatModule, // Real-time messaging and server communication
  ],
  controllers: [AppController, HealthController], // Root and health endpoints
  providers: [AppService, HealthService], // Core application and health services
})
export class AppModule {}
