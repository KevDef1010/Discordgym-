import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

interface SendMessageDto {
  content: string;
  channelId?: string;
  receiverId?: string;
  senderId: string;
  senderUsername: string;
  senderAvatar?: string;
}

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: ['http://localhost:4200', 'http://localhost:4201'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, { socket: Socket; userId: string; username: string }>();

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`💬 Chat client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // Remove user from connected users
    for (const [userId, userData] of this.connectedUsers.entries()) {
      if (userData.socket.id === client.id) {
        this.connectedUsers.delete(userId);
        console.log(`💬 User ${userData.username} disconnected from chat`);
        
        // Notify others that user went offline
        this.server.emit('userOffline', {
          userId: userId,
          username: userData.username
        });
        break;
      }
    }
    
    console.log(`💬 Chat client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(
    @MessageBody() data: { userId: string; username: string; avatar?: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`💬 User joining chat: ${data.username} (${data.userId})`);
    
    // Store user connection
    this.connectedUsers.set(data.userId, {
      socket: client,
      userId: data.userId,
      username: data.username
    });

    // Join user to their own room for direct messages
    client.join(`user_${data.userId}`);

    // Notify others that user is online
    this.server.emit('userOnline', {
      userId: data.userId,
      username: data.username,
      avatar: data.avatar,
      status: 'online'
    });

    // Send current online users to the new user
    const onlineUsers = Array.from(this.connectedUsers.values()).map(user => ({
      userId: user.userId,
      username: user.username,
      status: 'online'
    }));
    
    client.emit('onlineUsers', onlineUsers);
  }

  @SubscribeMessage('joinChannel')
  handleJoinChannel(
    @MessageBody() data: { channelId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`💬 User joining channel: ${data.channelId}`);
    client.join(`channel_${data.channelId}`);
    
    client.emit('joinedChannel', {
      channelId: data.channelId,
      message: 'Successfully joined channel'
    });
  }

  @SubscribeMessage('leaveChannel')  
  handleLeaveChannel(
    @MessageBody() data: { channelId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`💬 User leaving channel: ${data.channelId}`);
    client.leave(`channel_${data.channelId}`);
    
    client.emit('leftChannel', {
      channelId: data.channelId,
      message: 'Successfully left channel'
    });
  }

  @SubscribeMessage('sendChannelMessage')
  async handleChannelMessage(
    @MessageBody() messageData: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      console.log(`💬 Channel message received:`, messageData);

      // Save message to database
      const savedMessage = await this.chatService.sendChannelMessage({
        content: messageData.content,
        senderId: messageData.senderId,
        channelId: messageData.channelId!
      });

      // Broadcast message to all users in the channel
      const broadcastData = {
        id: savedMessage.id,
        content: savedMessage.content,
        senderId: savedMessage.senderId,
        senderUsername: messageData.senderUsername,
        senderAvatar: messageData.senderAvatar,
        channelId: messageData.channelId,
        messageType: 'TEXT',
        isEdited: false,
        createdAt: savedMessage.createdAt,
        reactions: [],
        sender: savedMessage.sender
      };

      this.server.to(`channel_${messageData.channelId}`).emit('channelMessage', broadcastData);
      
      console.log(`💬 Channel message broadcasted to channel_${messageData.channelId}`);
    } catch (error) {
      console.error('💬 Error handling channel message:', error);
      client.emit('messageError', {
        error: 'Failed to send message',
        originalMessage: messageData
      });
    }
  }

  @SubscribeMessage('sendDirectMessage')
  async handleDirectMessage(
    @MessageBody() messageData: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      console.log(`💬 Direct message received:`, messageData);

      // Save message to database
      const savedMessage = await this.chatService.sendDirectMessage({
        content: messageData.content,
        senderId: messageData.senderId,
        receiverId: messageData.receiverId!
      });

      // Prepare message data for broadcasting
      const broadcastData = {
        id: savedMessage.id,
        content: savedMessage.content,
        senderId: savedMessage.senderId,
        senderUsername: messageData.senderUsername,
        senderAvatar: messageData.senderAvatar,
        receiverId: messageData.receiverId,
        messageType: 'TEXT',
        isEdited: false,
        createdAt: savedMessage.createdAt,
        reactions: [],
        sender: savedMessage.sender
      };

      // Send to both sender and receiver
      client.emit('directMessage', broadcastData);
      this.server.to(`user_${messageData.receiverId}`).emit('directMessage', broadcastData);
      
      console.log(`💬 Direct message sent between ${messageData.senderId} and ${messageData.receiverId}`);
    } catch (error) {
      console.error('💬 Error handling direct message:', error);
      client.emit('messageError', {
        error: 'Failed to send direct message',
        originalMessage: messageData
      });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { userId: string; username: string; channelId?: string; receiverId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data.channelId) {
      // Channel typing indicator
      client.to(`channel_${data.channelId}`).emit('userTyping', {
        userId: data.userId,
        username: data.username,
        channelId: data.channelId
      });
    } else if (data.receiverId) {
      // Direct message typing indicator
      this.server.to(`user_${data.receiverId}`).emit('userTyping', {
        userId: data.userId,
        username: data.username,
        receiverId: data.receiverId
      });
    }
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @MessageBody() data: { userId: string; username: string; channelId?: string; receiverId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data.channelId) {
      // Channel stop typing
      client.to(`channel_${data.channelId}`).emit('userStoppedTyping', {
        userId: data.userId,
        username: data.username,
        channelId: data.channelId
      });
    } else if (data.receiverId) {
      // Direct message stop typing
      this.server.to(`user_${data.receiverId}`).emit('userStoppedTyping', {
        userId: data.userId,
        username: data.username,
        receiverId: data.receiverId
      });
    }
  }

  // Get online users
  getOnlineUsers() {
    return Array.from(this.connectedUsers.values()).map(user => ({
      userId: user.userId,
      username: user.username,
      status: 'online'
    }));
  }
}
