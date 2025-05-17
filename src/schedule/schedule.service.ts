import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateScheduleDto } from "./dto/create-schedule.dto";
import { Schedule, ScheduleDocument } from "./schemas/schedule.schema";

@Injectable()
export class ScheduleService {
  constructor(@InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const createdSchedule = new this.scheduleModel(createScheduleDto);
    return createdSchedule.save();
  }

  async findAll(): Promise<Schedule[]> {
    return this.scheduleModel.find().exec();
  }

  async findByUserId(userId: string): Promise<Schedule[]> {
    return this.scheduleModel.find({ userId }).populate("activities").exec();
  }

  async findOne(id: string): Promise<Schedule | null> {
    return this.scheduleModel.findById(id).populate("activities").exec();
  }

  async update(id: string, updateScheduleDto: Partial<CreateScheduleDto>): Promise<Schedule | null> {
    return this.scheduleModel.findByIdAndUpdate(id, updateScheduleDto, { new: true }).populate("activities").exec();
  }

  async remove(id: string): Promise<Schedule | null> {
    return this.scheduleModel.findByIdAndDelete(id).exec();
  }

  async addActivity(scheduleId: string, activityId: string): Promise<Schedule | null> {
    return this.scheduleModel
      .findByIdAndUpdate(scheduleId, { $addToSet: { activities: activityId } }, { new: true })
      .populate("activities")
      .exec();
  }

  async removeActivity(scheduleId: string, activityId: string): Promise<Schedule | null> {
    return this.scheduleModel
      .findByIdAndUpdate(scheduleId, { $pull: { activities: activityId } }, { new: true })
      .populate("activities")
      .exec();
  }

  async updateOptimizedBlocks(scheduleId: string, optimizedBlocks: any[]): Promise<Schedule | null> {
    return this.scheduleModel.findByIdAndUpdate(scheduleId, { $set: { optimizedBlocks } }, { new: true }).populate("activities").exec();
  }
}
