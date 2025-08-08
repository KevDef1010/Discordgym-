/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module, forwardRef } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController, PublicChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ChatController, PublicChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
