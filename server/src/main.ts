/**
 * DiscordGym Server Application Entry Point
 *
 * Main bootstrap file for the NestJS application that handles server initialization,
 * security setup, and application configuration.
 *
 * Features:
 * - Production security setup with authentication prompts
 * - Database password configuration
 * - Admin credential verification
 * - CORS configuration for frontend integration
 * - WebSocket adapter setup for real-time communication
 * - Global validation pipe configuration
 * - Environment-specific startup procedures
 *
 * @author DiscordGym Team
 */
/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { PasswordPrompt } from './utils/password-prompt';

/**
 * Setup security configurations for production environment
 * Handles database password configuration and admin authentication
 *
 * @returns Promise<void> Resolves when security setup is complete
 */
async function setupSecurity(): Promise<void> {
  // Only run security setup in production mode
  if (process.env.NODE_ENV !== 'production') {
    console.log('🚀 Development mode - skipping security prompts');
    return;
  }

  const passwordPrompt = new PasswordPrompt();
  
  try {
    // 1. Database password setup and configuration
    const dbPassword = await passwordPrompt.promptDatabasePassword();
    
    // Replace placeholder in DATABASE_URL with actual password
    process.env.DATABASE_URL = process.env.DATABASE_URL?.replace('__DB_PASSWORD__', dbPassword);
    
    if (!process.env.DATABASE_URL?.includes(dbPassword)) {
      console.log('❌ Failed to configure database connection');
      process.exit(1);
    }
    
    // 2. Admin authentication and credential verification
    const { username, password } = await passwordPrompt.promptUserAuthentication();
    
    if (!passwordPrompt.verifyAdminCredentials(username, password)) {
      console.log('❌ Invalid admin credentials!');
      console.log('💡 Valid usernames: admin, discordgym');
      process.exit(1);
    }
    
    console.log('✅ Authentication successful!');
    console.log(`👤 Logged in as: ${username}`);
    
  } catch (error) {
    console.error('❌ Security setup failed:', error);
    process.exit(1);
  } finally {
    passwordPrompt.close();
  }
}

/**
 * Bootstrap function to initialize and configure the NestJS application
 * Handles all startup procedures including security, CORS, validation, and server startup
 */
async function bootstrap() {
  // Setup security before starting the application
  await setupSecurity();
  
  const app = await NestFactory.create(AppModule);
  
  // Enable Socket.IO adapter for real-time communication
  app.useWebSocketAdapter(new IoAdapter(app));
  
  // Enable CORS for frontend integration with comprehensive configuration
  app.enableCors({
    origin: true, // Allow all origins for development (restrict in production)
    credentials: true, // Allow cookies and credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'], // Allowed headers
  });
  
  // Enable global validation pipes for automatic DTO validation
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(process.env.PORT ?? 3000);
  console.log('\n🚀 DiscordGym Server Started Successfully!');
  console.log('═══════════════════════════════════════');
  console.log(`🌐 Server: http://localhost:${process.env.PORT ?? 3000}`);
  console.log('🔗 WebSocket: Ready for connections');
  console.log('🔒 Security: Active');
}

// Start the application with error handling
bootstrap().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
