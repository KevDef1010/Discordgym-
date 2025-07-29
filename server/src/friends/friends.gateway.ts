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
import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { FriendsService } from './friends.service';

interface ConnectedUser {
  socketId: string;
  userId: string;
  username: string;
  status: 'ONLINE' | 'AWAY' | 'DO_NOT_DISTURB' | 'OFFLINE';
  lastSeen: Date;
  lastActivity: Date;
  avatar?: string;
}

interface UserActivity {
  userId: string;
  lastActivity: Date;
  heartbeatCount: number;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:4200', 
      'http://localhost:4201', 
      'http://localhost:49935',
      'http://localhost:52974',
      'http://localhost:54445',
      /^http:\/\/localhost:\d+$/  // Allow any localhost port for development
    ],
    credentials: true,
  },
  namespace: '/friends',
})
export class FriendsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(FriendsGateway.name);
  
  // Enhanced User Tracking with persistent status storage
  private connectedUsers = new Map<string, ConnectedUser>();
  private socketToUser = new Map<string, string>(); // socket.id -> userId
  private userActivities = new Map<string, UserActivity>();
  private userStatusHistory = new Map<string, string>(); // userId -> last known status

  constructor(
    @Inject(forwardRef(() => FriendsService))
    private readonly friendsService: FriendsService,
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Initialize client data
    client.data = client.data || {};
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Clean up client data
    if (client.data?.heartbeatInterval) {
      clearInterval(client.data.heartbeatInterval);
    }
    if (client.data?.heartbeatTimeout) {
      clearTimeout(client.data.heartbeatTimeout);
    }

    // Get user ID from socket mapping
    const userId = this.socketToUser.get(client.id);
    if (userId) {
      await this.setUserOffline(userId);
      this.cleanup(userId, client.id);
    }
  }

  @SubscribeMessage('join-user-enhanced')
  async handleJoinUserEnhanced(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; username: string; status?: string; avatar?: string }
  ) {
    console.log('🚀 JOIN USER ENHANCED:', data);
    
    // Check if user has a previous status, otherwise default to ONLINE
    const previousStatus = this.userStatusHistory.get(data.userId);
    const userStatus = (data.status as any) || previousStatus || 'ONLINE';
    
    console.log('📊 User status determined:', { userId: data.userId, userStatus, previousStatus, dataStatus: data.status });
    
    // Store user connection info
    const connectedUser: ConnectedUser = {
      socketId: client.id,
      userId: data.userId,
      username: data.username,
      status: userStatus,
      lastSeen: new Date(),
      lastActivity: new Date(),
      avatar: data.avatar
    };
    
    this.connectedUsers.set(data.userId, connectedUser);
    this.socketToUser.set(client.id, data.userId);
    this.userStatusHistory.set(data.userId, userStatus); // Store status history
    
    console.log('💾 User stored in maps:', { connectedUsersSize: this.connectedUsers.size, socketToUserSize: this.socketToUser.size });
    
    // Initialize activity tracking
    this.userActivities.set(data.userId, {
      userId: data.userId,
      lastActivity: new Date(),
      heartbeatCount: 0
    });
    
    // Setup heartbeat monitoring
    this.setupHeartbeat(client, data.userId);
    
    // Send back the current status to the client immediately
    client.emit('status-confirmed', { 
      status: userStatus, 
      timestamp: new Date().toISOString() 
    });
    
    console.log('✅ Status confirmed sent to client:', userStatus);
    
    // Notify friends about status change
    await this.notifyFriendsStatusChange(data.userId, userStatus, true);
    
    // Send current online friends to user
    await this.sendOnlineFriendsToUser(client, data.userId);
    
    this.logger.log(`User ${data.userId} joined with status ${userStatus}`);
  }

  @SubscribeMessage('join-user')
  handleJoinUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; username?: string }
  ) {
    // Legacy support - redirect to enhanced version
    this.handleJoinUserEnhanced(client, {
      userId: data.userId,
      username: data.username || 'Unknown User'
    });
  }

  @SubscribeMessage('update-user-status')
  async handleUpdateUserStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; status: string }
  ) {
    const user = this.connectedUsers.get(data.userId);
    if (user) {
      const oldStatus = user.status;
      user.status = data.status as any;
      user.lastSeen = new Date();
      user.lastActivity = new Date();
      
      // Store status in history for persistence
      this.userStatusHistory.set(data.userId, data.status);
      
      // Update activity
      const activity = this.userActivities.get(data.userId);
      if (activity) {
        activity.lastActivity = new Date();
      }
      
      // Always notify friends about status change
      await this.notifyFriendsStatusChange(data.userId, data.status, true);
      
      // Confirm status change to client
      client.emit('status-updated', { 
        status: data.status, 
        timestamp: new Date().toISOString(),
        confirmed: true
      });
      
      this.logger.log(`User ${data.userId} status changed from ${oldStatus} to ${data.status}`);
    } else {
      // User not found, emit error
      client.emit('status-update-error', {
        error: 'User not connected',
        timestamp: new Date().toISOString()
      });
    }
  }

  @SubscribeMessage('heartbeat')
  handleHeartbeat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string }
  ) {
    const activity = this.userActivities.get(data.userId);
    if (activity) {
      activity.lastActivity = new Date();
      activity.heartbeatCount++;
    }
    
    const user = this.connectedUsers.get(data.userId);
    if (user) {
      user.lastSeen = new Date();
      user.lastActivity = new Date();
      
      // If user was offline, set them back to their last known status
      if (user.status === 'OFFLINE') {
        const lastStatus = this.userStatusHistory.get(data.userId) || 'ONLINE';
        user.status = lastStatus as any;
        this.notifyFriendsStatusChange(data.userId, lastStatus, true);
      }
    }
    
    // Reset heartbeat timeout
    if (client.data?.heartbeatTimeout) {
      clearTimeout(client.data.heartbeatTimeout);
    }
    
    const heartbeatTimeout = setTimeout(() => {
      this.logger.warn(`Heartbeat timeout for user ${data.userId}`);
      client.disconnect();
    }, 60000);
    
    client.data.heartbeatTimeout = heartbeatTimeout;
    client.emit('heartbeat-ack', { timestamp: new Date().toISOString() });
  }

  @SubscribeMessage('get-online-friends')
  async handleGetOnlineFriends(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string }
  ) {
    await this.sendOnlineFriendsToUser(client, data.userId);
  }

  @SubscribeMessage('request-friend-status')
  async handleRequestFriendStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; friendId: string }
  ) {
    const friendStatus = this.getUserStatus(data.friendId);
    client.emit('friend-status-response', {
      friendId: data.friendId,
      ...friendStatus
    });
  }

  @SubscribeMessage('get-current-status')
  handleGetCurrentStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string }
  ) {
    const userStatus = this.getUserStatus(data.userId);
    client.emit('current-status-response', {
      userId: data.userId,
      ...userStatus
    });
  }

  // Private helper methods
  private setupHeartbeat(client: Socket, userId: string) {
    // Initialize heartbeat for user
    const heartbeatInterval = setInterval(() => {
      client.emit('heartbeat-ping', { timestamp: new Date().toISOString() });
    }, 30000);

    // Set timeout for heartbeat response
    const heartbeatTimeout = setTimeout(() => {
      this.logger.warn(`Heartbeat timeout for client ${client.id}`);
      client.disconnect();
    }, 60000);

    client.data.heartbeatInterval = heartbeatInterval;
    client.data.heartbeatTimeout = heartbeatTimeout;
    client.data.userId = userId;
  }

  private async setUserOffline(userId: string) {
    const user = this.connectedUsers.get(userId);
    if (user) {
      // Don't change status history, just set current status to offline
      user.status = 'OFFLINE';
      user.lastSeen = new Date();
      await this.notifyFriendsStatusChange(userId, 'OFFLINE', false);
      this.logger.log(`User ${userId} set to offline but status history preserved`);
    }
  }

  private cleanup(userId: string, socketId: string) {
    // Remove user from connected users if no more sockets
    const userSockets = Array.from(this.socketToUser.entries())
      .filter(([_, uid]) => uid === userId)
      .map(([sid, _]) => sid);

    if (userSockets.length <= 1) {
      this.connectedUsers.delete(userId);
      this.userActivities.delete(userId);
      // Keep status history for next connection
    }

    // Remove socket mapping
    this.socketToUser.delete(socketId);
  }

  private async notifyFriendsStatusChange(userId: string, status: string, isOnline: boolean) {
    try {
      const friendships = await this.friendsService.getFriends(userId);
      const user = this.connectedUsers.get(userId);
      
      if (!user && isOnline) return; // Only skip if trying to notify about online status but user doesn't exist

      const statusData = {
        userId,
        username: user?.username || 'Unknown User',
        status,
        isOnline,
        lastSeen: user?.lastSeen?.toISOString() || new Date().toISOString(),
        timestamp: new Date().toISOString()
      };

      // Notify all friends who are online
      for (const friendship of friendships) {
        const friendId = friendship.friend.id;
        const friendSockets = Array.from(this.socketToUser.entries())
          .filter(([, uid]) => uid === friendId)
          .map(([socketId]) => socketId);

        friendSockets.forEach(socketId => {
          const socket = this.server?.sockets?.sockets?.get(socketId);
          if (socket) {
            socket.emit('friend-status-changed', statusData);
          }
        });
      }
      
      this.logger.log(`Notified friends about ${userId} status change to ${status}`);
    } catch (error) {
      this.logger.error(`Error notifying friends about status change: ${error.message}`);
    }
  }

  private async sendOnlineFriendsToUser(client: Socket, userId: string) {
    try {
      const friendships = await this.friendsService.getFriends(userId);
      const onlineFriends: any[] = [];

      for (const friendship of friendships) {
        const friendId = friendship.friend.id;
        const friendUser = this.connectedUsers.get(friendId);
        
        if (friendUser && friendUser.status !== 'OFFLINE') {
          onlineFriends.push({
            userId: friendId,
            username: friendUser.username,
            avatar: friendUser.avatar,
            status: friendUser.status,
            lastSeen: friendUser.lastSeen?.toISOString(),
            lastActivity: friendUser.lastActivity?.toISOString(),
            isOnline: true
          });
        } else {
          // Also include offline friends for status tracking
          onlineFriends.push({
            userId: friendId,
            username: friendship.friend.username,
            avatar: friendship.friend.avatar,
            status: 'OFFLINE',
            lastSeen: friendUser?.lastSeen?.toISOString() || new Date().toISOString(),
            lastActivity: friendUser?.lastActivity?.toISOString() || new Date().toISOString(),
            isOnline: false
          });
        }
      }

      client.emit('online-friends', onlineFriends);
      this.logger.log(`Sent ${onlineFriends.length} online friends to user ${userId}`);
    } catch (error) {
      this.logger.error(`Error sending online friends: ${error.message}`);
    }
  }

  private getUserStatus(userId: string) {
    const user = this.connectedUsers.get(userId);
    const activity = this.userActivities.get(userId);
    const lastKnownStatus = this.userStatusHistory.get(userId);

    if (!user) {
      return {
        status: lastKnownStatus || 'OFFLINE',
        isOnline: false,
        lastSeen: null,
        lastActivity: null
      };
    }

    return {
      status: user.status,
      isOnline: user.status !== 'OFFLINE',
      lastSeen: user.lastSeen?.toISOString(),
      lastActivity: user.lastActivity?.toISOString(),
      heartbeatCount: activity?.heartbeatCount || 0
    };
  }

  // Legacy methods for backward compatibility
  @SubscribeMessage('join-chat-room')
  async handleJoinChatRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; roomId: string }
  ) {
    try {
      client.join(`chat-room-${data.roomId}`);
      
      client.emit('joined-chat-room', {
        roomId: data.roomId,
        message: 'Successfully joined chat room',
        timestamp: new Date().toISOString()
      });

      // Notify others in the room
      client.to(`chat-room-${data.roomId}`).emit('user-joined-room', {
        userId: data.userId,
        roomId: data.roomId,
        timestamp: new Date().toISOString()
      });

      this.logger.log(`User ${data.userId} joined chat room: ${data.roomId}`);
    } catch (error) {
      this.logger.error(`Error joining chat room: ${error.message}`);
      client.emit('chat-error', {
        error: 'Failed to join chat room',
        timestamp: new Date().toISOString()
      });
    }
  }

  @SubscribeMessage('leave-chat-room')
  async handleLeaveChatRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; roomId: string }
  ) {
    try {
      // Notify others before leaving
      client.to(`chat-room-${data.roomId}`).emit('user-left-room', {
        userId: data.userId,
        roomId: data.roomId,
        timestamp: new Date().toISOString()
      });

      await client.leave(`chat-room-${data.roomId}`);
      
      client.emit('left-chat-room', {
        roomId: data.roomId,
        message: 'Successfully left chat room',
        timestamp: new Date().toISOString()
      });

      this.logger.log(`User ${data.userId} left chat room: ${data.roomId}`);
    } catch (error) {
      this.logger.error(`Error leaving chat room: ${error.message}`);
    }
  }

  // Service methods for notifications
  sendFriendRequest(receiverId: string, data: any) {
    try {
      const receiverSocketId = this.getSocketIdByUserId(receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('friend-request-notification', {
          type: 'FRIEND_REQUEST',
          ...data,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error sending friend request notification:', error);
    }
  }

  sendFriendRequestResponse(userId: string, data: any) {
    try {
      const userSocketId = this.getSocketIdByUserId(userId);
      if (userSocketId) {
        this.server.to(userSocketId).emit('friend-request-response-notification', {
          type: 'FRIEND_REQUEST_RESPONSE',
          ...data,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error sending friend request response notification:', error);
    }
  }

  private getSocketIdByUserId(userId: string): string | undefined {
    for (const [socketId, connectedUserId] of this.socketToUser.entries()) {
      if (connectedUserId === userId) {
        return socketId;
      }
    }
    return undefined;
  }
}
