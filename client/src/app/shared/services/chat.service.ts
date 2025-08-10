/**
 * Chat Service
 * 
 * Provides HTTP client functionality for chat-related operations.
 * Handles server management, channel management, messaging, and friend operations.
 * 
 * Features:
 * - Server creation, joining, and management
 * - Channel creation and message retrieval
 * - Direct messaging between users
 * - Friend management and invitations
 * - Server invite system
 * 
 * @author DiscordGym Team
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Data transfer object for creating a new server
 */
export interface CreateServerDto {
  name: string;
  description?: string;
  isPrivate: boolean;
  ownerId: string;
}

/**
 * Data transfer object for creating a new channel
 */
export interface CreateChannelDto {
  name: string;
  description?: string;
  isPrivate: boolean;
  serverId: string;
}

/**
 * Data transfer object for sending a message
 */
export interface SendMessageDto {
  content: string;
  senderId: string;
  channelId?: string;
  receiverId?: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
}

/**
 * Interface representing a chat server
 */
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

/**
 * Interface representing a chat channel
 */
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

export interface ServerInvite {
  id: string;
  code: string;
  chatServerId: string;
  createdById: string;
  expiresAt?: string;
  maxUses?: number;
  uses: number;
  createdAt: string;
  chatServer?: {
    name: string;
    description?: string;
    _count?: {
      members: number;
    };
  };
  createdBy?: {
    username: string;
  };
}

export interface CreateInviteDto {
  maxUses?: number;
  expiresAt?: string;
}

export interface InviteInfo {
  code: string;
  server: {
    name: string;
    description?: string;
    _count: {
      members: number;
    };
  };
  createdBy: string;
  expiresAt?: string;
  maxUses?: number;
  uses: number;
}

export interface Friend {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  displayId?: string;
}

export interface DirectChatUser {
  id: string;
  username: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly baseUrl = 'http://localhost:3001/communication';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Server management
  async getUserServers(): Promise<ChatServer[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    const url = `${this.baseUrl}/servers/${currentUser.id}`;
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

  async getDirectMessages(friendId: string, limit?: number, skip?: number): Promise<ChatMessage[]> {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (skip) params.append('skip', skip.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';

    return this.makeAuthenticatedRequest(
      // Authenticated call
      async () => {
        const url = `${this.baseUrl}/direct/${currentUserId}/${friendId}/messages${queryString}`;
        return firstValueFrom(this.http.get<ChatMessage[]>(url));
      },
      // Public fallback
      async () => {
        const url = `${this.baseUrl}/public/direct/${currentUserId}/${friendId}/messages${queryString}`;
        return firstValueFrom(this.http.get<ChatMessage[]>(url));
      }
    );
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
    // Use the correct channel-specific endpoint
    const url = `${this.baseUrl}/channels/${channelId}/messages`;
    console.log('🔗 Sending to URL:', url, 'with data:', sendData);
    return firstValueFrom(this.http.post<ChatMessage>(url, sendData));
  }

  async sendDirectMessage(receiverId: string, messageData: any): Promise<ChatMessage> {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    return this.makeAuthenticatedRequest(
      // Authenticated call
      async () => {
        const sendData = {
          content: messageData.content,
          senderId: currentUserId,
          messageType: messageData.messageType || 'TEXT'
        };
        const url = `${this.baseUrl}/direct/${receiverId}/messages`;
        return firstValueFrom(this.http.post<ChatMessage>(url, sendData));
      },
      // Public fallback
      async () => {
        const sendData = {
          content: messageData.content,
          senderId: currentUserId,
          messageType: messageData.messageType || 'TEXT'
        };
        const url = `${this.baseUrl}/public/direct/${receiverId}/messages`;
        return firstValueFrom(this.http.post<ChatMessage>(url, sendData));
      }
    );
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
  
  // Helper method to get current user ID
  private getCurrentUserId(): string | null {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.id) {
      return currentUser.id;
    }
    
    // Fallback for testing purposes when no user is logged in
    console.warn('⚠️ No authenticated user found, using test user ID for demo purposes');
    return 'cme2ud8l10000fa4sdnq79fs9'; // FitnessKing test user
  }

  // Helper method to handle authenticated vs public endpoints
  private async makeAuthenticatedRequest<T>(
    authenticatedCall: () => Promise<T>,
    publicFallback?: () => Promise<T>
  ): Promise<T> {
    try {
      // First try authenticated call
      return await authenticatedCall();
    } catch (error: any) {
      // If authentication fails and we have a fallback, use it
      if ((error?.status === 401 || error?.status === 403) && publicFallback) {
        console.warn('🔄 Authentication failed, falling back to public endpoint');
        return await publicFallback();
      }
      throw error;
    }
  }

  // Direct chat initialization
  async getOrCreateDirectChat(userId: string): Promise<DirectChatUser> {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) {
      throw new Error('Unable to determine current user');
    }

    return this.makeAuthenticatedRequest(
      // Authenticated call
      async () => {
        const url = `${this.baseUrl}/direct-chat/${userId}`;
        return firstValueFrom(this.http.post<DirectChatUser>(url, { currentUserId }));
      },
      // Public fallback
      async () => {
        const url = `${this.baseUrl}/public/direct-chat/${userId}`;
        return firstValueFrom(this.http.post<DirectChatUser>(url, { currentUserId }));
      }
    );
  }

  async getFriends(): Promise<Friend[]> {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) {
      throw new Error('Unable to determine current user');
    }

    return this.makeAuthenticatedRequest(
      // Authenticated call
      async () => {
        const url = `http://localhost:3001/social/list/${currentUserId}`;
        return firstValueFrom(this.http.get<Friend[]>(url));
      },
      // Public fallback
      async () => {
        const url = `http://localhost:3001/social/public/list/${currentUserId}`;
        return firstValueFrom(this.http.get<Friend[]>(url));
      }
    );
  }

