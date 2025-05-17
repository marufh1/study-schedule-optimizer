import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export enum OptimizationStrategy {
  ENERGY_BASED = 'energy_based',
  DEADLINE_PRIORITY = 'deadline_priority',
  BALANCED = 'balanced',
}

export class ScheduleOptimizationDto {
  @IsMongoId()
  @IsNotEmpty()
  scheduleId: string;

  @IsOptional()
  @IsEnum(OptimizationStrategy)
  strategy?: OptimizationStrategy = OptimizationStrategy.BALANCED;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  prioritizeActivities?: string[];
}
