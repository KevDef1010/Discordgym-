/* eslint-disable prettier/prettier */
 
 
 
/* eslint-disable prettier/prettier */
import { Injectable, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FriendshipResponse, UserSearchResponse } from './dto/friends.dto';
import { FriendsGateway } from './friends.gateway';

@Injectable()
export class FriendsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => FriendsGateway))
    private friendsGateway: FriendsGateway
  ) {}

  // Freundschaftsanfrage senden
  async sendFriendRequest(senderId: string, receiverId: string) {
    // Prüfen ob User existieren
    const [sender, receiver] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: senderId } }),
      this.prisma.user.findUnique({ where: { id: receiverId } })
    ]);

    if (!sender || !receiver) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (senderId === receiverId) {
      throw new HttpException('Cannot send friend request to yourself', HttpStatus.BAD_REQUEST);
    }

    // Prüfen ob bereits eine Freundschaft existiert
    const existingFriendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      }
    });

    if (existingFriendship) {
      throw new HttpException('Friendship already exists', HttpStatus.CONFLICT);
    }

    // Freundschaftsanfrage erstellen
    const friendship = await this.prisma.friendship.create({
      data: {
        senderId,
        receiverId,
        status: 'PENDING'
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayId: true,
            avatar: true,
            isActive: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            displayId: true,
            avatar: true,
            isActive: true
          }
        }
      }
    });

    // Real-time notification senden
    this.friendsGateway.sendFriendRequest(receiverId, {
      id: friendship.id,
      sender: friendship.sender,
      createdAt: friendship.createdAt
    });

    return {
      message: 'Friend request sent successfully',
      friendship
    };
  }

  // Freundschaftsanfrage beantworten
  async respondToFriendRequest(userId: string, friendshipId: string, status: 'ACCEPTED' | 'DECLINED' | 'BLOCKED') {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        id: friendshipId,
        receiverId: userId,
        status: 'PENDING'
      }
    });

    if (!friendship) {
      throw new HttpException('Friend request not found', HttpStatus.NOT_FOUND);
    }

    const updatedFriendship = await this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayId: true,
            avatar: true,
            isActive: true
          }
        }
      }
    });

    // Real-time notification an Sender senden
    this.friendsGateway.sendFriendRequestResponse(friendship.senderId, {
      status,
      friendship: updatedFriendship,
      message: `Friend request ${status.toLowerCase()}`
    });

    return {
      message: `Friend request ${status.toLowerCase()}`,
      friendship: updatedFriendship
    };
  }

  // Alle Freunde eines Users abrufen
  async getFriends(userId: string): Promise<FriendshipResponse[]> {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId, status: 'ACCEPTED' },
          { receiverId: userId, status: 'ACCEPTED' }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayId: true,
            avatar: true,
            isActive: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            displayId: true,
            avatar: true,
            isActive: true
          }
        }
      }
    });

    return friendships.map(friendship => ({
      id: friendship.id,
      status: friendship.status,
      createdAt: friendship.createdAt,
      friend: friendship.senderId === userId ? friendship.receiver : friendship.sender
    }));
  }

  // Eingehende Freundschaftsanfragen
  async getPendingRequests(userId: string) {
    return await this.prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING'
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayId: true,
            avatar: true,
            isActive: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Ausgehende Freundschaftsanfragen
  async getSentRequests(userId: string) {
    return await this.prisma.friendship.findMany({
      where: {
        senderId: userId,
        status: 'PENDING'
      },
      include: {
        receiver: {
          select: {
            id: true,
            username: true,
            displayId: true,
            avatar: true,
            isActive: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // User für Freundschaftsanfragen suchen
  async searchUsers(currentUserId: string, query: string, excludeFriends = false): Promise<UserSearchResponse[]> {
    // User suchen (ohne Filter für bestehende Freundschaften)
    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } }, // Nicht sich selbst
          { isActive: true },
          {
            OR: [
              { username: { contains: query } },
              { displayId: { contains: query } },
              { email: { contains: query } }
            ]
          }
        ]
      },
      select: {
        id: true,
        username: true,
        displayId: true,
        avatar: true,
        isActive: true
      },
      take: 20 // Limit für Performance
    });

    // Freundschaftsstatus für jeden User abrufen
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        const friendship = await this.prisma.friendship.findFirst({
          where: {
            OR: [
              { senderId: currentUserId, receiverId: user.id },
              { senderId: user.id, receiverId: currentUserId }
            ]
          },
          select: { status: true, senderId: true, receiverId: true }
        });

        let friendshipStatus = 'NONE';
        if (friendship) {
          switch (friendship.status) {
            case 'ACCEPTED':
              friendshipStatus = 'FRIENDS';
              break;
            case 'PENDING':
              // Prüfen wer die Anfrage gesendet hat
              friendshipStatus = friendship.senderId === currentUserId ? 'SENT' : 'RECEIVED';
              break;
            case 'DECLINED':
              friendshipStatus = 'DECLINED';
              break;
            case 'BLOCKED':
              friendshipStatus = 'BLOCKED';
              break;
          }
        }

        return {
          ...user,
          friendshipStatus
        };
      })
    );

    // Optionales Filtern nach excludeFriends
    if (excludeFriends) {
      return usersWithStatus.filter(user => 
        user.friendshipStatus === 'NONE' || 
        user.friendshipStatus === 'DECLINED'
      );
    }

    return usersWithStatus;
  }

  // Freundschaft entfernen
  async removeFriend(userId: string, friendId: string) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId }
        ]
      }
    });

    if (!friendship) {
      throw new HttpException('Friendship not found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.friendship.delete({
      where: { id: friendship.id }
    });

    return { message: 'Friend removed successfully' };
  }

  // Freundschaftsstatistiken
  async getFriendStats(userId: string) {
    const [friendsCount, pendingRequestsCount, sentRequestsCount] = await Promise.all([
      this.prisma.friendship.count({
        where: {
          OR: [
            { senderId: userId, status: 'ACCEPTED' },
            { receiverId: userId, status: 'ACCEPTED' }
          ]
        }
      }),
      this.prisma.friendship.count({
        where: {
          receiverId: userId,
          status: 'PENDING'
        }
      }),
      this.prisma.friendship.count({
        where: {
          senderId: userId,
          status: 'PENDING'
        }
      })
    ]);

    return {
      friendsCount,
      pendingRequestsCount,
      sentRequestsCount
    };
  }
}
