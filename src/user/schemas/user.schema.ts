import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({
    type: [{ dayOfWeek: Number, hourlyEnergy: [Number] }],
    default: [],
  })
  energyPatterns: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    hourlyEnergy: number[]; // 0-23 hours, energy level from 1-10
  }[];
}

export const UserSchema = SchemaFactory.createForClass(User);
