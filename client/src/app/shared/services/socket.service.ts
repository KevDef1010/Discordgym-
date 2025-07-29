import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';

// Kompatible Interfaces für bestehende Komponenten
export interface OnlineUser {
  id: number;
  userId: number;
  username: string;
  displayName: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy' | 'ONLINE' | 'AWAY' | 'DO_NOT_DISTURB' | 'OFFLINE';
  isOnline: boolean;
  lastSeen?: Date | string;
  lastActivity?: Date | string;
}

export interface ChatMessage {
  id: number;
  content: string;
  userId: number | string;
  senderId: number | string;
  channelId: number | string;
  serverId: number | string;
  timestamp: Date;
  createdAt?: Date;
  messageType?: string;
  isEdited?: boolean;
  reactions?: any[];
  senderUsername: string;
  senderAvatar?: string;
  user: {
    id: number;
    username: string;
    displayName: string;
    avatar?: string;
  };
  sender?: {
    id: number;
    username: string;
    displayName: string;
    avatar?: string;
  };
}

export interface DirectMessage {
  id: number;
  content: string;
  senderId: number | string;
  receiverId: number | string;
  timestamp: Date;
  createdAt?: Date;
  reactions?: any[];
  senderUsername?: string;
  senderAvatar?: string;
  sender: {
    id: number;
    username: string;
    displayName: string;
    avatar?: string;
  };
}

export interface FriendRequest {
  id: number;
  senderId: number;
  receiverId: number;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: Date;
  sender: {
    id: number;
    username: string;
    displayName: string;
    avatar?: string;
  };
}

export interface Notification {
  id: string;
  type: 'friend_request' | 'message' | 'system' | 'FRIEND_REQUEST' | 'FRIEND_REQUEST_RESPONSE' | 'FRIEND_ONLINE' | 'FRIEND_OFFLINE';
  title: string;
  message: string;
  timestamp: Date | string;
  read: boolean;
  data?: any;
  status?: 'ACCEPTED' | 'DECLINED' | string;
  sender?: {
    id: number;
    username: string;
    displayName: string;
    avatar?: string;
  };
  user?: {
    id: number;
    username: string;
    displayName: string;
    avatar?: string;
  };
}

