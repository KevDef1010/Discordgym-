/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WorkoutType } from '@prisma/client';

export class CreateExerciseDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsOptional()
  sets?: number;

  @IsNumber()
  @IsOptional()
  reps?: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsNumber()
  @IsOptional()
  distance?: number;

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}

export class CreateWorkoutDto {
  @IsString()
  userId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(WorkoutType)
  type: WorkoutType;

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsNumber()
  @IsOptional()
  caloriesBurned?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseDto)
  @IsOptional()
  exercises?: CreateExerciseDto[];
}

export class UpdateWorkoutDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(WorkoutType)
  @IsOptional()
  type?: WorkoutType;

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsNumber()
  @IsOptional()
  caloriesBurned?: number;
}
