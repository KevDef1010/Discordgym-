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
import { WorkoutService } from './workout.service';
import { CreateWorkoutDto, UpdateWorkoutDto } from './dto/workout.dto';

@Controller('fitness')
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @Post('create-workout')
  async createWorkout(@Body() createWorkoutDto: CreateWorkoutDto) {
    return await this.workoutService.create(createWorkoutDto);
  }

  @Get('workouts')
  async getAllWorkouts(
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    const takeNum = take ? parseInt(take) : undefined;
    const skipNum = skip ? parseInt(skip) : undefined;
    return await this.workoutService.findAll(takeNum, skipNum);
  }

  @Get(':id')
  async getWorkoutById(@Param('id') id: string) {
    return await this.workoutService.findOne(id);
  }

  @Put(':id')
  async updateWorkout(
    @Param('id') id: string,
    @Body() updateWorkoutDto: UpdateWorkoutDto,
  ) {
    return await this.workoutService.update(id, updateWorkoutDto);
  }

  @Delete(':id')
  async deleteWorkout(@Param('id') id: string) {
    return await this.workoutService.remove(id);
  }

  @Get('user/:userId')
  async getWorkoutsByUser(@Param('userId') userId: string) {
    return await this.workoutService.getWorkoutsByUser(userId);
  }

  @Get('user/:userId/stats')
  async getWorkoutStats(@Param('userId') userId: string) {
    return await this.workoutService.getWorkoutStats(userId);
  }
}
