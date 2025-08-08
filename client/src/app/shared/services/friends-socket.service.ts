import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BaseSocketService } from './base-socket.service';
import { OnlineUser, DirectMessage, FriendRequest, SocketNotification } from '../interfaces/socket.interfaces';

/**
 * Friends Socket Service
 * Handles all friends-related real-time functionality
 */
@Injectable({
  providedIn: 'root'
})
export class FriendsSocketService extends BaseSocketService {
  // Friends-specific state
  private _currentUserStatus$ = new BehaviorSubject<string>('offline');
  private _onlineUsers$ = new BehaviorSubject<OnlineUser[]>([]);
  private _newDirectMessages$ = new BehaviorSubject<DirectMessage | null>(null);
  private _friendRequests$ = new BehaviorSubject<FriendRequest[]>([]);
  private _notifications$ = new BehaviorSubject<SocketNotification[]>([]);

  // Public observables
  public readonly currentUserStatus$ = this._currentUserStatus$.asObservable();
  public readonly onlineUsers$ = this._onlineUsers$.asObservable();
  public readonly newDirectMessages$ = this._newDirectMessages$.asObservable();
  public readonly friendRequests$ = this._friendRequests$.asObservable();
  public readonly notifications$ = this._notifications$.asObservable();

  constructor() {
    super();
    this.initialize('/friends');
    this.setupFriendsEvents();
  }

  private setupFriendsEvents(): void {
    // Online users updates
    this.on<OnlineUser[]>('onlineUsersUpdate', (users) => {
      console.log('👥 Online users updated:', users);
      this._onlineUsers$.next(users);
    });

    // User status updates
    this.on<{userId: number, status: string}>('userStatusUpdate', (data) => {
      console.log('📊 User status updated:', data);
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser.id === data.userId) {
        this._currentUserStatus$.next(data.status);
      }
      
      // Update online users list
      const currentUsers = this._onlineUsers$.value;
      const updatedUsers = currentUsers.map(user => 
        user.userId === data.userId ? { ...user, status: data.status as any } : user
      );
      this._onlineUsers$.next(updatedUsers);
    });

    // Friend request events
    this.on<FriendRequest>('friendRequestReceived', (request) => {
      console.log('👫 Friend request received:', request);
      const currentRequests = this._friendRequests$.value;
      this._friendRequests$.next([...currentRequests, request]);
      
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

    this.on<{requestId: number, user: any}>('friendRequestAccepted', (data) => {
      console.log('✅ Friend request accepted:', data);
      // Remove from pending requests
      const currentRequests = this._friendRequests$.value;
      this._friendRequests$.next(currentRequests.filter(req => req.id !== data.requestId));
      
      this.addNotification({
        id: `friend_accepted_${data.requestId}`,
        type: 'FRIEND_REQUEST_RESPONSE',
        title: 'Friend Request Accepted',
        message: `${data.user.displayName} accepted your friend request`,
        timestamp: new Date(),
        read: false,
        status: 'ACCEPTED',
        data: data
      });
    });

    this.on<{requestId: number, user: any}>('friendRequestDeclined', (data) => {
      console.log('❌ Friend request declined:', data);
      // Remove from pending requests
      const currentRequests = this._friendRequests$.value;
      this._friendRequests$.next(currentRequests.filter(req => req.id !== data.requestId));
    });

    // Direct message events
    this.on<DirectMessage>('directMessageReceived', (message) => {
      console.log('💬 Direct message received:', message);
      this._newDirectMessages$.next(message);
      
      this.addNotification({
        id: `dm_${message.id}`,
        type: 'message',
        title: 'New Direct Message',
        message: `${message.sender?.displayName || 'Unknown'}: ${message.content}`,
        timestamp: new Date(),
        read: false,
        data: message
      });
    });

    // Friend online/offline events
    this.on<{userId: number, username: string, status: string}>('friendOnline', (data) => {
      console.log('🟢 Friend came online:', data);
      this.addNotification({
        id: `friend_online_${data.userId}_${Date.now()}`,
        type: 'FRIEND_ONLINE',
        title: 'Friend Online',
        message: `${data.username} is now online`,
        timestamp: new Date(),
        read: false,
        user: {
          id: data.userId,
          username: data.username,
          displayName: data.username,
        }
      });
    });

    this.on<{userId: number, username: string}>('friendOffline', (data) => {
      console.log('⚫ Friend went offline:', data);
      this.addNotification({
        id: `friend_offline_${data.userId}_${Date.now()}`,
        type: 'FRIEND_OFFLINE',
        title: 'Friend Offline',
        message: `${data.username} went offline`,
        timestamp: new Date(),
        read: false,
        user: {
          id: data.userId,
          username: data.username,
          displayName: data.username,
        }
      });
    });
  }

  // Status management
  public updateStatus(status: 'online' | 'offline' | 'away' | 'busy' | 'ONLINE' | 'AWAY' | 'DO_NOT_DISTURB' | 'OFFLINE'): void {
    // Status mapping for compatibility
    let normalizedStatus = status;
    switch (status) {
      case 'ONLINE': normalizedStatus = 'online'; break;
      case 'AWAY': normalizedStatus = 'away'; break;
      case 'DO_NOT_DISTURB': normalizedStatus = 'busy'; break;
      case 'OFFLINE': normalizedStatus = 'offline'; break;
    }

    this.emit('updateStatus', { status: normalizedStatus });
    this._currentUserStatus$.next(normalizedStatus);
  }

  // Friend requests
  public sendFriendRequest(targetUserId: number): void {
    this.emit('sendFriendRequest', { targetUserId });
  }

  public acceptFriendRequest(requestId: number): void {
    this.emit('acceptFriendRequest', { requestId });
  }

  public declineFriendRequest(requestId: number): void {
    this.emit('declineFriendRequest', { requestId });
  }

  // Direct messages
  public sendDirectMessage(receiverId: number, content: string): void {
    const messageData = { receiverId, content };
    this.emit('sendDirectMessage', messageData);
  }

  // Utility methods
  public getOnlineFriends(): void {
    this.emit('getOnlineFriends', {});
  }

  public requestFriendStatus(friendId: number): void {
    this.emit('requestFriendStatus', { friendId });
  }

  public isUserOnline(userId: number | string): boolean {
    const id = typeof userId === 'string' ? parseInt(userId) : userId;
    return this._onlineUsers$.value.some(user => user.userId === id && user.isOnline);
  }

  public getUserStatus(userId: number | string): OnlineUser | null {
    const id = typeof userId === 'string' ? parseInt(userId) : userId;
    return this._onlineUsers$.value.find(user => user.userId === id) || null;
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

  // Notification management
  private addNotification(notification: SocketNotification): void {
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

  // Getters
  public getCurrentUserStatus(): string {
    return this._currentUserStatus$.value;
  }

  public getOnlineUsers(): OnlineUser[] {
    return this._onlineUsers$.value;
  }

  public getFriendRequests(): FriendRequest[] {
    return this._friendRequests$.value;
  }

  public getNotifications(): SocketNotification[] {
    return this._notifications$.value;
  }

  // Clear state when disconnected
  public override disconnect(): void {
    this._currentUserStatus$.next('offline');
    this._onlineUsers$.next([]);
    this._friendRequests$.next([]);
    super.disconnect();
  }
}
