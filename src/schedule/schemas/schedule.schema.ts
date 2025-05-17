import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema, Types } from "mongoose";

export type ScheduleDocument = Schedule & Document;

@Schema({ timestamps: true })
export class Schedule {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "Activity" }] })
  activities: MongooseSchema.Types.ObjectId[];

  @Prop({ type: Object })
  optimizedBlocks: {
    date: Date;
    blocks: {
      activityId: MongooseSchema.Types.ObjectId;
      startTime: Date;
      endTime: Date;
      type: string;
      title: string;
    }[];
  }[];
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