export interface FriendRequestNotification extends Notification {
  type: 'friend_request' | 'FRIEND_REQUEST' | 'FRIEND_REQUEST_RESPONSE';
  data: FriendRequest;
  status?: 'ACCEPTED' | 'DECLINED' | string;
  sender?: {
    id: number;
    username: string;
    displayName: string;
    avatar?: string;
  };
  user?: {
    id: number;
    username: string;
    displayName: string;
    avatar?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private chatSocket: Socket | null = null;
  private friendsSocket: Socket | null = null;

  // Connection states
  private _connected$ = new BehaviorSubject<boolean>(false);
  private _chatConnected$ = new BehaviorSubject<boolean>(false);

  // User status and online users
  private _currentUserStatus$ = new BehaviorSubject<string>('offline');
  private _onlineUsers$ = new BehaviorSubject<OnlineUser[]>([]);

  // Chat-related subjects
  private _newMessages$ = new BehaviorSubject<ChatMessage | null>(null);
  private _newDirectMessages$ = new BehaviorSubject<DirectMessage | null>(null);

  // Friends-related subjects
  private _friendRequests$ = new BehaviorSubject<FriendRequest[]>([]);
  private _notifications$ = new BehaviorSubject<Notification[]>([]);

  // Public observables
  public readonly connected$ = this._connected$.asObservable();
  public readonly chatConnected$ = this._chatConnected$.asObservable();
  public readonly currentUserStatus$ = this._currentUserStatus$.asObservable();
  public readonly onlineUsers$ = this._onlineUsers$.asObservable();
  public readonly newMessages$ = this._newMessages$.asObservable();
  public readonly newDirectMessages$ = this._newDirectMessages$.asObservable();
  public readonly friendRequests$ = this._friendRequests$.asObservable();
  public readonly notifications$ = this._notifications$.asObservable();

  constructor() {
    this.initializeConnections();
  }

  private initializeConnections(): void {
    // Main socket connection
    this.socket = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    // Friends namespace
    this.friendsSocket = io('http://localhost:3000/friends', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    // Chat namespace
    this.chatSocket = io('http://localhost:3000/chat', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    this.setupMainSocketEvents();
    this.setupFriendsSocketEvents();
    this.setupChatSocketEvents();
  }

  private setupMainSocketEvents(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Main socket connected');
      this._connected$.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Main socket disconnected');
      this._connected$.next(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Main socket connection error:', error);
      this._connected$.next(false);
    });
  }

  private setupFriendsSocketEvents(): void {
    if (!this.friendsSocket) return;

    this.friendsSocket.on('connect', () => {
      console.log('✅ Friends socket connected');
    });

    this.friendsSocket.on('disconnect', () => {
      console.log('❌ Friends socket disconnected');
    });

    // Online users updates
    this.friendsSocket.on('onlineUsersUpdate', (users: OnlineUser[]) => {
      console.log('👥 Online users updated:', users);
      this._onlineUsers$.next(users);
    });

    // User status updates
    this.friendsSocket.on('userStatusUpdate', (data: { userId: number, status: string }) => {
      console.log('📊 User status updated:', data);
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser.id === data.userId) {
        this._currentUserStatus$.next(data.status);
      }
    });

    // Friend request events
    this.friendsSocket.on('friendRequestReceived', (request: FriendRequest) => {
      console.log('👫 Friend request received:', request);
      const currentRequests = this._friendRequests$.value;
      this._friendRequests$.next([...currentRequests, request]);
      
      // Add notification
      this.addNotification({
        id: `friend_request_${request.id}`,
        type: 'friend_request',
        title: 'New Friend Request',
        message: `${request.sender.displayName} wants to be your friend`,
        timestamp: new Date(),
        read: false,
        data: request
      });
    });

    this.friendsSocket.on('friendRequestAccepted', (data: any) => {
      console.log('✅ Friend request accepted:', data);
      this.addNotification({
        id: `friend_accepted_${data.id}`,
        type: 'friend_request',
        title: 'Friend Request Accepted',
        message: `${data.user.displayName} accepted your friend request`,
        timestamp: new Date(),
        read: false,
        data: data
      });
    });

    // Direct message events
    this.friendsSocket.on('directMessageReceived', (message: DirectMessage) => {
      console.log('💬 Direct message received:', message);
      this._newDirectMessages$.next(message);
    });
  }

  private setupChatSocketEvents(): void {
    if (!this.chatSocket) return;

    this.chatSocket.on('connect', () => {
      console.log('✅ Chat socket connected');
      this._chatConnected$.next(true);
    });

    this.chatSocket.on('disconnect', () => {
      console.log('❌ Chat socket disconnected');
      this._chatConnected$.next(false);
    });

    // Chat message events
    this.chatSocket.on('messageReceived', (message: any) => {
      console.log('💬 Chat message received:', message);
      
      // Kompatible Nachricht erstellen
      const chatMessage: ChatMessage = {
        id: message.id,
        content: message.content,
        userId: message.userId,
        senderId: message.senderId || message.userId,
        channelId: message.channelId,
        serverId: message.serverId,
        timestamp: message.timestamp,
        createdAt: message.createdAt || message.timestamp,
        messageType: message.messageType || 'text',
        isEdited: message.isEdited || false,
        reactions: message.reactions || [],
        senderUsername: message.sender?.username || message.senderUsername || message.user?.username || 'Unknown',
        senderAvatar: message.sender?.avatar || message.senderAvatar || message.user?.avatar,
        user: message.user || {
          id: message.userId,
          username: message.sender?.username || 'Unknown',
          displayName: message.sender?.displayName || 'Unknown',
          avatar: message.sender?.avatar
        },
        sender: message.sender
      };
      
      this._newMessages$.next(chatMessage);
    });

    this.chatSocket.on('userJoinedChannel', (data: any) => {
      console.log('👋 User joined channel:', data);
    });

    this.chatSocket.on('userLeftChannel', (data: any) => {
      console.log('👋 User left channel:', data);
    });
  }

  // Public methods for connection management
  public connectToChat(): void {
    if (!this.chatSocket?.connected) {
      this.chatSocket?.connect();
    }
  }

  public connect(userId: number, username: string, avatar?: string): void {
    console.log('🔌 Connecting to main socket:', { userId, username, avatar });
    
    if (!this.socket?.connected) {
      this.socket?.connect();
    }
    
    if (!this.friendsSocket?.connected) {
      this.friendsSocket?.connect();
    }
    
    if (!this.chatSocket?.connected) {
      this.chatSocket?.connect();
    }
  }

  public disconnectFromChat(): void {
    this.chatSocket?.disconnect();
    this._chatConnected$.next(false);
  }

  // Chat methods
  public sendChatMessage(content: string, channelId?: number, serverId?: number): void;
  public sendChatMessage(messageData: any): void;
  public sendChatMessage(contentOrData: string | any, channelId?: number, serverId?: number): void {
    if (!this.chatSocket?.connected) {
      console.error('❌ Chat socket not connected');
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.id) {
      console.error('❌ No current user found');
      return;
    }

    let messageData: any;

    if (typeof contentOrData === 'string') {
      // Old signature: sendChatMessage(content, channelId, serverId)
      messageData = {
        content: contentOrData,
        channelId: channelId || 1,
        serverId: serverId || 1,
        userId: currentUser.id
      };
    } else {
      // New signature: sendChatMessage(messageData)
      messageData = {
        ...contentOrData,
        userId: currentUser.id
      };
    }

    console.log('📤 Sending chat message:', messageData);
    this.chatSocket.emit('sendMessage', messageData);
  }

  public joinChannel(channelId: number | string, serverId?: number | string): void {
    if (!this.chatSocket?.connected) {
      console.error('❌ Chat socket not connected');
      return;
    }

    const cId = typeof channelId === 'string' ? parseInt(channelId) : channelId;
    const sId = serverId ? (typeof serverId === 'string' ? parseInt(serverId) : serverId) : 1;

    console.log('🚪 Joining channel:', { channelId: cId, serverId: sId });
    this.chatSocket.emit('joinChannel', { channelId: cId, serverId: sId });
  }

  public leaveChannel(channelId: number | string, serverId?: number | string): void {
    if (!this.chatSocket?.connected) {
      console.error('❌ Chat socket not connected');
      return;
    }

    const cId = typeof channelId === 'string' ? parseInt(channelId) : channelId;
    const sId = serverId ? (typeof serverId === 'string' ? parseInt(serverId) : serverId) : 1;

    console.log('🚪 Leaving channel:', { channelId: cId, serverId: sId });
    this.chatSocket.emit('leaveChannel', { channelId: cId, serverId: sId });
  }

  public joinServer(serverId: number | string, userId?: number | string): void {
    if (!this.chatSocket?.connected) {
      console.error('❌ Chat socket not connected');
      return;
    }

    const sId = typeof serverId === 'string' ? parseInt(serverId) : serverId;
    console.log('🏠 Joining server:', sId);
    this.chatSocket.emit('joinServer', { serverId: sId });
  }

  public leaveServer(serverId: number | string, userId?: number | string): void {
    if (!this.chatSocket?.connected) {
      console.error('❌ Chat socket not connected');
      return;
    }

    const sId = typeof serverId === 'string' ? parseInt(serverId) : serverId;
    console.log('🏠 Leaving server:', sId);
    this.chatSocket.emit('leaveServer', { serverId: sId });
  }

  // Friends methods
  public updateStatus(status: 'online' | 'offline' | 'away' | 'busy' | 'ONLINE' | 'AWAY' | 'DO_NOT_DISTURB' | 'OFFLINE'): void {
    if (!this.friendsSocket?.connected) {
      console.error('❌ Friends socket not connected');
      return;
    }

    // Status-Mapping für Kompatibilität
    let normalizedStatus = status;
    switch (status) {
      case 'ONLINE': normalizedStatus = 'online'; break;
      case 'AWAY': normalizedStatus = 'away'; break;
      case 'DO_NOT_DISTURB': normalizedStatus = 'busy'; break;
      case 'OFFLINE': normalizedStatus = 'offline'; break;
    }

    console.log('📊 Updating status to:', normalizedStatus);
    this.friendsSocket.emit('updateStatus', { status: normalizedStatus });
    this._currentUserStatus$.next(normalizedStatus);
  }

  public sendFriendRequest(targetUserId: number): void {
    if (!this.friendsSocket?.connected) {
      console.error('❌ Friends socket not connected');
      return;
    }

    console.log('👫 Sending friend request to user:', targetUserId);
    this.friendsSocket.emit('sendFriendRequest', { targetUserId });
  }

  public acceptFriendRequest(requestId: number): void {
    if (!this.friendsSocket?.connected) {
      console.error('❌ Friends socket not connected');
      return;
    }

    console.log('✅ Accepting friend request:', requestId);
    this.friendsSocket.emit('acceptFriendRequest', { requestId });
  }

  public declineFriendRequest(requestId: number): void {
    if (!this.friendsSocket?.connected) {
      console.error('❌ Friends socket not connected');
      return;
    }

    console.log('❌ Declining friend request:', requestId);
    this.friendsSocket.emit('declineFriendRequest', { requestId });
  }

  public sendDirectMessage(receiverId: number, content: string): void {
    if (!this.friendsSocket?.connected) {
      console.error('❌ Friends socket not connected');
      return;
    }

    const messageData = {
      receiverId,
      content
    };

    console.log('📤 Sending direct message:', messageData);
    this.friendsSocket.emit('sendDirectMessage', messageData);
  }

  // Notification methods
  private addNotification(notification: Notification): void {
    const currentNotifications = this._notifications$.value;
    this._notifications$.next([notification, ...currentNotifications]);
  }

  public markNotificationAsRead(notificationId: string): void {
    const currentNotifications = this._notifications$.value;
    const updatedNotifications = currentNotifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    this._notifications$.next(updatedNotifications);
  }

  public clearNotifications(): void {
    this._notifications$.next([]);
  }

  // Utility methods
  public isConnected(): boolean {
    return this._connected$.value;
  }

  public isChatConnected(): boolean {
    return this._chatConnected$.value;
  }

  public getCurrentUserStatus(): string {
    return this._currentUserStatus$.value;
  }

  public getOnlineUsers(): OnlineUser[] {
    return this._onlineUsers$.value;
  }

  // Additional utility methods for Friends component
  public getOnlineFriends(): void {
    if (!this.friendsSocket?.connected) {
      console.error('❌ Friends socket not connected');
      return;
    }
    
    console.log('👥 Requesting online friends');
    this.friendsSocket.emit('getOnlineFriends');
  }

  public formatLastSeen(lastSeen: Date | string): string {
    if (!lastSeen) return 'Unknown';
    
    const lastSeenDate = typeof lastSeen === 'string' ? new Date(lastSeen) : lastSeen;
    const now = new Date();
    const diff = now.getTime() - lastSeenDate.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  public requestFriendStatus(friendId: number | string): void {
    if (!this.friendsSocket?.connected) {
      console.error('❌ Friends socket not connected');
      return;
    }
    
    const id = typeof friendId === 'string' ? parseInt(friendId) : friendId;
    console.log('📊 Requesting friend status for:', id);
    this.friendsSocket.emit('requestFriendStatus', { friendId: id });
  }

  public isUserOnline(userId: number | string): boolean {
    const id = typeof userId === 'string' ? parseInt(userId) : userId;
    return this._onlineUsers$.value.some(user => user.userId === id && user.isOnline);
  }

  public getUserStatus(userId: number | string): OnlineUser | null {
    const id = typeof userId === 'string' ? parseInt(userId) : userId;
    return this._onlineUsers$.value.find(user => user.userId === id) || null;
  }

  // Cleanup
  public disconnect(): void {
    this.socket?.disconnect();
    this.chatSocket?.disconnect();
    this.friendsSocket?.disconnect();
    
    this._connected$.next(false);
    this._chatConnected$.next(false);
    this._currentUserStatus$.next('offline');
    this._onlineUsers$.next([]);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
