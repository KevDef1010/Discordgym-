# 🎯 Frontend Integration für erweiterte Socket.IO Features

## 1. Enhanced Socket Service

```typescript
// enhanced-socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';

export interface OnlineUser {
  userId: string;
  username: string;
  status: 'ONLINE' | 'AWAY' | 'DO_NOT_DISTURB' | 'OFFLINE';
  lastSeen: string;
  isOnline: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderUsername: string;
  timestamp: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE';
  isRead: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EnhancedSocketService {
  private socket: Socket | null = null;
  private heartbeatSubscription: Subscription | null = null;
  
  // Observable Streams
  private connectedSubject = new BehaviorSubject<boolean>(false);
  private onlineUsersSubject = new BehaviorSubject<OnlineUser[]>([]);
  private notificationsSubject = new BehaviorSubject<any[]>([]);
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private typingUsersSubject = new BehaviorSubject<{userId: string, isTyping: boolean}[]>([]);
  
  // Public Observables
  connected$ = this.connectedSubject.asObservable();
  onlineUsers$ = this.onlineUsersSubject.asObservable();
  notifications$ = this.notificationsSubject.asObservable();
  messages$ = this.messagesSubject.asObservable();
  typingUsers$ = this.typingUsersSubject.asObservable();

  connect(userId: string, username: string, avatar?: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io('/friends', {
      auth: { userId, username }
    });

    this.setupEventListeners();
    this.startHeartbeat(userId);
    
    // Enhanced join with user info
    this.socket.emit('join-user-enhanced', {
      userId,
      username,
      avatar,
      status: 'ONLINE'
    });
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      this.connectedSubject.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      this.connectedSubject.next(false);
    });

    // Enhanced friend events
    this.socket.on('friend-status-changed', (data) => {
      this.handleFriendStatusChange(data);
    });

    this.socket.on('online-friends', (friends: OnlineUser[]) => {
      this.onlineUsersSubject.next(friends);
    });

    this.socket.on('friend-online', (data) => {
      this.addNotification({
        type: 'FRIEND_ONLINE',
        message: `${data.username} ist jetzt online`,
        data: data,
        timestamp: data.timestamp
      });
    });

    this.socket.on('friend-offline', (data) => {
      this.addNotification({
        type: 'FRIEND_OFFLINE', 
        message: `${data.username} ist offline`,
        data: data,
        timestamp: data.timestamp
      });
    });

    // Chat events
    this.socket.on('new-message', (message: ChatMessage) => {
      this.addMessage(message);
    });

    this.socket.on('new-private-message', (message: ChatMessage) => {
      this.addMessage(message);
      this.addNotification({
        type: 'NEW_MESSAGE',
        message: `Neue Nachricht von ${message.senderUsername}`,
        data: message,
        timestamp: message.timestamp
      });
    });

    this.socket.on('user-typing', (data) => {
      this.handleTypingUpdate(data);
    });

    // Heartbeat
    this.socket.on('heartbeat-request', () => {
      this.socket?.emit('heartbeat', { userId: this.getCurrentUserId() });
    });

    this.socket.on('heartbeat-ack', (data) => {
      console.log('💓 Heartbeat acknowledged:', data.timestamp);
    });

    // Status updates
    this.socket.on('status-updated', (data) => {
      console.log('Status updated:', data);
    });

    // Friend requests (existing)
    this.socket.on('friend-request-received', (data) => {
      this.addNotification({
        type: 'FRIEND_REQUEST',
        message: `${data.sender.username} möchte dein Freund werden`,
        data: data,
        timestamp: data.timestamp
      });
    });
  }

  private startHeartbeat(userId: string) {
    // Send heartbeat every 25 seconds (server expects every 30s)
    this.heartbeatSubscription = interval(25000).subscribe(() => {
      if (this.socket?.connected) {
        this.socket.emit('heartbeat', { userId });
      }
    });
  }

  // Status Management
  updateStatus(status: 'ONLINE' | 'AWAY' | 'DO_NOT_DISTURB') {
    if (this.socket?.connected) {
      this.socket.emit('update-user-status', {
        userId: this.getCurrentUserId(),
        status
      });
    }
  }

  getOnlineFriends() {
    if (this.socket?.connected) {
      this.socket.emit('get-online-friends', {
        userId: this.getCurrentUserId()
      });
    }
  }

  requestFriendStatus(friendId: string) {
    if (this.socket?.connected) {
      this.socket.emit('request-friend-status', {
        userId: this.getCurrentUserId(),
        friendId
      });
    }
  }

  // Chat functionality
  joinChatRoom(roomId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join-chat-room', {
        userId: this.getCurrentUserId(),
        roomId
      });
    }
  }

  leaveChatRoom(roomId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave-chat-room', {
        userId: this.getCurrentUserId(),
        roomId
      });
    }
  }

  sendMessage(content: string, receiverId?: string, roomId?: string) {
    if (this.socket?.connected) {
      this.socket.emit('send-message', {
        senderId: this.getCurrentUserId(),
        content,
        receiverId,
        roomId,
        messageType: 'TEXT'
      });
    }
  }

  startTyping(receiverId?: string, roomId?: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing-start', {
        userId: this.getCurrentUserId(),
        receiverId,
        roomId
      });
    }
  }

  stopTyping(receiverId?: string, roomId?: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing-stop', {
        userId: this.getCurrentUserId(),
        receiverId,
        roomId
      });
    }
  }

  // Helper methods
  private handleFriendStatusChange(data: any) {
    const currentUsers = this.onlineUsersSubject.value;
    const existingUserIndex = currentUsers.findIndex(u => u.userId === data.userId);
    
    if (data.isOnline) {
      const updatedUser: OnlineUser = {
        userId: data.userId,
        username: data.username,
        status: data.status,
        lastSeen: data.lastSeen,
        isOnline: true
      };
      
      if (existingUserIndex >= 0) {
        currentUsers[existingUserIndex] = updatedUser;
      } else {
        currentUsers.push(updatedUser);
      }
    } else {
      // User went offline
      if (existingUserIndex >= 0) {
        currentUsers[existingUserIndex].isOnline = false;
        currentUsers[existingUserIndex].status = 'OFFLINE';
        currentUsers[existingUserIndex].lastSeen = data.lastSeen;
      }
    }
    
    this.onlineUsersSubject.next([...currentUsers]);
  }

  private addNotification(notification: any) {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...current]);
  }

  private addMessage(message: ChatMessage) {
    const current = this.messagesSubject.value;
    this.messagesSubject.next([...current, message]);
  }

  private handleTypingUpdate(data: {userId: string, isTyping: boolean}) {
    const current = this.typingUsersSubject.value;
    const existingIndex = current.findIndex(u => u.userId === data.userId);
    
    if (data.isTyping) {
      if (existingIndex === -1) {
        current.push(data);
      }
    } else {
      if (existingIndex >= 0) {
        current.splice(existingIndex, 1);
      }
    }
    
    this.typingUsersSubject.next([...current]);
  }

  private getCurrentUserId(): string {
    // Get from auth service or local storage
    return localStorage.getItem('userId') || '';
  }

  disconnect() {
    if (this.heartbeatSubscription) {
      this.heartbeatSubscription.unsubscribe();
    }
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.connectedSubject.next(false);
  }
}
```

