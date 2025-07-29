/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable prettier/prettier */
/* Enhanced Friends Gateway with Chat and Online Status */
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
import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { FriendsService } from './friends.service';

interface ConnectedUser {
  socketId: string;
  userId: string;
  username: string;
  status: 'ONLINE' | 'AWAY' | 'DO_NOT_DISTURB';
  lastSeen: Date;
  currentRoom?: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:4200', 'http://localhost:4201'],
    credentials: true,
  },
  namespace: '/friends',
})
export class EnhancedFriendsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EnhancedFriendsGateway.name);
  
  // Erweiterte User Tracking
  private connectedUsers = new Map<string, ConnectedUser>();
  private userRooms = new Map<string, Set<string>>(); // userId -> Set of roomIds
  private roomUsers = new Map<string, Set<string>>(); // roomId -> Set of userIds

  constructor(
    @Inject(forwardRef(() => FriendsService))
    private readonly friendsService: FriendsService,
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Find and remove user
    for (const [userId, userData] of this.connectedUsers.entries()) {
      if (userData.socketId === client.id) {
        // Update last seen in database
        await this.updateUserLastSeen(userId);
        
        // Notify friends about offline status
        await this.notifyFriendsOffline(userId);
        
        // Leave all rooms
        this.leaveAllRooms(userId);
        
        // Remove from connected users
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  // === ENHANCED USER MANAGEMENT ===
  
  @SubscribeMessage('join-user')
  async handleJoinUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; username: string; status?: string }
  ) {
    const userStatus = data.status as any || 'ONLINE';
    
    const connectedUser: ConnectedUser = {
      socketId: client.id,
      userId: data.userId,
      username: data.username,
      status: userStatus,
      lastSeen: new Date(),
    };
    
    this.connectedUsers.set(data.userId, connectedUser);
    client.join(`user:${data.userId}`);
    
    // Update database
    await this.updateUserOnlineStatus(data.userId, true, userStatus);
    
    // Notify friends about online status
    await this.notifyFriendsOnline(data.userId, connectedUser);
    
    this.logger.log(`User ${data.username} (${data.userId}) joined with status ${userStatus}`);
  }

  @SubscribeMessage('update-status')
  async handleUpdateStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; status: string }
  ) {
    const user = this.connectedUsers.get(data.userId);
    if (user) {
      user.status = data.status as any;
      user.lastSeen = new Date();
      
      // Update database
      await this.updateUserOnlineStatus(data.userId, true, data.status);
      
      // Notify friends about status change
      this.server.emit('friend-status-changed', {
        userId: data.userId,
        status: data.status,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // === CHAT FUNCTIONALITY ===
  
  @SubscribeMessage('join-chat-room')
  async handleJoinChatRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; roomId: string }
  ) {
    client.join(`chat:${data.roomId}`);
    
    // Track user rooms
    if (!this.userRooms.has(data.userId)) {
      this.userRooms.set(data.userId, new Set());
    }
    this.userRooms.get(data.userId)!.add(data.roomId);
    
    // Track room users
    if (!this.roomUsers.has(data.roomId)) {
      this.roomUsers.set(data.roomId, new Set());
    }
    this.roomUsers.get(data.roomId)!.add(data.userId);
    
    // Update user's current room
    const user = this.connectedUsers.get(data.userId);
    if (user) {
      user.currentRoom = data.roomId;
    }
    
    // Notify room about user joining
    client.to(`chat:${data.roomId}`).emit('user-joined-room', {
      userId: data.userId,
      username: user?.username,
      timestamp: new Date().toISOString(),
    });
    
    this.logger.log(`User ${data.userId} joined chat room ${data.roomId}`);
  }

  @SubscribeMessage('leave-chat-room')
  async handleLeaveChatRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; roomId: string }
  ) {
    client.leave(`chat:${data.roomId}`);
    
    // Remove from tracking
    this.userRooms.get(data.userId)?.delete(data.roomId);
    this.roomUsers.get(data.roomId)?.delete(data.userId);
    
    // Update user's current room
    const user = this.connectedUsers.get(data.userId);
    if (user && user.currentRoom === data.roomId) {
      user.currentRoom = undefined;
    }
    
    // Notify room about user leaving
    client.to(`chat:${data.roomId}`).emit('user-left-room', {
      userId: data.userId,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      senderId: string;
      receiverId?: string;
      roomId?: string;
      content: string;
      messageType?: string;
    }
  ) {
    try {
      // Save message to database
      const message = await this.saveMessage(data);
      
      const messageData = {
        id: message.id,
        content: data.content,
        senderId: data.senderId,
        senderUsername: this.connectedUsers.get(data.senderId)?.username,
        messageType: data.messageType || 'TEXT',
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      
      if (data.roomId) {
        // Group chat message
        this.server.to(`chat:${data.roomId}`).emit('new-message', {
          ...messageData,
          roomId: data.roomId,
        });
      } else if (data.receiverId) {
        // Private message
        this.server.to(`user:${data.receiverId}`).emit('new-private-message', {
          ...messageData,
          receiverId: data.receiverId,
        });
        
        // Also send to sender for confirmation
        client.emit('message-sent', messageData);
      }
      
      this.logger.log(`Message sent from ${data.senderId} to ${data.receiverId || data.roomId}`);
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      client.emit('message-error', { error: 'Failed to send message' });
    }
  }

  @SubscribeMessage('typing-start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; roomId?: string; receiverId?: string }
  ) {
    const user = this.connectedUsers.get(data.userId);
    if (user) {
      if (data.roomId) {
        client.to(`chat:${data.roomId}`).emit('user-typing', {
          userId: data.userId,
          username: user.username,
          isTyping: true,
        });
      } else if (data.receiverId) {
        this.server.to(`user:${data.receiverId}`).emit('user-typing', {
          userId: data.userId,
          username: user.username,
          isTyping: true,
        });
      }
    }
  }

  @SubscribeMessage('typing-stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; roomId?: string; receiverId?: string }
  ) {
    if (data.roomId) {
      client.to(`chat:${data.roomId}`).emit('user-typing', {
        userId: data.userId,
        isTyping: false,
      });
    } else if (data.receiverId) {
      this.server.to(`user:${data.receiverId}`).emit('user-typing', {
        userId: data.userId,
        isTyping: false,
      });
    }
  }

  // === HELPER METHODS ===
  
  private async updateUserOnlineStatus(userId: string, isOnline: boolean, status?: string) {
    // Implementation depends on your database service
    // await this.friendsService.updateUserStatus(userId, isOnline, status);
  }
  
  private async updateUserLastSeen(userId: string) {
    // await this.friendsService.updateLastSeen(userId);
  }
  
  private async notifyFriendsOnline(userId: string, userData: ConnectedUser) {
    // Get user's friends and notify them
    // const friends = await this.friendsService.getUserFriends(userId);
    // friends.forEach(friend => {
    //   this.server.to(`user:${friend.id}`).emit('friend-online', {
    //     userId: userId,
    //     username: userData.username,
    //     status: userData.status,
    //     timestamp: new Date().toISOString(),
    //   });
    // });
  }
  
  private async notifyFriendsOffline(userId: string) {
    // Similar to notifyFriendsOnline but for offline status
  }
  
  private leaveAllRooms(userId: string) {
    const userRooms = this.userRooms.get(userId);
    if (userRooms) {
      userRooms.forEach(roomId => {
        this.roomUsers.get(roomId)?.delete(userId);
      });
      this.userRooms.delete(userId);
    }
  }
  
  private async saveMessage(data: any) {
    // Implementation depends on your database service
    // return await this.chatService.createMessage(data);
    return { id: 'temp-id' }; // Placeholder
  }

  // === PUBLIC API METHODS ===
  
  getOnlineUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values());
  }
  
  getUserOnlineStatus(userId: string): ConnectedUser | null {
    return this.connectedUsers.get(userId) || null;
  }
  
  getRoomUsers(roomId: string): string[] {
    return Array.from(this.roomUsers.get(roomId) || []);
  }
}
