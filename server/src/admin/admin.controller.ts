/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateUserRoleDto } from './dto/admin.dto';

// Management Controller for user administration
// TODO: Implement proper auth guards for admin access
// @UseGuards(AdminGuard)
@Controller('management')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getAllUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    const takeNum = take ? parseInt(take) : 50;
    const skipNum = skip ? parseInt(skip) : 0;
    
    return await this.adminService.findUsers({
      search,
      role,
      take: takeNum,
      skip: skipNum,
    });
  }

  @Get('users/search')
  async searchUsers(@Query('q') query: string) {
    if (!query || query.trim().length < 2) {
      throw new HttpException(
        'Search query must be at least 2 characters',
        HttpStatus.BAD_REQUEST,
      );
    }
    
    return await this.adminService.searchUsers(query);
  }

  @Get('users/:id')
  async getUserDetails(@Param('id') id: string) {
    return await this.adminService.getUserDetails(id);
  }

  @Put('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return await this.adminService.updateUserRole(id, updateUserRoleDto.role);
  }

  @Put('users/:id/status')
  async toggleUserStatus(@Param('id') id: string) {
    return await this.adminService.toggleUserStatus(id);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return await this.adminService.deleteUser(id);
  }

  @Get('stats')
  async getAdminStats() {
    return await this.adminService.getAdminStats();
  }
}
