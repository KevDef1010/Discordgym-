/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:4200', 'http://localhost:4201'],
    credentials: true,
  },
  namespace: '/friends',
})
export class FriendsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(FriendsGateway.name);
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove user from connected users map
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('join-user')
  handleJoinUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string }
  ) {
    this.connectedUsers.set(data.userId, client.id);
    client.join(`user:${data.userId}`);
    this.logger.log(`User ${data.userId} joined with socket ${client.id}`);
  }

  @SubscribeMessage('leave-user')
  handleLeaveUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string }
  ) {
    this.connectedUsers.delete(data.userId);
    client.leave(`user:${data.userId}`);
    this.logger.log(`User ${data.userId} left`);
  }

  // Real-time friend request notification
  sendFriendRequest(receiverId: string, senderData: any) {
    this.server.to(`user:${receiverId}`).emit('friend-request-received', {
      type: 'FRIEND_REQUEST',
      sender: senderData,
      timestamp: new Date().toISOString(),
    });
  }

  // Real-time friend request response notification
  sendFriendRequestResponse(senderId: string, responseData: any) {
    this.server.to(`user:${senderId}`).emit('friend-request-response', {
      type: 'FRIEND_REQUEST_RESPONSE',
      ...responseData,
      timestamp: new Date().toISOString(),
    });
  }

  // Real-time friend online status
  notifyFriendOnline(friendIds: string[], userData: any) {
    friendIds.forEach(friendId => {
      this.server.to(`user:${friendId}`).emit('friend-online', {
        type: 'FRIEND_ONLINE',
        user: userData,
        timestamp: new Date().toISOString(),
      });
    });
  }

  // Real-time friend offline status
  notifyFriendOffline(friendIds: string[], userId: string) {
    friendIds.forEach(friendId => {
      this.server.to(`user:${friendId}`).emit('friend-offline', {
        type: 'FRIEND_OFFLINE',
        userId,
        timestamp: new Date().toISOString(),
      });
    });
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Get all online users
  getOnlineUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }
}
