import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { Activity, ActivityDocument } from "./schemas/activity.schema";

@Injectable()
export class ActivityService {
  constructor(@InjectModel(Activity.name) private activityModel: Model<ActivityDocument>) {}

  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    const createdActivity = new this.activityModel(createActivityDto);
    return createdActivity.save();
  }

  async findAll(): Promise<Activity[]> {
    return this.activityModel.find().exec();
  }

  async findByUserId(userId: string): Promise<Activity[]> {
    return this.activityModel.find({ userId }).exec();
  }

  async findOne(id: string): Promise<Activity | null> {
    return this.activityModel.findById(id).exec();
  }

  async update(id: string, updateActivityDto: Partial<CreateActivityDto>): Promise<Activity | null> {
    return this.activityModel.findByIdAndUpdate(id, updateActivityDto, { new: true }).exec();
  }

  async remove(id: string): Promise<Activity | null> {
    return this.activityModel.findByIdAndDelete(id).exec();
  }

  // Find activities by date range
  async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Activity[]> {
    return this.activityModel
      .find({
        userId,
        $or: [
          {
            startTime: { $gte: startDate, $lte: endDate },
          },
          {
            endTime: { $gte: startDate, $lte: endDate },
          },
          {
            startTime: { $lte: startDate },
            endTime: { $gte: endDate },
          },
        ],
      })
      .exec();
  }
}
