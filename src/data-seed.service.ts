import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { Model } from "mongoose";
import { Activity, ActivityComplexity, ActivityDocument, ActivityPriority, ActivityType } from "./activity/schemas/activity.schema";
import { Schedule, ScheduleDocument } from "./schedule/schemas/schedule.schema";
import { User, UserDocument } from "./user/schemas/user.schema";

interface SampleUserData {
  name: string;
  email: string;
  energyPatterns: {
    dayOfWeek: number;
    hourlyEnergy: number[];
  }[];
}

interface SampleActivityData {
  title: string;
  description: string;
  type: ActivityType;
  startTime: Date | null;
  endTime: Date | null;
  complexity: ActivityComplexity;
  priority: ActivityPriority;
  userId: mongoose.Types.ObjectId;
  isCompleted: boolean;
  deadline?: Date;
}

interface SampleScheduleData {
  name: string;
  startDate: Date;
  endDate: Date;
  userId: mongoose.Types.ObjectId;
  activities: mongoose.Types.ObjectId[];
}

@Injectable()
export class DataSeedService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>
  ) {}

  async seedDatabase(): Promise<void> {
    // Clear existing data
    await this.userModel.deleteMany({});
    await this.activityModel.deleteMany({});
    await this.scheduleModel.deleteMany({});

    // Create sample user
    const user = await this.createSampleUser();

    // Create sample activities
    const activities = await this.createSampleActivities(user._id);

    // Create sample schedule
    await this.createSampleSchedule(
      user._id,
      activities.map((a) => a._id)
    );

    console.log("Database seeded successfully!");
  }

  private async createSampleUser(): Promise<User> {
    const sampleUser: SampleUserData = {
      name: "John Doe",
      email: "john.doe@example.com",
      energyPatterns: [
        // Sunday (0)
        {
          dayOfWeek: 0,
          hourlyEnergy: [
            3,
            2,
            2,
            2,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            7, // 12am-12pm
            6,
            5,
            5,
            6,
            7,
            6,
            5,
            4,
            4,
            3,
            3,
            2, // 12pm-12am
          ],
        },
        // Monday (1)
        {
          dayOfWeek: 1,
          hourlyEnergy: [
            2,
            1,
            1,
            1,
            1,
            2,
            3,
            5,
            7,
            8,
            9,
            8, // 12am-12pm
            7,
            6,
            5,
            5,
            6,
            7,
            6,
            5,
            4,
            4,
            3,
            2, // 12pm-12am
          ],
        },
        // Tuesday (2)
        {
          dayOfWeek: 2,
          hourlyEnergy: [
            2,
            1,
            1,
            1,
            1,
            2,
            3,
            5,
            7,
            8,
            9,
            8, // 12am-12pm
            7,
            6,
            5,
            5,
            6,
            7,
            6,
            5,
            4,
            4,
            3,
            2, // 12pm-12am
          ],
        },
        // Wednesday (3)
        {
          dayOfWeek: 3,
          hourlyEnergy: [
            2,
            1,
            1,
            1,
            1,
            2,
            3,
            5,
            7,
            8,
            8,
            7, // 12am-12pm
            6,
            5,
            4,
            5,
            6,
            7,
            6,
            5,
            4,
            4,
            3,
            2, // 12pm-12am
          ],
        },
        // Thursday (4)
        {
          dayOfWeek: 4,
          hourlyEnergy: [
            2,
            1,
            1,
            1,
            1,
            2,
            3,
            5,
            7,
            8,
            8,
            7, // 12am-12pm
            6,
            5,
            4,
            5,
            6,
            7,
            6,
            5,
            4,
            4,
            3,
            2, // 12pm-12am
          ],
        },
        // Friday (5)
        {
          dayOfWeek: 5,
          hourlyEnergy: [
            2,
            1,
            1,
            1,
            1,
            2,
            3,
            5,
            7,
            8,
            8,
            7, // 12am-12pm
            6,
            5,
            4,
            5,
            6,
            7,
            6,
            5,
            4,
            4,
            3,
            2, // 12pm-12am
          ],
        },
        // Saturday (6)
        {
          dayOfWeek: 6,
          hourlyEnergy: [
            3,
            2,
            2,
            2,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            7, // 12am-12pm
            6,
            5,
            5,
            6,
            7,
            6,
            5,
            4,
            4,
            3,
            3,
            2, // 12pm-12am
          ],
        },
      ],
    };

    const createdUser = new this.userModel(sampleUser);
    return createdUser.save();
  }

  private async createSampleActivities(userId: mongoose.Types.ObjectId): Promise<Activity[]> {
    // Get current date as reference
    const today = new Date();
    const currentDay = today.getDay(); // 0-6 (Sunday-Saturday)

    // Create a date for a specific day of the week
    const getDateForDayOfWeek = (dayOfWeek: number) => {
      const result = new Date(today);
      const diff = (dayOfWeek - currentDay + 7) % 7;
      result.setDate(today.getDate() + diff);
      return result;
    };

    // Set time on a specific date
    const setTime = (date: Date, hours: number, minutes: number = 0) => {
      const result = new Date(date);
      result.setHours(hours, minutes, 0, 0);
      return result;
    };

    // Create sample activities spanning current week
    const sampleActivities: SampleActivityData[] = [
      // Fixed activities (work, classes)
      {
        title: "Work Shift",
        description: "Daily work hours",
        type: ActivityType.WORK,
        startTime: setTime(getDateForDayOfWeek(1), 9), // Monday 9 AM
        endTime: setTime(getDateForDayOfWeek(1), 17), // Monday 5 PM
        complexity: ActivityComplexity.MODERATE,
        priority: ActivityPriority.HIGH,
        userId: userId,
        isCompleted: false,
      },
      {
        title: "Work Shift",
        description: "Daily work hours",
        type: ActivityType.WORK,
        startTime: setTime(getDateForDayOfWeek(2), 9), // Tuesday 9 AM
        endTime: setTime(getDateForDayOfWeek(2), 17), // Tuesday 5 PM
        complexity: ActivityComplexity.MODERATE,
        priority: ActivityPriority.HIGH,
        userId: userId,
        isCompleted: false,
      },
      {
        title: "Work Shift",
        description: "Daily work hours",
        type: ActivityType.WORK,
        startTime: setTime(getDateForDayOfWeek(3), 9), // Wednesday 9 AM
        endTime: setTime(getDateForDayOfWeek(3), 17), // Wednesday 5 PM
        complexity: ActivityComplexity.MODERATE,
        priority: ActivityPriority.HIGH,
        userId: userId,
        isCompleted: false,
      },
      {
        title: "Work Shift",
        description: "Daily work hours",
        type: ActivityType.WORK,
        startTime: setTime(getDateForDayOfWeek(4), 9), // Thursday 9 AM
        endTime: setTime(getDateForDayOfWeek(4), 17), // Thursday 5 PM
        complexity: ActivityComplexity.MODERATE,
        priority: ActivityPriority.HIGH,
        userId: userId,
        isCompleted: false,
      },
      {
        title: "Work Shift",
        description: "Daily work hours",
        type: ActivityType.WORK,
        startTime: setTime(getDateForDayOfWeek(5), 9), // Friday 9 AM
        endTime: setTime(getDateForDayOfWeek(5), 14), // Friday 2 PM (half day)
        complexity: ActivityComplexity.MODERATE,
        priority: ActivityPriority.HIGH,
        userId: userId,
        isCompleted: false,
      },
      {
        title: "Database Systems Class",
        description: "Weekly database lecture",
        type: ActivityType.CLASS,
        startTime: setTime(getDateForDayOfWeek(1), 18), // Monday 6 PM
        endTime: setTime(getDateForDayOfWeek(1), 20), // Monday 8 PM
        complexity: ActivityComplexity.COMPLEX,
        priority: ActivityPriority.HIGH,
        userId: userId,
        isCompleted: false,
      },
      {
        title: "Machine Learning Class",
        description: "Weekly ML lecture",
        type: ActivityType.CLASS,
        startTime: setTime(getDateForDayOfWeek(3), 18), // Wednesday 6 PM
        endTime: setTime(getDateForDayOfWeek(3), 20), // Wednesday 8 PM
        complexity: ActivityComplexity.COMPLEX,
        priority: ActivityPriority.HIGH,
        userId: userId,
        isCompleted: false,
      },

      // Study tasks
      {
        title: "Database Assignment",
        description: "Complete database normalization exercise",
        type: ActivityType.ASSIGNMENT,
        startTime: setTime(getDateForDayOfWeek(4), 18), // Thursday 6 PM
        endTime: setTime(getDateForDayOfWeek(4), 20), // Thursday 8 PM
        complexity: ActivityComplexity.COMPLEX,
        priority: ActivityPriority.HIGH,
        userId: userId,
        isCompleted: false,
        deadline: setTime(getDateForDayOfWeek(6), 23, 59), // Saturday 11:59 PM
      },
      {
        title: "ML Project Work",
        description: "Work on machine learning project",
        type: ActivityType.ASSIGNMENT,
        startTime: setTime(getDateForDayOfWeek(6), 10), // Saturday 10 AM
        endTime: setTime(getDateForDayOfWeek(6), 12), // Saturday 12 PM
        complexity: ActivityComplexity.COMPLEX,
        priority: ActivityPriority.HIGH,
        userId: userId,
        isCompleted: false,
        deadline: setTime(new Date(getDateForDayOfWeek(6).getTime() + 7 * 24 * 60 * 60 * 1000), 23, 59), // Next Saturday
      },
      {
        title: "Read Database Textbook",
        description: "Read chapters 5-7",
        type: ActivityType.STUDY,
        startTime: setTime(getDateForDayOfWeek(2), 19), // Tuesday 7 PM
        endTime: setTime(getDateForDayOfWeek(2), 21), // Tuesday 9 PM
        complexity: ActivityComplexity.MODERATE,
        priority: ActivityPriority.MEDIUM,
        userId: userId,
        isCompleted: false,
      },
      {
        title: "Machine Learning Reading",
        description: "Read research papers",
        type: ActivityType.STUDY,
        startTime: setTime(getDateForDayOfWeek(5), 15), // Friday 3 PM
        endTime: setTime(getDateForDayOfWeek(5), 17), // Friday 5 PM
        complexity: ActivityComplexity.COMPLEX,
        priority: ActivityPriority.MEDIUM,
        userId: userId,
        isCompleted: false,
      },
      {
        title: "Review Lecture Notes",
        description: "Revisit this week's lecture material",
        type: ActivityType.STUDY,
        startTime: setTime(getDateForDayOfWeek(6), 15), // Saturday 3 PM
        endTime: setTime(getDateForDayOfWeek(6), 17), // Saturday 5 PM
        complexity: ActivityComplexity.MODERATE,
        priority: ActivityPriority.MEDIUM,
        userId: userId,
        isCompleted: false,
      },
      {
        title: "Weekly Planning",
        description: "Plan next week's activities",
        type: ActivityType.OTHER,
        startTime: setTime(getDateForDayOfWeek(0), 10), // Sunday 10 AM
        endTime: setTime(getDateForDayOfWeek(0), 11), // Sunday 11 AM
        complexity: ActivityComplexity.EASY,
        priority: ActivityPriority.MEDIUM,
        userId: userId,
        isCompleted: false,
      },
    ];

    // Add some study tasks without pre-assigned times (to be scheduled by optimizer)
    const unscheduledActivities: SampleActivityData[] = [
      {
        title: "Database Revision",
        description: "Revision for upcoming exam",
        type: ActivityType.STUDY,
        startTime: null,
        endTime: null,
        complexity: ActivityComplexity.COMPLEX,
        priority: ActivityPriority.HIGH,
        userId: userId,
        isCompleted: false,
      },
      {
        title: "Machine Learning Practice",
        description: "Work through practice exercises",
        type: ActivityType.STUDY,
        startTime: null,
        endTime: null,
        complexity: ActivityComplexity.COMPLEX,
        priority: ActivityPriority.MEDIUM,
        userId: userId,
        isCompleted: false,
      },
      {
        title: "Mock Exam",
        description: "Complete mock exam under timed conditions",
        type: ActivityType.STUDY,
        startTime: null,
        endTime: null,
        complexity: ActivityComplexity.COMPLEX,
        priority: ActivityPriority.HIGH,
        userId: userId,
        isCompleted: false,
      },
    ];

    // Save all activities
    const allActivities = [...sampleActivities, ...unscheduledActivities];
    const createdActivities: Activity[] = [];

    for (const activity of allActivities) {
      const createdActivity = new this.activityModel(activity);
      createdActivities.push(await createdActivity.save());
    }

    return createdActivities;
  }

  private async createSampleSchedule(userId: mongoose.Types.ObjectId, activityIds: mongoose.Types.ObjectId[]): Promise<Schedule> {
    // Calculate start and end of current week
    const today = new Date();
    const currentDay = today.getDay(); // 0-6 (Sunday-Saturday)

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay); // Go to Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Go to Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    const sampleSchedule: SampleScheduleData = {
      name: "Current Week Schedule",
      startDate: startOfWeek,
      endDate: endOfWeek,
      userId: userId,
      activities: activityIds,
    };

    const createdSchedule = new this.scheduleModel(sampleSchedule);
    return createdSchedule.save();
  }
}
