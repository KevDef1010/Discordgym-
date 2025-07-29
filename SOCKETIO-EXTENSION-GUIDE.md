# 🚀 Socket.IO Erweiterungen - Vollständiger Guide

## 📋 1. Was Sie beachten müssen:

### A) **Architektur Patterns:**

#### **1. Namespace Organisation:**
```typescript
// Verschiedene Namespaces für verschiedene Features
@WebSocketGateway({ namespace: '/friends' })  // Friend System
@WebSocketGateway({ namespace: '/chat' })     // Chat System  
@WebSocketGateway({ namespace: '/status' })   // Online Status
```

#### **2. Room Management:**
```typescript
// User Rooms: user:${userId}
// Chat Rooms: chat:${roomId}
// Friend Rooms: friends:${userId}
// Status Rooms: status:online, status:away
```

#### **3. Event Naming Convention:**
```typescript
// Eingehende Events (Client → Server)
'join-user', 'leave-user', 'send-message', 'typing-start'

// Ausgehende Events (Server → Client)  
'user-joined', 'user-left', 'new-message', 'user-typing'
```

### B) **Performance Considerations:**

#### **1. Connection Tracking:**
```typescript
interface ConnectedUser {
  socketId: string;
  userId: string;
  username: string;
  status: OnlineStatus;
  lastSeen: Date;
  rooms: Set<string>;
  heartbeat?: NodeJS.Timeout;
}

// Optimierte Datenstrukturen
private connectedUsers = new Map<string, ConnectedUser>();
private socketToUser = new Map<string, string>(); // Schnelle Lookup
private roomUsers = new Map<string, Set<string>>();
```

#### **2. Memory Management:**
```typescript
// Cleanup bei Disconnect
async handleDisconnect(client: Socket) {
  const userId = this.socketToUser.get(client.id);
  if (userId) {
    // Cleanup heartbeat
    const user = this.connectedUsers.get(userId);
    if (user?.heartbeat) {
      clearTimeout(user.heartbeat);
    }
    
    // Cleanup tracking
    this.connectedUsers.delete(userId);
    this.socketToUser.delete(client.id);
    
    // Leave all rooms
    this.leaveAllRooms(userId);
  }
}
```

#### **3. Database Optimization:**
```typescript
// Batch Updates für Online Status
private statusUpdateQueue = new Map<string, any>();

private async batchUpdateStatuses() {
  if (this.statusUpdateQueue.size > 0) {
    await this.databaseService.batchUpdateUserStatuses(
      Array.from(this.statusUpdateQueue.entries())
    );
    this.statusUpdateQueue.clear();
  }
}

// Alle 30 Sekunden ausführen
setInterval(() => this.batchUpdateStatuses(), 30000);
```

## 🔧 2. Chat Funktion implementieren:

### A) **Backend Chat Service:**

```typescript
// chat.service.ts
@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createChatRoom(name: string, isGroup: boolean, memberIds: string[]) {
    return this.prisma.chatRoom.create({
      data: {
        name,
        isGroup,
        members: {
          create: memberIds.map(userId => ({ userId }))
        }
      },
      include: {
        members: { include: { user: true } }
      }
    });
  }

  async sendMessage(data: {
    senderId: string;
    content: string;
    receiverId?: string;
    chatRoomId?: string;
    messageType?: MessageType;
  }) {
    return this.prisma.chatMessage.create({
      data: {
        content: data.content,
        senderId: data.senderId,
        receiverId: data.receiverId,
        chatRoomId: data.chatRoomId,
        messageType: data.messageType || 'TEXT',
      },
      include: {
        sender: { select: { id: true, username: true, avatar: true } }
      }
    });
  }

  async getChatHistory(roomId: string, limit: number = 50, offset: number = 0) {
    return this.prisma.chatMessage.findMany({
      where: { chatRoomId: roomId },
      include: {
        sender: { select: { id: true, username: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
  }

  async markMessagesAsRead(userId: string, roomId: string) {
    return this.prisma.chatMessage.updateMany({
      where: {
        chatRoomId: roomId,
        receiverId: userId,
        isRead: false
      },
      data: { isRead: true }
    });
  }
}
```

### B) **Chat Gateway:**

```typescript
// chat.gateway.ts
@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway {
  @WebSocketServer() server: Server;

  constructor(private chatService: ChatService) {}

  @SubscribeMessage('send-message')
  async handleSendMessage(client: Socket, data: SendMessageDto) {
    try {
      // Save to database
      const message = await this.chatService.sendMessage(data);
      
      // Broadcast to room
      if (data.chatRoomId) {
        this.server.to(`room:${data.chatRoomId}`).emit('new-message', {
          id: message.id,
          content: message.content,
          sender: message.sender,
          timestamp: message.createdAt,
          messageType: message.messageType
        });
      }
      
      // Private message
      if (data.receiverId) {
        this.server.to(`user:${data.receiverId}`).emit('new-private-message', {
          id: message.id,
          content: message.content,
          sender: message.sender,
          timestamp: message.createdAt
        });
      }
      
    } catch (error) {
      client.emit('message-error', { error: error.message });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, data: { roomId: string; isTyping: boolean }) {
    client.to(`room:${data.roomId}`).emit('user-typing', {
      userId: client.data.userId,
      isTyping: data.isTyping
    });
  }
}
```

