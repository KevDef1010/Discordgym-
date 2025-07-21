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

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  async getAllUsers(
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    const takeNum = take ? parseInt(take) : undefined;
    const skipNum = skip ? parseInt(skip) : undefined;
    return this.userService.findAll(takeNum, skipNum);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Get('discord/:discordId')
  async getUserByDiscordId(@Param('discordId') discordId: string) {
    return this.userService.findByDiscordId(discordId);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Get(':id/workouts')
  async getUserWorkouts(@Param('id') id: string) {
    return this.userService.getUserWorkouts(id);
  }

  @Get(':id/progress')
  async getUserProgress(@Param('id') id: string) {
    return this.userService.getUserProgress(id);
  }
}
