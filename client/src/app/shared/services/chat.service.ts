import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface CreateServerDto {
  name: string;
  description?: string;
  isPrivate: boolean;
  ownerId: string;
}

export interface CreateChannelDto {
  name: string;
  description?: string;
  isPrivate: boolean;
  serverId: string;
}

export interface SendMessageDto {
  content: string;
  senderId: string;
  channelId?: string;
  receiverId?: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
}

export interface ChatServer {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  isPrivate: boolean;
  inviteCode?: string;
  owner: {
    id: string;
    username: string;
    avatar?: string;
  };
  channels: ChatChannel[];
  _count: {
    members: number;
    channels: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  channelId?: string;
  receiverId?: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: string;
    username: string;
    avatar?: string;
  };
  receiver?: {
    id: string;
    username: string;
    avatar?: string;
  };
  reactions: MessageReaction[];
}

export interface MessageReaction {
  id: string;
  emoji: string;
  userId: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface Friend {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  displayId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly baseUrl = 'http://localhost:3000/chat';

  constructor(private http: HttpClient) {}

  // Server management
  async getUserServers(): Promise<ChatServer[]> {
    const url = `${this.baseUrl}/servers`;
    return firstValueFrom(this.http.get<ChatServer[]>(url));
  }

  async getServerDetails(serverId: string): Promise<ChatServer> {
    const url = `${this.baseUrl}/servers/${serverId}`;
    return firstValueFrom(this.http.get<ChatServer>(url));
  }

  async createServer(data: CreateServerDto): Promise<ChatServer> {
    const url = `${this.baseUrl}/servers`;
    return firstValueFrom(this.http.post<ChatServer>(url, data));
  }

  async joinServer(inviteCode: string): Promise<ChatServer> {
    const url = `${this.baseUrl}/servers/join`;
    return firstValueFrom(this.http.post<ChatServer>(url, { inviteCode }));
  }

  async leaveServer(serverId: string): Promise<void> {
    const url = `${this.baseUrl}/servers/${serverId}/leave`;
    return firstValueFrom(this.http.delete<void>(url));
  }

  // Channel management
  async createChannel(data: CreateChannelDto): Promise<ChatChannel> {
    const url = `${this.baseUrl}/servers/${data.serverId}/channels`;
    return firstValueFrom(this.http.post<ChatChannel>(url, {
      name: data.name,
      description: data.description,
      isPrivate: data.isPrivate
    }));
  }

  // Message management
  async getChannelMessages(channelId: string): Promise<ChatMessage[]> {
    const url = `${this.baseUrl}/channels/${channelId}/messages`;
    return firstValueFrom(this.http.get<ChatMessage[]>(url));
  }

  async getDirectMessages(friendId: string): Promise<ChatMessage[]> {
    const url = `${this.baseUrl}/direct-messages/${friendId}`;
    return firstValueFrom(this.http.get<ChatMessage[]>(url));
  }

  async sendMessage(data: SendMessageDto): Promise<ChatMessage> {
    const url = `${this.baseUrl}/messages`;
    return firstValueFrom(this.http.post<ChatMessage>(url, data));
  }

  async sendChannelMessage(channelId: string, messageData: any): Promise<ChatMessage> {
    const sendData: SendMessageDto = {
      content: messageData.content,
      senderId: messageData.senderId,
      channelId: channelId,
      messageType: messageData.messageType || 'TEXT'
    };
    return this.sendMessage(sendData);
  }

  async sendDirectMessage(receiverId: string, messageData: any): Promise<ChatMessage> {
    const sendData: SendMessageDto = {
      content: messageData.content,
      senderId: messageData.senderId,
      receiverId: receiverId,
      messageType: messageData.messageType || 'TEXT'
    };
    return this.sendMessage(sendData);
  }

  async editMessage(messageId: string, content: string): Promise<ChatMessage> {
    const url = `${this.baseUrl}/messages/${messageId}`;
    return firstValueFrom(this.http.put<ChatMessage>(url, { content }));
  }

  async deleteMessage(messageId: string): Promise<void> {
    const url = `${this.baseUrl}/messages/${messageId}`;
    return firstValueFrom(this.http.delete<void>(url));
  }

  async addReaction(messageId: string, emoji: string): Promise<MessageReaction> {
    const url = `${this.baseUrl}/messages/${messageId}/reactions`;
    return firstValueFrom(this.http.post<MessageReaction>(url, { emoji }));
  }

  // Invite management
  async createInvite(serverId: string, expiresAt?: string, maxUses?: number): Promise<{ code: string; expiresAt?: string; maxUses?: number }> {
    const url = `${this.baseUrl}/servers/${serverId}/invites`;
    return firstValueFrom(this.http.post<{ code: string; expiresAt?: string; maxUses?: number }>(url, {
      expiresAt,
      maxUses
    }));
  }

  // Friends (for direct messages) - this might need to be moved to a separate service
  async getFriends(userId: string): Promise<Friend[]> {
    const url = `http://localhost:3000/friends/list/${userId}`;
    return firstValueFrom(this.http.get<Friend[]>(url));
  }
}