## 2. Enhanced Friends Component Integration

```typescript
// friends.component.ts (Enhanced)
export class FriendsComponent implements OnInit, OnDestroy {
  // ... existing properties ...
  
  // Enhanced properties
  onlineUsers$ = this.enhancedSocketService.onlineUsers$;
  isConnected$ = this.enhancedSocketService.connected$;
  typingUsers$ = this.enhancedSocketService.typingUsers$;
  
  currentUserStatus: 'ONLINE' | 'AWAY' | 'DO_NOT_DISTURB' = 'ONLINE';
  showOnlineStatusSelector = false;
  
  private subscriptions = new Subscription();

  constructor(
    // ... existing services ...
    private enhancedSocketService: EnhancedSocketService
  ) {}

  ngOnInit() {
    this.loadFriends();
    this.initializeEnhancedSocket();
    this.setupSubscriptions();
  }

  private initializeEnhancedSocket() {
    const userId = this.authService.getCurrentUserId();
    const username = this.authService.getCurrentUsername();
    const avatar = this.authService.getCurrentUserAvatar();
    
    this.enhancedSocketService.connect(userId, username, avatar);
    
    // Request online friends after connection
    setTimeout(() => {
      this.enhancedSocketService.getOnlineFriends();
    }, 1000);
  }

  private setupSubscriptions() {
    // Online users updates
    this.subscriptions.add(
      this.onlineUsers$.subscribe(users => {
        console.log('Online users updated:', users);
        // Update UI with online status indicators
        this.updateFriendsOnlineStatus(users);
      })
    );

    // Typing indicators
    this.subscriptions.add(
      this.typingUsers$.subscribe(typingUsers => {
        console.log('Typing users:', typingUsers);
        // Show typing indicators in chat
      })
    );

    // Connection status
    this.subscriptions.add(
      this.isConnected$.subscribe(connected => {
        if (connected) {
          console.log('Socket connected - refreshing online status');
          this.enhancedSocketService.getOnlineFriends();
        }
      })
    );
  }

  // Status management
  changeStatus(newStatus: 'ONLINE' | 'AWAY' | 'DO_NOT_DISTURB') {
    this.currentUserStatus = newStatus;
    this.enhancedSocketService.updateStatus(newStatus);
    this.showOnlineStatusSelector = false;
  }

  toggleStatusSelector() {
    this.showOnlineStatusSelector = !this.showOnlineStatusSelector;
  }

  // Enhanced friend interaction
  checkFriendStatus(friendId: string) {
    this.enhancedSocketService.requestFriendStatus(friendId);
  }

  private updateFriendsOnlineStatus(onlineUsers: OnlineUser[]) {
    // Update your friends list with online status
    if (this.friends) {
      this.friends.forEach(friend => {
        const onlineUser = onlineUsers.find(u => u.userId === friend.id);
        if (onlineUser) {
          friend.isOnline = onlineUser.isOnline;
          friend.status = onlineUser.status;
          friend.lastSeen = onlineUser.lastSeen;
        } else {
          friend.isOnline = false;
          friend.status = 'OFFLINE';
        }
      });
    }
  }

  // Chat initiation
  startPrivateChat(friendId: string) {
    // Navigate to chat or open chat modal
    // this.router.navigate(['/chat', friendId]);
    console.log('Starting private chat with:', friendId);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    // Don't disconnect socket here if you want to keep it alive across navigation
    // this.enhancedSocketService.disconnect();
  }
}
```

