import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema, Types } from "mongoose";

export type ActivityDocument = Activity & Document;

export enum ActivityType {
  WORK = "work",
  CLASS = "class",
  STUDY = "study",
  ASSIGNMENT = "assignment",
  OTHER = "other",
}

export enum ActivityPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export enum ActivityComplexity {
  EASY = "easy",
  MODERATE = "moderate",
  COMPLEX = "complex",
}

@Schema({ timestamps: true })
export class Activity {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ActivityType })
  type: ActivityType;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ enum: ActivityPriority, default: ActivityPriority.MEDIUM })
  priority: ActivityPriority;

  @Prop({ enum: ActivityComplexity, default: ActivityComplexity.MODERATE })
  complexity: ActivityComplexity;

  @Prop({ default: false })
  isRecurring: boolean;

  @Prop()
  recurrencePattern: string; // e.g., 'WEEKLY' or 'DAILY'

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop()
  deadline: Date;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
