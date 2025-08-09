import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface User {
  id: string;
  username: string;
  email: string;
  displayId?: string;
  role: string;
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  _count: {
    workouts: number;
    challenges: number;
    servers: number;
  };
}

interface UsersResponse {
  users: User[];
  total: number;
  hasMore: boolean;
}

interface AdminStats {
  totalUsers: number;
  recentRegistrations: number;
  totalWorkouts: number;
  totalChallenges: number;
}

interface UserSearchParams {
  search?: string;
  role?: string;
  take?: number;
  skip?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly baseUrl = 'http://localhost:3001/management';

  constructor(private http: HttpClient) {}

  async getUsers(params: UserSearchParams): Promise<UsersResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.take) queryParams.append('take', params.take.toString());
    if (params.skip) queryParams.append('skip', params.skip.toString());

    const url = `${this.baseUrl}/users?${queryParams.toString()}`;
    return firstValueFrom(this.http.get<UsersResponse>(url));
  }

  async searchUsers(query: string): Promise<User[]> {
    const url = `${this.baseUrl}/users/search?q=${encodeURIComponent(query)}`;
    return firstValueFrom(this.http.get<User[]>(url));
  }

  async getUserDetails(id: string): Promise<User> {
    const url = `${this.baseUrl}/users/${id}`;
    return firstValueFrom(this.http.get<User>(url));
  }

  async updateUserRole(id: string, role: string): Promise<any> {
    const url = `${this.baseUrl}/users/${id}/role`;
    return firstValueFrom(this.http.put(url, { role }));
  }

  async toggleUserStatus(id: string): Promise<any> {
    const url = `${this.baseUrl}/users/${id}/status`;
    return firstValueFrom(this.http.put(url, {}));
  }

  async deleteUser(id: string): Promise<any> {
    const url = `${this.baseUrl}/users/${id}`;
    return firstValueFrom(this.http.delete(url));
  }

  async getStats(): Promise<AdminStats> {
    const url = `${this.baseUrl}/stats`;
    return firstValueFrom(this.http.get<AdminStats>(url));
  }
}