## 3. Enhanced Template with Status Indicators

```html
<!-- friends.component.html (Enhanced sections) -->

<!-- Connection Status Indicator -->
<div class="connection-status mb-4">
  <div class="flex items-center space-x-2">
    <div class="flex items-center space-x-1">
      <div 
        class="w-3 h-3 rounded-full"
        [class]="(isConnected$ | async) ? 'bg-green-500' : 'bg-red-500'"
      ></div>
      <span class="text-sm text-gray-600">
        {{ (isConnected$ | async) ? 'Verbunden' : 'Getrennt' }}
      </span>
    </div>

    <!-- User Status Selector -->
    <div class="relative">
      <button 
        (click)="toggleStatusSelector()"
        class="flex items-center space-x-1 px-2 py-1 rounded text-sm border"
        [class]="getStatusClass(currentUserStatus)"
      >
        <div class="w-2 h-2 rounded-full" [class]="getStatusDotClass(currentUserStatus)"></div>
        <span>{{ getStatusText(currentUserStatus) }}</span>
      </button>

      <!-- Status Dropdown -->
      <div 
        *ngIf="showOnlineStatusSelector"
        class="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-10"
      >
        <button 
          (click)="changeStatus('ONLINE')"
          class="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
        >
          <div class="w-2 h-2 rounded-full bg-green-500"></div>
          <span>Online</span>
        </button>
        <button 
          (click)="changeStatus('AWAY')"
          class="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
        >
          <div class="w-2 h-2 rounded-full bg-yellow-500"></div>
          <span>Abwesend</span>
        </button>
        <button 
          (click)="changeStatus('DO_NOT_DISTURB')"
          class="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
        >
          <div class="w-2 h-2 rounded-full bg-red-500"></div>
          <span>Nicht stören</span>
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Enhanced Friend List with Status -->
<div class="friends-list">
  <div *ngFor="let friend of friends" class="friend-item p-3 border-b flex items-center justify-between">
    <div class="flex items-center space-x-3">
      <!-- Avatar with Status Indicator -->
      <div class="relative">
        <img 
          [src]="friend.avatar || '/assets/default-avatar.png'" 
          [alt]="friend.username"
          class="w-10 h-10 rounded-full"
        >
        <!-- Online Status Dot -->
        <div 
          class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
          [class]="getStatusDotClass(friend.status || 'OFFLINE')"
        ></div>
      </div>

      <div>
        <h3 class="font-medium">{{ friend.username }}</h3>
        <p class="text-sm text-gray-500">
          <span *ngIf="friend.isOnline; else lastSeenTemplate">
            {{ getStatusText(friend.status) }}
          </span>
          <ng-template #lastSeenTemplate>
            Zuletzt online: {{ formatLastSeen(friend.lastSeen) }}
          </ng-template>
        </p>
      </div>
    </div>

    <!-- Friend Actions -->
    <div class="flex space-x-2">
      <button 
        *ngIf="friend.isOnline"
        (click)="startPrivateChat(friend.id)"
        class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
      >
        Chat
      </button>
      <button 
        (click)="checkFriendStatus(friend.id)"
        class="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
      >
        Status
      </button>
    </div>
  </div>
</div>

<!-- Online Friends Section -->
<div class="online-friends mt-6" *ngIf="(onlineUsers$ | async)?.length">
  <h3 class="font-semibold mb-3">Online Freunde ({{ (onlineUsers$ | async)?.length }})</h3>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
    <div 
      *ngFor="let user of (onlineUsers$ | async)" 
      class="online-user-card p-3 border rounded flex items-center space-x-2"
    >
      <div class="relative">
        <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
        <div 
          class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white"
          [class]="getStatusDotClass(user.status)"
        ></div>
      </div>
      <div>
        <p class="font-medium text-sm">{{ user.username }}</p>
        <p class="text-xs text-gray-500">{{ getStatusText(user.status) }}</p>
      </div>
    </div>
  </div>
</div>
```

