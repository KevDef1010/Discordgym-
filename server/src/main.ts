/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { PasswordPrompt } from './utils/password-prompt';

async function setupSecurity(): Promise<void> {
  // Only run security setup in production mode
  if (process.env.NODE_ENV !== 'production') {
    console.log('🚀 Development mode - skipping security prompts');
    return;
  }

  const passwordPrompt = new PasswordPrompt();
  
  try {
    // 1. Database password setup
    const dbPassword = await passwordPrompt.promptDatabasePassword();
    
    // Replace placeholder in DATABASE_URL
    process.env.DATABASE_URL = process.env.DATABASE_URL?.replace('__DB_PASSWORD__', dbPassword);
    
    if (!process.env.DATABASE_URL?.includes(dbPassword)) {
      console.log('❌ Failed to configure database connection');
      process.exit(1);
    }
    
    // 2. Admin authentication
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

async function bootstrap() {
  // Setup security before starting the application
  await setupSecurity();
  
  const app = await NestFactory.create(AppModule);
  
  // Enable Socket.IO
  app.useWebSocketAdapter(new IoAdapter(app));
  
  // Enable CORS for frontend
  app.enableCors({
    origin: [
      'http://localhost:4200', 
      'http://localhost:4201', 
      'http://localhost:4202',
      /^http:\/\/localhost:\d+$/  // Allow any localhost port
    ],
    credentials: true,
  });
  
  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(process.env.PORT ?? 3000);
  console.log('\n🚀 DiscordGym Server Started Successfully!');
  console.log('═══════════════════════════════════════');
  console.log(`🌐 Server: http://localhost:${process.env.PORT ?? 3000}`);
  console.log('🔗 WebSocket: Ready for connections');
  console.log('🔒 Security: Active');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