## 📊 3. Online Status & Last Seen:

### A) **Enhanced User Tracking:**

```typescript
// status.gateway.ts
@WebSocketGateway({ namespace: '/status' })
export class StatusGateway {
  private userStatuses = new Map<string, {
    status: OnlineStatus;
    lastSeen: Date;
    socketId: string;
  }>();

  @SubscribeMessage('update-status')
  async handleStatusUpdate(client: Socket, data: { status: OnlineStatus }) {
    const userId = client.data.userId;
    
    // Update in-memory tracking
    this.userStatuses.set(userId, {
      status: data.status,
      lastSeen: new Date(),
      socketId: client.id
    });
    
    // Update database
    await this.userService.updateUserStatus(userId, data.status);
    
    // Notify friends
    const friends = await this.friendsService.getUserFriends(userId);
    friends.forEach(friend => {
      this.server.to(`user:${friend.id}`).emit('friend-status-changed', {
        userId,
        status: data.status,
        lastSeen: new Date().toISOString()
      });
    });
  }

  @SubscribeMessage('get-friends-status')
  async handleGetFriendsStatus(client: Socket) {
    const userId = client.data.userId;
    const friends = await this.friendsService.getUserFriends(userId);
    
    const friendsStatus = friends.map(friend => ({
      userId: friend.id,
      username: friend.username,
      status: this.userStatuses.get(friend.id)?.status || 'OFFLINE',
      lastSeen: friend.lastSeen,
      isOnline: this.userStatuses.has(friend.id)
    }));
    
    client.emit('friends-status', friendsStatus);
  }

  // Heartbeat für genauere Online Detection
  @SubscribeMessage('heartbeat')
  handleHeartbeat(client: Socket) {
    const userId = client.data.userId;
    const userStatus = this.userStatuses.get(userId);
    
    if (userStatus) {
      userStatus.lastSeen = new Date();
    }
    
    client.emit('heartbeat-ack');
  }
}
```

### B) **Frontend Integration:**

```typescript
// status.service.ts
@Injectable()
export class StatusService {
  private statusSocket: Socket;
  private heartbeatInterval: any;

  connect(userId: string) {
    this.statusSocket = io('/status', {
      auth: { userId }
    });

    // Start heartbeat
    this.heartbeatInterval = setInterval(() => {
      this.statusSocket.emit('heartbeat');
    }, 30000); // Alle 30 Sekunden

    return this.statusSocket;
  }

  updateStatus(status: 'ONLINE' | 'AWAY' | 'DO_NOT_DISTURB') {
    this.statusSocket.emit('update-status', { status });
  }

  getFriendsStatus(): Observable<any[]> {
    return new Observable(observer => {
      this.statusSocket.on('friends-status', data => {
        observer.next(data);
      });
      
      this.statusSocket.emit('get-friends-status');
    });
  }

  disconnect() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.statusSocket?.disconnect();
  }
}
```

## ⚡ 4. Best Practices:

### A) **Error Handling:**
```typescript
// Gateway Error Wrapper
@SubscribeMessage('any-event')
async handleEvent(client: Socket, data: any) {
  try {
    // Event logic
  } catch (error) {
    this.logger.error(`Error in ${event}: ${error.message}`);
    client.emit('error', {
      event: 'any-event',
      message: 'Something went wrong',
      code: 'INTERNAL_ERROR'
    });
  }
}
```

### B) **Rate Limiting:**
```typescript
// Message Rate Limiting
private messageRates = new Map<string, number[]>();

private checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userRates = this.messageRates.get(userId) || [];
  
  // Remove old timestamps (older than 1 minute)
  const recentRates = userRates.filter(time => now - time < 60000);
  
  if (recentRates.length >= 60) { // Max 60 messages per minute
    return false;
  }
  
  recentRates.push(now);
  this.messageRates.set(userId, recentRates);
  return true;
}
```

### C) **Authentication & Authorization:**
```typescript
// Socket Authentication
@WebSocketGateway({
  cors: { origin: '*' },
  middlewares: [AuthMiddleware]
})
export class SecuredGateway {
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const user = await this.authService.validateToken(token);
      client.data.userId = user.id;
      client.data.user = user;
    } catch (error) {
      client.disconnect();
    }
  }
}
```

## 🎯 5. Migration Strategy:

1. **Phase 1:** Online Status ohne Chat
2. **Phase 2:** Private Messages  
3. **Phase 3:** Group Chat
4. **Phase 4:** File Sharing & Media
5. **Phase 5:** Voice/Video Integration

Would you like me to help you implement any specific part of this architecture?
