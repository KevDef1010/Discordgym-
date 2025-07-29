import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../shared/services/auth.service';
import { SocketService, OnlineUser } from '../../shared/services/socket.service';
import { ChatService } from '../../shared/services/chat.service';

// Simplified interfaces for the component
interface ChatServer {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  isPrivate: boolean;
  channels: ChatChannel[];
  memberCount?: number;
  _count?: {
    members: number;
  };
}

interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
}

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderUsername: string;
  senderAvatar?: string;
  sender?: {
    id: string;
    username: string;
    avatar?: string;
  };
  channelId?: string;
  receiverId?: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  isEdited: boolean;
  createdAt: string;
  reactions: MessageReaction[];
}

interface MessageReaction {
  id: string;
  emoji: string;
  userId: string;
  user?: {
    username: string;
  };
}

interface DirectMessage {
  userId: string;
  username: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.scss'
})
export class ChatComponent implements OnInit, OnDestroy {
  // Component state
  activeTab: 'direct' | 'servers' = 'direct';
  currentUser: User | null = null;
  isLoading = false;
  
  // Chat data
  chatServers: ChatServer[] = [];
  directMessages: DirectMessage[] = [];
  messages: ChatMessage[] = [];
  onlineUsers: OnlineUser[] = [];
  typingUsers: string[] = [];
  
  // Selected items
  selectedServer: ChatServer | null = null;
  selectedChannel: ChatChannel | null = null;
  selectedDirectMessage: DirectMessage | null = null;
  
  // Message input
  newMessage = '';
  
  // Modal states
  showServerModal = false;
  showChannelModal = false;
  
  // New server/channel form data
  newServerName = '';
  newServerDescription = '';
  newServerPrivate = false;
  newChannelName = '';
  newChannelDescription = '';
  newChannelPrivate = false;
  
  // Subscriptions
  private subscriptions: Subscription[] = [];
  private typingTimeout: any;

  constructor(
    private authService: AuthService,
    private socketService: SocketService,
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      
      this.loadChatData();
      this.setupSocketListeners();
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Clear typing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    
    // Leave current room
    this.leaveCurrentRoom();
  }

