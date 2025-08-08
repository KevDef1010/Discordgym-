// ===== SHARED INTERFACES =====
// Zentrale Interface-Definitionen für alle Socket-Services

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

export interface SocketMessage {
  id: number;
  content: string;
  userId: number | string;
  senderId: number | string;
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

export interface ChatMessage extends SocketMessage {
  channelId: number | string;
  serverId: number | string;
}

export interface DirectMessage extends SocketMessage {
  receiverId: number | string;
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

export interface SocketNotification {
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

export interface ConnectionState {
  connected: boolean;
  reconnecting: boolean;
  error?: string;
  lastConnected?: Date;
}
