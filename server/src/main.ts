/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable Socket.IO
  app.useWebSocketAdapter(new IoAdapter(app));
  
  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:4201'],
    credentials: true,
  });
  
  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(process.env.PORT ?? 3000);
  console.log('🚀 Server is running on http://localhost:3000');
  console.log('🔗 WebSocket server ready for connections');
}

void bootstrap();