  private async loadChatData(): Promise<void> {
    if (!this.currentUser) return;
    
    try {
      this.isLoading = true;
      
      // Load user's servers
      const servers = await this.chatService.getUserServers();
      this.chatServers = servers as ChatServer[];
      
      // Load direct messages
      await this.loadDirectMessages();
      
      // Get online users (simplified approach)
      this.socketService.onlineUsers$.subscribe(users => {
        this.onlineUsers = users;
      });
      
    } catch (error) {
      console.error('Error loading chat data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadDirectMessages(): Promise<void> {
    if (!this.currentUser) return;
    
    try {
      const friends = await this.chatService.getFriends(this.currentUser.id);
      this.directMessages = (friends as any[]).map((friend: any) => ({
        userId: friend.id,
        username: friend.username,
        avatar: friend.avatar,
        lastMessage: friend.lastMessage?.content,
        lastMessageTime: friend.lastMessage?.createdAt,
        unreadCount: 0
      }));
    } catch (error) {
      console.error('Error loading direct messages:', error);
    }
  }

  private setupSocketListeners(): void {
    // Simplified socket listening - will be enhanced when socket service is properly exposed
    console.log('Setting up socket listeners...');
    
    // Subscribe to online users
    const onlineUsersSub = this.socketService.onlineUsers$.subscribe(users => {
      this.onlineUsers = users;
    });
    
    this.subscriptions.push(onlineUsersSub);
  }

  // Tab switching
  switchTab(tab: 'direct' | 'servers'): void {
    this.activeTab = tab;
    this.selectedServer = null;
    this.selectedChannel = null;
    this.selectedDirectMessage = null;
    this.messages = [];
  }

  // Server selection
  async selectServer(server: ChatServer): Promise<void> {
    this.selectedServer = server;
    this.selectedChannel = null;
    this.selectedDirectMessage = null;
    this.messages = [];
    
    console.log('Selected server:', server.name);
  }

  // Channel selection
  async selectChannel(channel: ChatChannel): Promise<void> {
    this.selectedChannel = channel;
    this.selectedDirectMessage = null;
    
    // Load channel messages
    await this.loadChannelMessages(channel.id);
    
    console.log('Selected channel:', channel.name);
  }

  // Direct message selection
  async selectDirectMessage(dm: DirectMessage): Promise<void> {
    this.selectedDirectMessage = dm;
    this.selectedServer = null;
    this.selectedChannel = null;
    
    // Load DM history
    await this.loadDirectMessageHistory(dm.userId);
    
    console.log('Selected DM with:', dm.username);
  }

  // Load messages
  private async loadChannelMessages(channelId: string): Promise<void> {
    try {
      this.isLoading = true;
      const messages = await this.chatService.getChannelMessages(channelId);
      this.messages = (messages as any[]).map(msg => ({
        ...msg,
        sender: {
          id: msg.senderId,
          username: msg.senderUsername || 'Unknown User',
          avatar: msg.senderAvatar
        }
      }));
    } catch (error) {
      console.error('Error loading channel messages:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadDirectMessageHistory(friendId: string): Promise<void> {
    try {
      this.isLoading = true;
      const messages = await this.chatService.getDirectMessages(friendId);
      this.messages = (messages as any[]).map(msg => ({
        ...msg,
        sender: {
          id: msg.senderId,
          username: msg.senderUsername || 'Unknown User',
          avatar: msg.senderAvatar
        }
      }));
    } catch (error) {
      console.error('Error loading direct messages:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Send message
  async sendMessage(): Promise<void> {
    if (!this.newMessage.trim() || !this.currentUser) return;
    
    try {
      const messageData = {
        content: this.newMessage.trim(),
        channelId: this.selectedChannel?.id,
        receiverId: this.selectedDirectMessage?.userId
      };
      
      if (this.selectedChannel) {
        await this.chatService.sendChannelMessage(this.selectedChannel.id, messageData);
      } else if (this.selectedDirectMessage) {
        await this.chatService.sendDirectMessage(this.selectedDirectMessage.userId, messageData);
      }
      
      // Clear input
      this.newMessage = '';
      
      console.log('Message sent:', messageData);
      
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  // Typing indicator
  onTyping(): void {
    // Clear existing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    
    console.log('User typing...');
    
    // Set timeout to stop typing indicator
    this.typingTimeout = setTimeout(() => {
      console.log('User stopped typing...');
    }, 3000);
  }

  // Server creation
  async createServer(): Promise<void> {
    if (!this.newServerName.trim() || !this.currentUser) return;
    
    try {
      const serverData = {
        name: this.newServerName.trim(),
        description: this.newServerDescription.trim() || undefined,
        isPrivate: this.newServerPrivate,
        ownerId: this.currentUser.id
      };
      
      const newServer = await this.chatService.createServer(serverData);
      this.chatServers.push(newServer as ChatServer);
      
      // Reset form and close modal
      this.newServerName = '';
      this.newServerDescription = '';
      this.newServerPrivate = false;
      this.showServerModal = false;
      
    } catch (error) {
      console.error('Error creating server:', error);
    }
  }

  // Channel creation
  async createChannel(): Promise<void> {
    if (!this.newChannelName.trim() || !this.selectedServer) return;
    
    try {
      const channelData = {
        name: this.newChannelName.trim(),
        description: this.newChannelDescription.trim() || undefined,
        isPrivate: this.newChannelPrivate,
        serverId: this.selectedServer.id
      };
      
      const newChannel = await this.chatService.createChannel(channelData);
      this.selectedServer.channels.push(newChannel as ChatChannel);
      
      // Reset form and close modal
      this.newChannelName = '';
      this.newChannelDescription = '';
      this.newChannelPrivate = false;
      this.showChannelModal = false;
      
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  }

  // Modal controls
  openServerModal(): void {
    this.showServerModal = true;
  }

  openChannelModal(): void {
    if (!this.selectedServer) return;
    this.showChannelModal = true;
  }

  // Utility methods
  formatTime(timestamp: string | Date): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.some(user => user.id.toString() === userId);
  }

  getUserStatus(userId: string): 'online' | 'idle' | 'dnd' | 'offline' {
    const user = this.onlineUsers.find(u => u.id.toString() === userId);
    if (!user?.status) return 'offline';
    
    // Map status values to expected format
    switch (user.status) {
      case 'ONLINE':
      case 'online':
        return 'online';
      case 'AWAY':
      case 'away':
        return 'idle';
      case 'DO_NOT_DISTURB':
      case 'busy':
        return 'dnd';
      case 'OFFLINE':
      case 'offline':
      default:
        return 'offline';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }

  getTypingText(): string {
    if (this.typingUsers.length === 0) return '';
    if (this.typingUsers.length === 1) return `${this.typingUsers[0]} tippt...`;
    if (this.typingUsers.length === 2) return `${this.typingUsers[0]} und ${this.typingUsers[1]} tippen...`;
    return `${this.typingUsers.length} Personen tippen...`;
  }

  onKeyDown(event: KeyboardEvent): void {
    // Send message on Enter (but not on Shift+Enter)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private leaveCurrentRoom(): void {
    // Implementation for leaving current room when socket is properly exposed
    console.log('Leaving current room...');
  }
}
