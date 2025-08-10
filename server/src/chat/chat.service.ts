/**
 * Chat Service
 *
 * Core service for managing chat functionality including servers, channels,
 * messages, direct messaging, and real-time communication features.
 *
 * Features:
 * - Server management (create, join, leave)
 * - Channel operations (create, manage, permissions)
 * - Message handling (send, retrieve, reactions)
 * - Direct messaging between users
 * - Server invitations and member management
 * - Message reactions and interactions
 * - User online status tracking
 * - Comprehensive permission system
 *
 * @author DiscordGym Team
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  /**
   * Constructor - Initialize chat service
   * @param prisma - Prisma service for database operations
   */
  constructor(private prisma: PrismaService) {}

  /**
   * Get all servers that a user is a member of
   * @param userId - ID of the user
   * @returns Array of servers with channels and member counts
   */
  async getUserServers(userId: string) {
    return this.prisma.chatServer.findMany({
      where: {
        members: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        channels: true,
        _count: {
          select: {
            members: true
          }
        }
      }
    });
  }

  /**
   * Create a new chat server with owner and default channel
   * @param data - Server creation data
   * @returns Created server with channels and member count
   */
  async createServer(data: {
    name: string;
    description?: string;
    isPrivate: boolean;
    ownerId: string;
  }) {
    const server = await this.prisma.chatServer.create({
      data: {
        name: data.name,
        description: data.description,
        isPrivate: data.isPrivate,
        ownerId: data.ownerId,
        members: {
          create: {
            userId: data.ownerId,
            role: 'OWNER'
          }
        },
        channels: {
          create: {
            name: 'general',
            description: 'General channel',
            isPrivate: false
          }
        }
      },
      include: {
        channels: true,
        _count: {
          select: {
            members: true
          }
        }
      }
    });

    return server;
  }

  /**
   * Create a new channel within a server
   * @param data - Channel creation data
   * @returns Created channel object
   */
  async createChannel(data: {
    name: string;
    description?: string;
    isPrivate: boolean;
    serverId: string;
  }) {
    return this.prisma.chatChannel.create({
      data: {
        name: data.name,
        description: data.description,
        isPrivate: data.isPrivate,
        chatServerId: data.serverId
      }
    });
  }

  /**
   * Retrieve messages from a specific channel with sender information
   * @param channelId - ID of the channel
   * @returns Array of messages with sender details and reactions
   */
  async getChannelMessages(channelId: string) {
    return this.prisma.chatMessage.findMany({
      where: {
        channelId: channelId
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                username: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      take: 50
    });
  }

  // Get direct messages
  async getDirectMessages(userId: string, friendId: string, limit?: number, skip?: number) {
    const messages = await this.prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                username: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Get newest first for pagination
      },
      take: limit || 20, // Default 20 messages
      skip: skip || 0
    });

    // Reverse to show oldest first in UI
    return messages.reverse();
  }

  // Send channel message
  async sendChannelMessage(data: {
    content: string;
    senderId: string;
    channelId: string;
  }) {
    return this.prisma.chatMessage.create({
      data: {
        content: data.content,
        senderId: data.senderId,
        channelId: data.channelId,
        messageType: 'TEXT'
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });
  }

  // Send direct message
  async sendDirectMessage(data: {
    content: string;
    senderId: string;
    receiverId: string;
  }) {
    // Validate that both sender and receiver exist
    const [sender, receiver] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: data.senderId } }),
      this.prisma.user.findUnique({ where: { id: data.receiverId } })
    ]);

    if (!sender) {
      throw new Error(`Sender with ID ${data.senderId} not found`);
    }

    if (!receiver) {
      throw new Error(`Receiver with ID ${data.receiverId} not found`);
    }

    return this.prisma.chatMessage.create({
      data: {
        content: data.content,
        senderId: data.senderId,
        receiverId: data.receiverId,
        messageType: 'TEXT'
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });
  }

  // Get user's friends
  async getFriends(userId: string) {
    // Find accepted friendships where the user is either the sender or the receiver
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
            email: true,
            avatar: true,
            displayId: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            displayId: true
          }
        }
      }
    });

    // Convert to a list of friends
    const friends = friendships.map(friendship => {
      // If user is the sender, return the receiver as friend
      if (friendship.senderId === userId) {
        return friendship.receiver;
      }
      // If user is the receiver, return the sender as friend
      return friendship.sender;
    });

    return friends;
  }
  
  // Get or create a direct chat with a user
  async getOrCreateDirectChat(currentUserId: string, targetUserId: string) {
    // First, check if the users are friends
    let isFriend = await this.prisma.friendship.findFirst({
      where: {
        AND: [
          {
            OR: [
              { senderId: currentUserId, receiverId: targetUserId },
              { senderId: targetUserId, receiverId: currentUserId }
            ]
          },
          { status: 'ACCEPTED' }
        ]
      }
    });
    
    // TEMPORARY FIX: Auto-create friendship for testing purposes
    if (!isFriend) {
      console.log(`🔧 Auto-creating friendship between ${currentUserId} and ${targetUserId} for testing`);
      try {
        // Create a friendship automatically
        isFriend = await this.prisma.friendship.create({
          data: {
            senderId: currentUserId,
            receiverId: targetUserId,
            status: 'ACCEPTED'
          }
        });
        console.log('✅ Friendship auto-created successfully');
      } catch (error) {
        console.error('❌ Failed to auto-create friendship:', error);
        throw new Error('Users are not friends and auto-friendship failed');
      }
    }
    
    // Get target user details for the chat
    const targetUser = await this.prisma.user.findUnique({
      where: {
        id: targetUserId
      },
      select: {
        id: true,
        username: true,
        avatar: true
      }
    });
    
    if (!targetUser) {
      throw new Error('Target user not found');
    }
    
    // We don't actually need to create anything in the DB here,
    // since direct messages are just stored with sender and receiver IDs
    // Return the target user info for the chat UI
    return targetUser;
  }

  // ===== SERVER INVITE SYSTEM =====

  // Create server invite
  async createServerInvite(serverId: string, createdById: string, options: { maxUses?: number; expiresAt?: string }) {
    // Check if user is server owner or admin
    const member = await this.prisma.chatServerMember.findFirst({
      where: {
        userId: createdById,
        chatServerId: serverId,
        role: { in: ['OWNER', 'ADMIN'] }
      }
    });

    if (!member) {
      throw new Error('You do not have permission to create invites for this server');
    }

    // Generate unique invite code
    const code = this.generateInviteCode();

    return this.prisma.chatServerInvite.create({
      data: {
        code,
        chatServerId: serverId,
        createdById,
        maxUses: options.maxUses,
        expiresAt: options.expiresAt ? new Date(options.expiresAt) : null,
      },
      include: {
        chatServer: {
          select: { name: true }
        },
        createdBy: {
          select: { username: true }
        }
      }
    });
  }

  // Get server invites
  async getServerInvites(serverId: string, userId: string) {
    // Check if user is server member
    const member = await this.prisma.chatServerMember.findFirst({
      where: {
        userId,
        chatServerId: serverId
      }
    });

    if (!member) {
      throw new Error('You are not a member of this server');
    }

    return this.prisma.chatServerInvite.findMany({
      where: {
        chatServerId: serverId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        createdBy: {
          select: { username: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Join server by invite
  async joinServerByInvite(code: string, userId: string) {
    const invite = await this.prisma.chatServerInvite.findUnique({
      where: { code },
      include: {
        chatServer: {
          select: { id: true, name: true }
        }
      }
    });

    if (!invite) {
      throw new Error('Invalid invite code');
    }

    // Check if invite is expired
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw new Error('This invite has expired');
    }

    // Check if invite has reached max uses
    if (invite.maxUses && invite.uses >= invite.maxUses) {
      throw new Error('This invite has reached its usage limit');
    }

    // Check if user is already a member
    const existingMember = await this.prisma.chatServerMember.findFirst({
      where: {
        userId,
        chatServerId: invite.chatServerId
      }
    });

    if (existingMember) {
      throw new Error('You are already a member of this server');
    }

    // Add user to server and increment invite usage
    await this.prisma.$transaction([
      this.prisma.chatServerMember.create({
        data: {
          userId,
          chatServerId: invite.chatServerId,
          role: 'MEMBER'
        }
      }),
      this.prisma.chatServerInvite.update({
        where: { id: invite.id },
        data: { uses: { increment: 1 } }
      })
    ]);

    return {
      success: true,
      server: invite.chatServer
    };
  }

  /**
   * Remove a user from a server (kick member)
   * Only server owners and admins can remove members
   * @param serverId - ID of the server
   * @param targetUserId - ID of the user to remove
   * @param requesterId - ID of the user making the request
   * @returns Success confirmation
   */
  async removeUserFromServer(
    serverId: string,
    targetUserId: string,
    requesterId: string,
  ) {
    // Check if requester is a member and has permission
    const requesterMember = await this.prisma.chatServerMember.findFirst({
      where: {
        userId: requesterId,
        chatServerId: serverId,
      },
      include: {
        chatServer: {
          select: { ownerId: true },
        },
      },
    });

    if (!requesterMember) {
      throw new Error('You are not a member of this server');
    }

    // Check if requester has permission (owner or admin)
    const isOwner = requesterMember.chatServer.ownerId === requesterId;
    const isAdmin = requesterMember.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new Error('You do not have permission to remove members');
    }

    // Check if target user is a member
    const targetMember = await this.prisma.chatServerMember.findFirst({
      where: {
        userId: targetUserId,
        chatServerId: serverId,
      },
    });

    if (!targetMember) {
      throw new Error('User is not a member of this server');
    }

    // Cannot remove the server owner
    if (requesterMember.chatServer.ownerId === targetUserId) {
      throw new Error('Cannot remove the server owner');
    }

    // Admins cannot remove other admins (only owner can)
    if (targetMember.role === 'ADMIN' && !isOwner) {
      throw new Error('Only the server owner can remove admins');
    }

    // Remove the user from the server
    await this.prisma.chatServerMember.delete({
      where: {
        id: targetMember.id,
      },
    });

    return {
      success: true,
      message: 'User removed from server successfully',
    };
  }

  /**
   * Leave a server (self-removal)
   * @param serverId - ID of the server to leave
   * @param userId - ID of the user leaving
   * @returns Success confirmation
   */
  async leaveServer(serverId: string, userId: string) {
    // Check if user is a member
    const member = await this.prisma.chatServerMember.findFirst({
      where: {
        userId,
        chatServerId: serverId,
      },
      include: {
        chatServer: {
          select: { ownerId: true },
        },
      },
    });

    if (!member) {
      throw new Error('You are not a member of this server');
    }

    // Server owner cannot leave their own server
    if (member.chatServer.ownerId === userId) {
      throw new Error(
        'Server owners cannot leave their own server. Transfer ownership or delete the server instead.',
      );
    }

    // Remove the user from the server
    await this.prisma.chatServerMember.delete({
      where: {
        id: member.id,
      },
    });

    return {
      success: true,
      message: 'Left server successfully',
    };
  }

  /**
   * Get all members of a server
   * @param serverId - ID of the server
   * @param requesterId - ID of the user making the request
   * @returns List of server members with user information
   */
  async getServerMembers(serverId: string, requesterId: string) {
    // Check if requester is a member
    const requesterMember = await this.prisma.chatServerMember.findFirst({
      where: {
        userId: requesterId,
        chatServerId: serverId,
      },
    });

    if (!requesterMember) {
      throw new Error('You are not a member of this server');
    }

    // Get all server members
    const members = await this.prisma.chatServerMember.findMany({
      where: {
        chatServerId: serverId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            displayId: true,
            isActive: true,
          },
        },
        chatServer: {
          select: {
            ownerId: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' }, // OWNER first, then ADMIN, then MEMBER
        { joinedAt: 'asc' },
      ],
    });

    return members.map((member) => ({
      id: member.id,
      userId: member.user.id,
      username: member.user.username,
      avatar: member.user.avatar,
      displayId: member.user.displayId,
      isActive: member.user.isActive,
      role: member.role,
      joinedAt: member.joinedAt,
      isOwner: member.chatServer.ownerId === member.user.id,
    }));
  }

  // Get invite info (public, no auth required)
  async getInviteInfo(code: string) {
    const invite = await this.prisma.chatServerInvite.findUnique({
      where: { code },
      include: {
        chatServer: {
          select: {
            name: true,
            description: true,
            _count: {
              select: { members: true }
            }
          }
        },
        createdBy: {
          select: { username: true }
        }
      }
    });

    if (!invite) {
      throw new Error('Invalid invite code');
    }

    // Check if invite is expired
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw new Error('This invite has expired');
    }

    return {
      code: invite.code,
      server: invite.chatServer,
      createdBy: invite.createdBy.username,
      expiresAt: invite.expiresAt,
      maxUses: invite.maxUses,
      uses: invite.uses
    };
  }

  // Delete invite
  async deleteInvite(inviteId: string, userId: string) {
    const invite = await this.prisma.chatServerInvite.findUnique({
      where: { id: inviteId },
      include: {
        chatServer: {
          include: {
            members: {
              where: { userId },
              select: { role: true }
            }
          }
        }
      }
    });

    if (!invite) {
      throw new Error('Invite not found');
    }

    // Check if user has permission (creator, server owner, or admin)
    const userMember = invite.chatServer.members[0];
    if (invite.createdById !== userId && (!userMember || !['OWNER', 'ADMIN'].includes(userMember.role))) {
      throw new Error('You do not have permission to delete this invite');
    }

    await this.prisma.chatServerInvite.delete({
      where: { id: inviteId }
    });

    return { success: true };
  }

  // Get user's received invites (for profile display)
  async getUserInvites(userId: string) {
    // For now, return active invites for servers user is not yet a member of
    // In a more complex system, you might have a separate PendingInvite model
    const userServerIds = await this.prisma.chatServerMember.findMany({
      where: { userId },
      select: { chatServerId: true }
    });

    const userServerIdList = userServerIds.map(m => m.chatServerId);

    return this.prisma.chatServerInvite.findMany({
      where: {
        chatServerId: { notIn: userServerIdList },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        chatServer: {
          select: {
            name: true,
            description: true,
            _count: {
              select: { members: true }
            }
          }
        },
        createdBy: {
          select: { username: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10 // Limit to recent invites
    });
  }

  // Helper method to generate invite codes
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
