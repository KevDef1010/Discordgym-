import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Get('list')
  async getAllUsers(
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    const takeNum = take ? parseInt(take) : undefined;
    const skipNum = skip ? parseInt(skip) : undefined;
    return await this.userService.findAll(takeNum, skipNum);
  }

  @Get('profile/:id')
  async getUserById(@Param('id') id: string) {
    return await this.userService.findOne(id);
  }

  @Get('discord/:discordId')
  async getUserByDiscordId(@Param('discordId') discordId: string) {
    return await this.userService.findByDiscordId(discordId);
  }

  @Put('update/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return await this.userService.remove(id);
  }

  @Get(':id/workouts')
  async getUserWorkouts(@Param('id') id: string) {
    return await this.userService.getUserWorkouts(id);
  }

  @Get(':id/progress')
  async getUserProgress(@Param('id') id: string) {
    return await this.userService.getUserProgress(id);
  }
}
