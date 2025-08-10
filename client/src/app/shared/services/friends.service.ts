/**
 * Friends Service
 * 
 * Handles all friend-related HTTP operations and data management.
 * Provides comprehensive friend management functionality including
 * friend requests, user search, and friendship statistics.
 * 
 * Features:
 * - Friend relationship management
 * - User search with pagination
 * - Friend request system (send/accept/decline)
 * - Friendship statistics tracking
 * - Real-time friend status updates
 * 
 * @author DiscordGym Team
 */
/* eslint-disable prettier/prettier */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interface representing a friendship relationship
 */
export interface Friend {
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

/**
 * Interface for user search results
 */
export interface UserSearchResult {
  id: string;
  username: string;
  displayId: string | null;
  avatar?: string | null;
  isActive: boolean;
  friendshipStatus?: string; // Current friendship status with the searching user
}

/**
 * Interface representing a friend request
 */
export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  createdAt: Date;
  sender?: {
    id: string;
    username: string;
    displayId: string | null;
    avatar?: string | null;
    isActive: boolean;
  };
  receiver?: {
    id: string;
    username: string;
    displayId: string | null;
    avatar?: string | null;
    isActive: boolean;
  };
}

/**
 * Interface for friendship statistics
 */
export interface FriendStats {
  friendsCount: number;
  pendingRequestsCount: number;
  sentRequestsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  private readonly apiUrl = 'http://localhost:3001/social';

  constructor(private http: HttpClient) {}

  // Freunde abrufen
  getFriends(userId: string): Observable<Friend[]> {
    return this.http.get<Friend[]>(`${this.apiUrl}/list/${userId}`);
  }

  // User suchen
  searchUsers(userId: string, query: string, excludeFriends: boolean = true): Observable<UserSearchResult[]> {
    const params = new HttpParams()
      .set('q', query)
      .set('excludeFriends', excludeFriends.toString());
    
    return this.http.get<UserSearchResult[]>(`${this.apiUrl}/search/${userId}`, { params });
  }

  // Freundschaftsanfrage senden
  sendFriendRequest(senderId: string, receiverId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/friend-request`, {
      senderId,
      receiverId
    });
  }

  // Freundschaftsanfrage beantworten
  respondToFriendRequest(userId: string, friendshipId: string, status: 'ACCEPTED' | 'DECLINED' | 'BLOCKED'): Observable<any> {
    return this.http.put(`${this.apiUrl}/request/${friendshipId}`, {
      userId,
      status
    });
  }

  // Eingehende Anfragen
  getPendingRequests(userId: string): Observable<FriendRequest[]> {
    return this.http.get<FriendRequest[]>(`${this.apiUrl}/requests/pending/${userId}`);
  }

  // Ausgehende Anfragen
  getSentRequests(userId: string): Observable<FriendRequest[]> {
    return this.http.get<FriendRequest[]>(`${this.apiUrl}/requests/sent/${userId}`);
  }

  // Freund entfernen
  removeFriend(userId: string, friendId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}/remove/${friendId}`);
  }

  // Statistiken abrufen
  getFriendStats(userId: string): Observable<FriendStats> {
    return this.http.get<FriendStats>(`${this.apiUrl}/stats/${userId}`);
  }
}
