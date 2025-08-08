import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BaseSocketService } from './base-socket.service';
import { ChatMessage } from '../interfaces/socket.interfaces';

/**
 * Chat Socket Service
 * Handles all chat-related real-time functionality
 */
@Injectable({
  providedIn: 'root'
})
export class ChatSocketService extends BaseSocketService {
  // Chat-specific state
  private _newMessages$ = new BehaviorSubject<ChatMessage | null>(null);
  private _typingUsers$ = new BehaviorSubject<string[]>([]);
  private _currentChannel$ = new BehaviorSubject<number | null>(null);
  private _currentServer$ = new BehaviorSubject<number | null>(null);

  // Public observables
  public readonly newMessages$ = this._newMessages$.asObservable();
  public readonly typingUsers$ = this._typingUsers$.asObservable();
  public readonly currentChannel$ = this._currentChannel$.asObservable();
  public readonly currentServer$ = this._currentServer$.asObservable();

  constructor() {
    super();
    this.initialize('/chat');
    this.setupChatEvents();
  }

  private setupChatEvents(): void {
    // Message events
    this.on<any>('messageReceived', (message) => {
      console.log('💬 Chat message received:', message);
      
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

    // Typing events
    this.on<{userId: number, username: string, channelId: number}>('userTyping', (data) => {
      console.log('⌨️ User typing:', data);
      const current = this._typingUsers$.value;
      if (!current.includes(data.username)) {
        this._typingUsers$.next([...current, data.username]);
      }
    });

    this.on<{userId: number, username: string, channelId: number}>('userStoppedTyping', (data) => {
      console.log('⌨️ User stopped typing:', data);
      const current = this._typingUsers$.value;
      this._typingUsers$.next(current.filter(u => u !== data.username));
    });

    // Channel/Server events
    this.on<any>('userJoinedChannel', (data) => {
      console.log('👋 User joined channel:', data);
    });

    this.on<any>('userLeftChannel', (data) => {
      console.log('👋 User left channel:', data);
    });

    this.on<any>('channelUpdated', (data) => {
      console.log('🔄 Channel updated:', data);
    });
  }

  // Chat methods
  public sendMessage(content: string, channelId?: number, serverId?: number): void;
  public sendMessage(messageData: any): void;
  public sendMessage(contentOrData: string | any, channelId?: number, serverId?: number): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.id) {
      console.error('❌ No current user found');
      return;
    }

    let messageData: any;
    if (typeof contentOrData === 'string') {
      messageData = {
        content: contentOrData,
        channelId: channelId || this._currentChannel$.value || 1,
        serverId: serverId || this._currentServer$.value || 1,
        userId: currentUser.id
      };
    } else {
      messageData = {
        ...contentOrData,
        userId: currentUser.id
      };
    }

    this.emit('sendMessage', messageData);
  }

  public joinChannel(channelId: number | string, serverId?: number | string): void {
    const cId = typeof channelId === 'string' ? parseInt(channelId) : channelId;
    const sId = serverId ? (typeof serverId === 'string' ? parseInt(serverId) : serverId) : 1;

    this._currentChannel$.next(cId);
    this._currentServer$.next(sId);
    
    this.emit('joinChannel', { channelId: cId, serverId: sId });
  }

  public leaveChannel(channelId: number | string, serverId?: number | string): void {
    const cId = typeof channelId === 'string' ? parseInt(channelId) : channelId;
    const sId = serverId ? (typeof serverId === 'string' ? parseInt(serverId) : serverId) : 1;

    if (this._currentChannel$.value === cId) {
      this._currentChannel$.next(null);
    }
    
    this.emit('leaveChannel', { channelId: cId, serverId: sId });
  }

  public joinServer(serverId: number | string): void {
    const sId = typeof serverId === 'string' ? parseInt(serverId) : serverId;
    this._currentServer$.next(sId);
    this.emit('joinServer', { serverId: sId });
  }

  public leaveServer(serverId: number | string): void {
    const sId = typeof serverId === 'string' ? parseInt(serverId) : serverId;
    if (this._currentServer$.value === sId) {
      this._currentServer$.next(null);
      this._currentChannel$.next(null);
    }
    this.emit('leaveServer', { serverId: sId });
  }

  public startTyping(channelId: number, serverId?: number): void {
    this.emit('startTyping', { 
      channelId, 
      serverId: serverId || this._currentServer$.value || 1 
    });
  }

  public stopTyping(channelId: number, serverId?: number): void {
    this.emit('stopTyping', { 
      channelId, 
      serverId: serverId || this._currentServer$.value || 1 
    });
  }

  // Getters
  public getCurrentChannel(): number | null {
    return this._currentChannel$.value;
  }

  public getCurrentServer(): number | null {
    return this._currentServer$.value;
  }

  public getTypingUsers(): string[] {
    return this._typingUsers$.value;
  }

  // Clear typing users when disconnected
  public override disconnect(): void {
    this._typingUsers$.next([]);
    this._currentChannel$.next(null);
    this._currentServer$.next(null);
    super.disconnect();
  }
}
