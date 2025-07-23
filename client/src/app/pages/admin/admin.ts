import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../shared/services/admin.service';

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

interface AdminStats {
  totalUsers: number;
  recentRegistrations: number;
  totalWorkouts: number;
  totalChallenges: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class AdminComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchQuery = '';
  selectedRole = '';
  loading = false;
  stats: AdminStats | null = null;
  private searchTimeout: number | undefined;
  
  roles = [
    { value: '', label: 'All Roles' },
    { value: 'SUPER_ADMIN', label: 'Super Admin' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'MODERATOR', label: 'Moderator' },
    { value: 'TRAINER', label: 'Trainer' },
    { value: 'PREMIUM_USER', label: 'Premium User' },
    { value: 'MEMBER', label: 'Member' },
    { value: 'GUEST', label: 'Guest' }
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadUsers();
    this.loadStats();
  }

  async loadUsers() {
    this.loading = true;
    try {
      const response = await this.adminService.getUsers({
        search: this.searchQuery,
        role: this.selectedRole,
        take: 50,
        skip: 0
      });
      this.users = response.users;
      this.filterUsers();
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      this.loading = false;
    }
  }

  async loadStats() {
    try {
      this.stats = await this.adminService.getStats();
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  onSearchChange() {
    // Debounce search
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = window.setTimeout(() => {
      this.loadUsers();
    }, 300);
  }

  onRoleChange() {
    this.loadUsers();
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchQuery || 
        user.username.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (user.displayId && user.displayId.toLowerCase().includes(this.searchQuery.toLowerCase()));
      
      const matchesRole = !this.selectedRole || user.role === this.selectedRole;
      
      return matchesSearch && matchesRole;
    });
  }

  async updateUserRole(userId: string, newRole: string) {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      await this.adminService.updateUserRole(userId, newRole);
      await this.loadUsers(); // Reload to show changes
      alert('User role updated successfully!');
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Error updating user role');
    }
  }

  onRoleSelectChange(event: Event, userId: string) {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      this.updateUserRole(userId, target.value);
    }
  }

  async toggleUserStatus(userId: string) {
    try {
      await this.adminService.toggleUserStatus(userId);
      await this.loadUsers(); // Reload to show changes
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Error updating user status');
    }
  }

  async deleteUser(userId: string, username: string) {
    if (!confirm(`Are you sure you want to DELETE the user "${username}"? This action cannot be undone!`)) {
      return;
    }

    if (!confirm(`Type "DELETE" to confirm deletion of user "${username}"`)) {
      return;
    }

    try {
      await this.adminService.deleteUser(userId);
      await this.loadUsers(); // Reload to show changes
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  }

  getRoleBadgeClass(role: string): string {
    const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';
    switch (role) {
      case 'SUPER_ADMIN': return `${baseClasses} bg-red-100 text-red-800`;
      case 'ADMIN': return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'MODERATOR': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'TRAINER': return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'PREMIUM_USER': return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'MEMBER': return `${baseClasses} bg-green-100 text-green-800`;
      case 'GUEST': return `${baseClasses} bg-gray-100 text-gray-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  getStatusBadgeClass(isActive: boolean): string {
    const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';
    return isActive 
      ? `${baseClasses} bg-green-100 text-green-800`
      : `${baseClasses} bg-red-100 text-red-800`;
  }
}
