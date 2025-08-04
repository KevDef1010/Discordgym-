/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  console.log('🚀 Starting DiscordGym Development Server...');
  
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
  console.log(`🌐 Server: http://localhost:${process.env.PORT ?? 3000}`);
  console.log('🔗 WebSocket: Ready for connections');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