  // ===== SERVER INVITE SYSTEM =====

  async createServerInvite(serverId: string, options: CreateInviteDto = {}): Promise<ServerInvite> {
    return this.makeAuthenticatedRequest(
      // Authenticated call
      async () => {
        const url = `${this.baseUrl}/servers/${serverId}/invites`;
        return firstValueFrom(this.http.post<ServerInvite>(url, options));
      },
      // Public fallback - not applicable for creating invites
      async () => {
        throw new Error('Authentication required to create server invites');
      }
    );
  }

  async getServerInvites(serverId: string): Promise<ServerInvite[]> {
    return this.makeAuthenticatedRequest(
      // Authenticated call
      async () => {
        const url = `${this.baseUrl}/servers/${serverId}/invites`;
        return firstValueFrom(this.http.get<ServerInvite[]>(url));
      },
      // Public fallback - not applicable
      async () => {
        throw new Error('Authentication required to view server invites');
      }
    );
  }

  async getInviteInfo(code: string): Promise<InviteInfo> {
    // This is always public, no auth needed
    const url = `${this.baseUrl}/public/invites/${code}`;
    return firstValueFrom(this.http.get<InviteInfo>(url));
  }

  async joinServerByInvite(code: string): Promise<{ success: boolean; server: any }> {
    const currentUserId = this.getCurrentUserId();
    
    return this.makeAuthenticatedRequest(
      // Authenticated call
      async () => {
        const url = `${this.baseUrl}/invites/${code}/join`;
        return firstValueFrom(this.http.post<{ success: boolean; server: any }>(url, {}));
      },
      // Public fallback
      async () => {
        if (!currentUserId) {
          throw new Error('User ID required');
        }
        const url = `${this.baseUrl}/public/invites/${code}/join`;
        return firstValueFrom(this.http.post<{ success: boolean; server: any }>(url, { userId: currentUserId }));
      }
    );
  }

  async deleteInvite(inviteId: string): Promise<{ success: boolean }> {
    return this.makeAuthenticatedRequest(
      // Authenticated call
      async () => {
        const url = `${this.baseUrl}/invites/${inviteId}`;
        return firstValueFrom(this.http.delete<{ success: boolean }>(url));
      },
      // Public fallback - not applicable
      async () => {
        throw new Error('Authentication required to delete invites');
      }
    );
  }

  async getUserInvites(): Promise<ServerInvite[]> {
    return this.makeAuthenticatedRequest(
      // Authenticated call
      async () => {
        const url = `${this.baseUrl}/user/invites`;
        return firstValueFrom(this.http.get<ServerInvite[]>(url));
      },
      // Public fallback - not applicable
      async () => {
        return []; // Return empty array for public users
      }
    );
  }
}
