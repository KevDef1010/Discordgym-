/* eslint-disable prettier/prettier */
 
/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { SendFriendRequestDto, UpdateFriendRequestDto } from './dto/friends.dto';

// Social Controller for friendship management
// TODO: Implement proper auth guards and get user from JWT
@Controller('social')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  // Freundschaftsanfrage senden
  @Post('friend-request')
  async sendFriendRequest(
    @Body() sendFriendRequestDto: SendFriendRequestDto,
    // TODO: Get from JWT token instead of body
    @Body('senderId') senderId: string,
  ) {
    if (!senderId) {
      throw new HttpException('Sender ID required', HttpStatus.BAD_REQUEST);
    }
    
    return await this.friendsService.sendFriendRequest(
      senderId,
      sendFriendRequestDto.receiverId,
    );
  }

  // Freundschaftsanfrage beantworten
  @Put('request/:friendshipId')
  async respondToFriendRequest(
    @Param('friendshipId') friendshipId: string,
    @Body() updateFriendRequestDto: UpdateFriendRequestDto,
    // TODO: Get from JWT token instead of body
    @Body('userId') userId: string,
  ) {
    if (!userId) {
      throw new HttpException('User ID required', HttpStatus.BAD_REQUEST);
    }

    return await this.friendsService.respondToFriendRequest(
      userId,
      friendshipId,
      updateFriendRequestDto.status,
    );
  }

  // Alle Freunde eines Users
  @Get('list/:userId')
  async getFriends(@Param('userId') userId: string) {
    return await this.friendsService.getFriends(userId);
  }

  // Eingehende Freundschaftsanfragen
  @Get('requests/pending/:userId')
  async getPendingRequests(@Param('userId') userId: string) {
    return await this.friendsService.getPendingRequests(userId);
  }

  // Ausgehende Freundschaftsanfragen
  @Get('requests/sent/:userId')
  async getSentRequests(@Param('userId') userId: string) {
    return await this.friendsService.getSentRequests(userId);
  }

  // User für Freundschaftsanfragen suchen
  @Get('search/:userId')
  async searchUsers(
    @Param('userId') userId: string,
    @Query('q') query: string,
    @Query('excludeFriends') excludeFriends?: string,
  ) {
    if (!query || query.trim().length < 1) {
      throw new HttpException(
        'Search query required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const excludeFriendsBoolean = excludeFriends === 'true';
    
    return await this.friendsService.searchUsers(
      userId,
      query.trim(),
      excludeFriendsBoolean,
    );
  }

  // Freundschaft entfernen
  @Delete(':userId/remove/:friendId')
  async removeFriend(
    @Param('userId') userId: string,
    @Param('friendId') friendId: string,
  ) {
    return await this.friendsService.removeFriend(userId, friendId);
  }

  // Freundschaftsstatistiken
  @Get('stats/:userId')
  async getFriendStats(@Param('userId') userId: string) {
    return await this.friendsService.getFriendStats(userId);
  }
}