## 4. Component Helper Methods

```typescript
// Helper methods for the enhanced component
getStatusClass(status: string): string {
  switch (status) {
    case 'ONLINE': return 'border-green-500 text-green-700';
    case 'AWAY': return 'border-yellow-500 text-yellow-700';
    case 'DO_NOT_DISTURB': return 'border-red-500 text-red-700';
    default: return 'border-gray-500 text-gray-700';
  }
}

getStatusDotClass(status: string): string {
  switch (status) {
    case 'ONLINE': return 'bg-green-500';
    case 'AWAY': return 'bg-yellow-500';
    case 'DO_NOT_DISTURB': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}

getStatusText(status: string): string {
  switch (status) {
    case 'ONLINE': return 'Online';
    case 'AWAY': return 'Abwesend';
    case 'DO_NOT_DISTURB': return 'Nicht stören';
    default: return 'Offline';
  }
}

formatLastSeen(lastSeen: string): string {
  if (!lastSeen) return 'Unbekannt';
  
  const date = new Date(lastSeen);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Gerade eben';
  if (diffMins < 60) return `vor ${diffMins} Min`;
  if (diffHours < 24) return `vor ${diffHours} Std`;
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  
  return date.toLocaleDateString('de-DE');
}
```

This enhanced system gives you:
- ✅ Real-time online/offline status
- ✅ User status indicators (Online, Away, Do Not Disturb)
- ✅ Last seen timestamps
- ✅ Heartbeat monitoring
- ✅ Basic chat room support
- ✅ Typing indicators
- ✅ Enhanced UI with status displays

Möchten Sie, dass ich Ihnen helfe, einen bestimmten Teil davon zu implementieren?
