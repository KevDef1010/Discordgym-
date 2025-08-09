import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';

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
  channelId?: string;
  receiverId?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('communication')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Get user's servers
  @Get('servers/:userId')
  async getUserServers(@Param('userId') userId: string) {
    return this.chatService.getUserServers(userId);
  }

  // Create new server
  @Post('servers')
  async createServer(@Body() createServerDto: CreateServerDto) {
    return this.chatService.createServer(createServerDto);
  }

  // Create new channel
  @Post('channels')
  async createChannel(@Body() createChannelDto: CreateChannelDto) {
    return this.chatService.createChannel(createChannelDto);
  }

  // Get channel messages
  @Get('channels/:channelId/messages')
  async getChannelMessages(@Param('channelId') channelId: string) {
    return this.chatService.getChannelMessages(channelId);
  }

  // Send channel message
  @Post('channels/:channelId/messages')
  async sendChannelMessage(
    @Param('channelId') channelId: string,
    @Body() sendMessageDto: SendMessageDto,
    @Request() req,
  ) {
    return this.chatService.sendChannelMessage({
      content: sendMessageDto.content,
      senderId: req.user.id, // ← User aus JWT Token
      channelId: channelId,
    });
  }

  // Get direct messages
  @Get('direct/:userId/:friendId/messages')
  async getDirectMessages(
    @Param('userId') userId: string,
    @Param('friendId') friendId: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const skipNum = skip ? parseInt(skip, 10) : undefined;
    return this.chatService.getDirectMessages(userId, friendId, limitNum, skipNum);
  }

  // Send direct message
  @Post('direct/:friendId/messages')
  async sendDirectMessage(
    @Param('friendId') friendId: string,
    @Body() sendMessageDto: SendMessageDto,
    @Request() req,
  ) {
    return this.chatService.sendDirectMessage({
      content: sendMessageDto.content,
      senderId: req.user.id, // ← User aus JWT Token
      receiverId: friendId,
    });
  }

  // Get user's friends
  @Get('friends/:userId')
  async getFriends(@Param('userId') userId: string) {
    return this.chatService.getFriends(userId);
  }

  // Get or create direct chat
  @Post('direct-chat/:userId')
  async getOrCreateDirectChat(
    @Param('userId') targetUserId: string,
    @Request() req,
  ) {
    return this.chatService.getOrCreateDirectChat(req.user.id, targetUserId);
  }

  // Server Invite System
  @Post('servers/:serverId/invites')
  async createInvite(
    @Param('serverId') serverId: string,
    @Body() createInviteDto: { maxUses?: number; expiresAt?: string },
    @Request() req,
  ) {
    return this.chatService.createServerInvite(serverId, req.user.id, createInviteDto);
  }

  @Get('servers/:serverId/invites')
  async getServerInvites(
    @Param('serverId') serverId: string,
    @Request() req,
  ) {
    return this.chatService.getServerInvites(serverId, req.user.id);
  }

  @Post('invites/:code/join')
  async joinServerByInvite(
    @Param('code') code: string,
    @Request() req,
  ) {
    return this.chatService.joinServerByInvite(code, req.user.id);
  }

  @Get('invites/:code')
  async getInviteInfo(@Param('code') code: string) {
    return this.chatService.getInviteInfo(code);
  }

  @Delete('invites/:inviteId')
  async deleteInvite(
    @Param('inviteId') inviteId: string,
    @Request() req,
  ) {
    return this.chatService.deleteInvite(inviteId, req.user.id);
  }

  // Get user's pending invites
  @Get('user/invites')
  async getUserInvites(@Request() req) {
    return this.chatService.getUserInvites(req.user.id);
  }
}

// Temporary controller for testing without auth
@Controller('chat/public')
export class PublicChatController {
  constructor(private readonly chatService: ChatService) {}
  
  // Get friends for a user (public endpoint for testing)
  @Get('friends/:userId')
  async getFriends(@Param('userId') userId: string) {
    return this.chatService.getFriends(userId);
  }
  
  // Get or create a direct chat with a user (public endpoint for testing)
  @Post('direct-chat/:userId')
  async getOrCreateDirectChat(
    @Param('userId') targetUserId: string,
    @Body() body?: { currentUserId?: string },
  ) {
    // Use hardcoded test user ID if no currentUserId provided
    const currentUserId = body?.currentUserId || 'cme2ud8l10000fa4sdnq79fs9'; // Test user ID
    return this.chatService.getOrCreateDirectChat(currentUserId, targetUserId);
  }

  // Get direct message history (public endpoint for testing)
  @Get('direct/:userId/:friendId/messages')
  async getDirectMessages(
    @Param('userId') userId: string,
    @Param('friendId') friendId: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const skipNum = skip ? parseInt(skip, 10) : undefined;
    return this.chatService.getDirectMessages(userId, friendId, limitNum, skipNum);
  }

  // Send direct message (public endpoint for testing)
  @Post('direct/:friendId/messages')
  async sendDirectMessage(
    @Param('friendId') friendId: string,
    @Body() sendMessageDto: SendMessageDto & { senderId: string },
  ) {
    return this.chatService.sendDirectMessage({
      content: sendMessageDto.content,
      senderId: sendMessageDto.senderId,
      receiverId: friendId,
    });
  }

  // Public invite endpoints for testing
  @Get('invites/:code')
  async getInviteInfo(@Param('code') code: string) {
    return this.chatService.getInviteInfo(code);
  }

  @Post('invites/:code/join')
  async joinServerByInvite(
    @Param('code') code: string,
    @Body() body: { userId: string },
  ) {
    return this.chatService.joinServerByInvite(code, body.userId);
  }
}
