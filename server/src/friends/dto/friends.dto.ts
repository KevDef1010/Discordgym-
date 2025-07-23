/* eslint-disable prettier/prettier */
import { IsString, IsEnum, IsOptional } from 'class-validator';

export class SendFriendRequestDto {
  @IsString()
  receiverId: string;
}

export class UpdateFriendRequestDto {
  @IsEnum(['ACCEPTED', 'DECLINED', 'BLOCKED'])
  status: 'ACCEPTED' | 'DECLINED' | 'BLOCKED';
}

export class SearchUsersDto {
  @IsString()
  @IsOptional()
  query?: string;
  
  @IsOptional()
  excludeFriends?: boolean;
}

export interface FriendshipResponse {
  id: string;
  status: string;
  createdAt: Date;
  friend: {
    id: string;
    username: string;
    displayId: string | null;
    avatar?: string | null;
    isActive: boolean;
  };
}

export interface UserSearchResponse {
  id: string;
  username: string;
  displayId: string | null;
  avatar?: string | null;
  isActive: boolean;
  friendshipStatus?: string;
}
