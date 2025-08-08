import { Injectable } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { ChatSocketService } from './chat-socket.service';
import { FriendsSocketService } from './friends-socket.service';
import { 
  OnlineUser, 
  ChatMessage, 
  DirectMessage, 
  FriendRequest, 
  SocketNotification,
  ConnectionState 
} from '../interfaces/socket.interfaces';

/**
 * Main Socket Coordinator Service
 * Provides a unified interface to all socket services
 * Acts as a facade for the specialized socket services
 */
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  // Unified observables
  public readonly connected$: Observable<boolean>;
  public readonly connectionState$: Observable<ConnectionState>;
  
  // Chat observables
  public readonly newMessages$: Observable<ChatMessage | null>;
  public readonly typingUsers$: Observable<string[]>;
  public readonly currentChannel$: Observable<number | null>;
  public readonly currentServer$: Observable<number | null>;
  
  // Friends observables
  public readonly currentUserStatus$: Observable<string>;
  public readonly onlineUsers$: Observable<OnlineUser[]>;
  public readonly newDirectMessages$: Observable<DirectMessage | null>;
  public readonly friendRequests$: Observable<FriendRequest[]>;
  public readonly notifications$: Observable<SocketNotification[]>;

  constructor(
    private chatSocket: ChatSocketService,
    private friendsSocket: FriendsSocketService
  ) {
    // Initialize chat observables
    this.newMessages$ = this.chatSocket.newMessages$;
    this.typingUsers$ = this.chatSocket.typingUsers$;
    this.currentChannel$ = this.chatSocket.currentChannel$;
    this.currentServer$ = this.chatSocket.currentServer$;
    
    // Initialize friends observables
    this.currentUserStatus$ = this.friendsSocket.currentUserStatus$;
    this.onlineUsers$ = this.friendsSocket.onlineUsers$;
    this.newDirectMessages$ = this.friendsSocket.newDirectMessages$;
    this.friendRequests$ = this.friendsSocket.friendRequests$;
    this.notifications$ = this.friendsSocket.notifications$;

    // Combine connection states
    this.connected$ = combineLatest([
      this.chatSocket.connected$,
      this.friendsSocket.connected$
    ]).pipe(
      map(([chatConnected, friendsConnected]) => chatConnected && friendsConnected)
    );

    this.connectionState$ = combineLatest([
      this.chatSocket.connectionState$,
      this.friendsSocket.connectionState$
    ]).pipe(
      map(([chatState, friendsState]) => ({
        connected: chatState.connected && friendsState.connected,
        reconnecting: chatState.reconnecting || friendsState.reconnecting,
        error: chatState.error || friendsState.error,
        lastConnected: chatState.lastConnected || friendsState.lastConnected
      }))
    );
  }

  // ===== CONNECTION MANAGEMENT =====
  
  public connect(userId: number, username: string, avatar?: string): void {
    console.log('🔌 Connecting to all sockets:', { userId, username, avatar });
    this.chatSocket.connect();
    this.friendsSocket.connect();
  }

  public disconnect(): void {
    console.log('🔌 Disconnecting from all sockets');
    this.chatSocket.disconnect();
    this.friendsSocket.disconnect();
  }

  public isConnected(): boolean {
    return this.chatSocket.isConnected() && this.friendsSocket.isConnected();
  }

  // ===== CHAT METHODS =====
  
  public sendChatMessage(content: string, channelId?: number, serverId?: number): void;
  public sendChatMessage(messageData: any): void;
  public sendChatMessage(contentOrData: string | any, channelId?: number, serverId?: number): void {
    this.chatSocket.sendMessage(contentOrData as any, channelId, serverId);
  }

  public joinChannel(channelId: number | string, serverId?: number | string): void {
    this.chatSocket.joinChannel(channelId, serverId);
  }

  public leaveChannel(channelId: number | string, serverId?: number | string): void {
    this.chatSocket.leaveChannel(channelId, serverId);
  }

  public joinServer(serverId: number | string): void {
    this.chatSocket.joinServer(serverId);
  }

  public leaveServer(serverId: number | string): void {
    this.chatSocket.leaveServer(serverId);
  }

  public startTyping(channelId: number, serverId?: number): void {
    this.chatSocket.startTyping(channelId, serverId);
  }

  public stopTyping(channelId: number, serverId?: number): void {
    this.chatSocket.stopTyping(channelId, serverId);
  }

  // ===== FRIENDS METHODS =====
  
  public updateStatus(status: 'online' | 'offline' | 'away' | 'busy' | 'ONLINE' | 'AWAY' | 'DO_NOT_DISTURB' | 'OFFLINE'): void {
    this.friendsSocket.updateStatus(status);
  }

  public sendFriendRequest(targetUserId: number): void {
    this.friendsSocket.sendFriendRequest(targetUserId);
  }

  public acceptFriendRequest(requestId: number): void {
    this.friendsSocket.acceptFriendRequest(requestId);
  }

  public declineFriendRequest(requestId: number): void {
    this.friendsSocket.declineFriendRequest(requestId);
  }

  public sendDirectMessage(receiverId: number, content: string): void {
    this.friendsSocket.sendDirectMessage(receiverId, content);
  }

  public getOnlineFriends(): void {
    this.friendsSocket.getOnlineFriends();
  }

  public requestFriendStatus(friendId: number | string): void {
    const id = typeof friendId === 'string' ? parseInt(friendId) : friendId;
    this.friendsSocket.requestFriendStatus(id);
  }

  public isUserOnline(userId: number | string): boolean {
    return this.friendsSocket.isUserOnline(userId);
  }

  public getUserStatus(userId: number | string): OnlineUser | null {
    return this.friendsSocket.getUserStatus(userId);
  }

  public formatLastSeen(lastSeen: Date | string): string {
    return this.friendsSocket.formatLastSeen(lastSeen);
  }

  // ===== NOTIFICATION METHODS =====
  
  public markNotificationAsRead(notificationId: string): void {
    this.friendsSocket.markNotificationAsRead(notificationId);
  }

  public clearNotifications(): void {
    this.friendsSocket.clearNotifications();
  }

  // ===== GETTER METHODS =====
  
  public getCurrentUserStatus(): string {
    return this.friendsSocket.getCurrentUserStatus();
  }

  public getOnlineUsers(): OnlineUser[] {
    return this.friendsSocket.getOnlineUsers();
  }

  public getFriendRequests(): FriendRequest[] {
    return this.friendsSocket.getFriendRequests();
  }

  public getNotifications(): SocketNotification[] {
    return this.friendsSocket.getNotifications();
  }

  public getCurrentChannel(): number | null {
    return this.chatSocket.getCurrentChannel();
  }

  public getCurrentServer(): number | null {
    return this.chatSocket.getCurrentServer();
  }

  public getTypingUsers(): string[] {
    return this.chatSocket.getTypingUsers();
  }

  // ===== LEGACY COMPATIBILITY METHODS =====
  
  public connectToChat(): void {
    this.chatSocket.connect();
  }

  public disconnectFromChat(): void {
    this.chatSocket.disconnect();
  }

  public isChatConnected(): boolean {
    return this.chatSocket.isConnected();
  }

  // Aliases for backward compatibility
  public get chatConnected$(): Observable<boolean> {
    return this.chatSocket.connected$;
  }
}
