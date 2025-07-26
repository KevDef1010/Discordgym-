import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, BehaviorSubject } from 'rxjs';

export interface FriendRequestNotification {
  type: 'FRIEND_REQUEST' | 'FRIEND_REQUEST_RESPONSE' | 'FRIEND_ONLINE' | 'FRIEND_OFFLINE';
  sender?: any;
  user?: any;
  userId?: string;
  status?: string;
  friendship?: any;
  message?: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private connected = new BehaviorSubject<boolean>(false);
  private notifications = new BehaviorSubject<FriendRequestNotification | null>(null);

  // Observables für Components
  public connected$ = this.connected.asObservable();
  public notifications$ = this.notifications.asObservable();

  constructor() {}

  // Socket.IO Verbindung initialisieren
  connect(userId: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io('http://localhost:3000/friends', {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true
    });

    // Verbindungs-Events
    this.socket.on('connect', () => {
      console.log('🔗 Connected to WebSocket server:', this.socket?.id);
      this.connected.next(true);
      
      // User bei Server registrieren
      this.socket?.emit('join-user', { userId });
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server');
      this.connected.next(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚫 Connection error:', error);
      this.connected.next(false);
    });

    // Friend Request Notifications
    this.socket.on('friend-request-received', (data: FriendRequestNotification) => {
      console.log('📩 Friend request received:', data);
      this.notifications.next(data);
    });

    this.socket.on('friend-request-response', (data: FriendRequestNotification) => {
      console.log('✅ Friend request response:', data);
      this.notifications.next(data);
    });

    this.socket.on('friend-online', (data: FriendRequestNotification) => {
      console.log('🟢 Friend came online:', data);
      this.notifications.next(data);
    });

    this.socket.on('friend-offline', (data: FriendRequestNotification) => {
      console.log('🔴 Friend went offline:', data);
      this.notifications.next(data);
    });
  }

  // Socket.IO Verbindung trennen
  disconnect(): void {
    if (this.socket) {
      this.socket.emit('leave-user', { userId: this.getCurrentUserId() });
      this.socket.disconnect();
      this.socket = null;
      this.connected.next(false);
      console.log('🔌 Disconnected from WebSocket server');
    }
  }

  // User bei Server registrieren
  joinUser(userId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-user', { userId });
    }
  }

  // User vom Server abmelden
  leaveUser(userId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-user', { userId });
    }
  }

  // Verbindungsstatus prüfen
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Aktuelle User ID holen (aus AuthService oder localStorage)
  private getCurrentUserId(): string {
    // TODO: Integration mit AuthService
    return localStorage.getItem('currentUserId') || '';
  }

  // Notifikationen löschen
  clearNotifications(): void {
    this.notifications.next(null);
  }
}
