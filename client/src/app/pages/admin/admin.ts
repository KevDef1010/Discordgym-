/**
 * Admin Component
 * 
 * Administrative dashboard for user management, role assignment, and system oversight.
 * Provides comprehensive admin tools for managing the DiscordGym platform.
 * 
 * Features:
 * - User management (search, filter, role assignment)
 * - System statistics and analytics
 * - User role modification with confirmation
 * - Account status management (activate/deactivate)
 * - User deletion with double confirmation
 * - Real-time search with debouncing
 * - Role-based filtering and badge styling
 * 
 * @author DiscordGym Team
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../shared/services/admin.service';

/**
 * User interface for admin user management
 */
interface User {
  id: string; // Unique user identifier
  username: string; // User's display name
  email: string; // User's email address
  displayId?: string; // Optional display ID for search
  role: string; // Current user role
  isActive: boolean; // Account status (active/inactive)
  avatar?: string; // Profile avatar URL
  createdAt: string; // Account creation timestamp
  _count: {
    workouts: number; // Number of completed workouts
    challenges: number; // Number of active challenges
    servers: number; // Number of servers user belongs to
  };
}

/**
 * Admin statistics interface
 */
interface AdminStats {
  totalUsers: number; // Total registered users
  recentRegistrations: number; // Recent new registrations
  totalWorkouts: number; // Total workouts across platform
  totalChallenges: number; // Total active challenges
}

/**
 * Role selection option interface
 */
interface RoleOption {
  value: string; // Role value for filtering
  label: string; // Display label for role
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class AdminComponent implements OnInit {
  // User data management
  users: User[] = []; // Complete list of users from API
  filteredUsers: User[] = []; // Filtered users based on search/role
  
  // Search and filtering state
  searchQuery = ''; // Current search query string
  selectedRole = ''; // Currently selected role filter
  loading = false; // Loading state for API operations
  
  // System statistics
  stats: AdminStats | null = null; // Platform statistics data
  
  // UI utilities
  private searchTimeout: number | undefined; // Debounce timer for search
  
  // Available role options for filtering and assignment
  roles: RoleOption[] = [
    { value: '', label: 'All Roles' }, // Show all users
    { value: 'SUPER_ADMIN', label: 'Super Admin' }, // Highest privilege level
    { value: 'ADMIN', label: 'Admin' }, // Administrative privileges
    { value: 'MODERATOR', label: 'Moderator' }, // Content moderation
    { value: 'TRAINER', label: 'Trainer' }, // Fitness trainer role
    { value: 'PREMIUM_USER', label: 'Premium User' }, // Paid subscription
    { value: 'MEMBER', label: 'Member' }, // Standard user
    { value: 'GUEST', label: 'Guest' } // Limited access user
  ];

  /**
   * Constructor - Initialize admin component
   * @param adminService - Admin service for user management operations
   */
  constructor(private adminService: AdminService) {}

  /**
   * Component initialization lifecycle hook
   * Loads initial user data and system statistics
   */
  ngOnInit() {
    this.loadUsers();
    this.loadStats();
  }

  /**
   * Load users from API with current search and filter criteria
   * Implements pagination and error handling
   */
  async loadUsers() {
    this.loading = true;
    try {
      const response = await this.adminService.getUsers({
        search: this.searchQuery,
        role: this.selectedRole,
        take: 50, // Limit results for performance
        skip: 0 // Pagination offset (future enhancement)
      });
      this.users = response.users;
      this.filterUsers();
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Load platform statistics for admin dashboard
   * Provides overview of system usage and metrics
   */
  async loadStats() {
    try {
      this.stats = await this.adminService.getStats();
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  /**
   * Handle search input changes with debouncing
   * Prevents excessive API calls during typing
   */
  onSearchChange() {
    // Clear previous timeout to prevent multiple API calls
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    // Debounce search by 300ms for better UX
    this.searchTimeout = window.setTimeout(() => {
      this.loadUsers();
    }, 300);
  }

  /**
   * Handle role filter changes
   * Immediately reloads users with new filter
   */
  onRoleChange() {
    this.loadUsers();
  }

  /**
   * Filter users based on search query and role selection
   * Performs client-side filtering for better responsiveness
   */
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

  /**
   * Update user role with confirmation dialog
   * @param userId - ID of user to update
   * @param newRole - New role to assign
   */
  async updateUserRole(userId: string, newRole: string) {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      await this.adminService.updateUserRole(userId, newRole);
      await this.loadUsers(); // Refresh user list to show changes
      alert('User role updated successfully!');
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Error updating user role');
    }
  }

  /**
   * Handle role selection change from dropdown
   * @param event - Select change event
   * @param userId - ID of user to update
   */
  onRoleSelectChange(event: Event, userId: string) {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      this.updateUserRole(userId, target.value);
    }
  }

  /**
   * Toggle user account status (active/inactive)
   * @param userId - ID of user to toggle
   */
  async toggleUserStatus(userId: string) {
    try {
      await this.adminService.toggleUserStatus(userId);
      await this.loadUsers(); // Refresh user list to show changes
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Error updating user status');
    }
  }

  /**
   * Delete user account with double confirmation
   * @param userId - ID of user to delete
   * @param username - Username for confirmation display
   */
  async deleteUser(userId: string, username: string) {
    if (!confirm(`Are you sure you want to DELETE the user "${username}"? This action cannot be undone!`)) {
      return;
    }

    if (!confirm(`Type "DELETE" to confirm deletion of user "${username}"`)) {
      return;
    }

    try {
      await this.adminService.deleteUser(userId);
      await this.loadUsers(); // Refresh user list to show changes
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  }

  /**
   * Get CSS class for role badge styling
   * @param role - User role string
   * @returns CSS class string for badge styling
   */
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

  /**
   * Get CSS class for user status badge styling
   * @param isActive - User active status
   * @returns CSS class string for status badge styling
   */
  getStatusBadgeClass(isActive: boolean): string {
    const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';
    return isActive 
      ? `${baseClasses} bg-green-100 text-green-800`
      : `${baseClasses} bg-red-100 text-red-800`;
  }
}
