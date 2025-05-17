import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  ActivityComplexity,
  ActivityPriority,
  ActivityType,
} from '../schemas/activity.schema';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsEnum(ActivityType)
  type: ActivityType;

  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @IsOptional()
  @IsEnum(ActivityPriority)
  priority?: ActivityPriority;

  @IsOptional()
  @IsEnum(ActivityComplexity)
  complexity?: ActivityComplexity;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsString()
  recurrencePattern?: string;

  @IsMongoId()
  userId: string;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deadline?: Date;
}
