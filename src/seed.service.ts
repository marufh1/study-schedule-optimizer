import { faker } from "@faker-js/faker";
import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { Model } from "mongoose";
import { Activity, ActivityComplexity, ActivityDocument, ActivityPriority, ActivityType } from "./activity/schemas/activity.schema";
import { Schedule, ScheduleDocument } from "./schedule/schemas/schedule.schema";
import { User, UserDocument } from "./user/schemas/user.schema";

interface SeedConfig {
  userCount: number;
  weeksOfData: number;
  activitiesPerDay: number;
  clearExistingData: boolean;
}

const DEFAULT_CONFIG: SeedConfig = {
  userCount: 5,
  weeksOfData: 8,
  activitiesPerDay: 4,
  clearExistingData: true,
};

@Injectable()
export class DataSeedService {
  private readonly logger = new Logger(DataSeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>
  ) {}

  /**
   * Seed the database with sample data
   */
  async seedDatabase(config: Partial<SeedConfig> = {}): Promise<void> {
    const seedConfig = { ...DEFAULT_CONFIG, ...config };
    this.logger.log(`Starting database seed with config: ${JSON.stringify(seedConfig)}`);

    faker.seed(123); // Set a fixed seed for reproducible data

    if (seedConfig.clearExistingData) {
      this.logger.log("Clearing existing data...");
      await this.clearDatabase();
    }

    // Create users
    const users = await this.createUsers(seedConfig.userCount);
    this.logger.log(`Created ${users.length} users`);

    // For each user, create activities and schedules
    for (const user of users) {
      this.logger.log(`Creating data for user: ${user.name} (${user._id})`);

      // Create activities spanning multiple weeks
      const activities = await this.createActivitiesForUser(user._id, seedConfig.weeksOfData, seedConfig.activitiesPerDay);
      this.logger.log(`Created ${activities.length} activities for user`);

      // Create weekly schedules
      const schedules = await this.createSchedulesForUser(
        user._id,
        activities.map((a) => a._id),
        seedConfig.weeksOfData
      );
      this.logger.log(`Created ${schedules.length} schedules for user`);
    }

    this.logger.log("Database seeding completed successfully!");
  }

  /**
   * Clear all data from the database
   */
  private async clearDatabase(): Promise<void> {
    await this.userModel.deleteMany({}).exec();
    await this.activityModel.deleteMany({}).exec();
    await this.scheduleModel.deleteMany({}).exec();
  }

  /**
   * Create sample users with energy patterns
   */
  private async createUsers(count: number): Promise<User[]> {
    const users: User[] = [];

    for (let i = 0; i < count; i++) {
      const userData = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        energyPatterns: this.generateEnergyPatterns(),
      };

      const user = new this.userModel(userData);
      users.push(await user.save());
    }

    return users;
  }

  /**
   * Generate energy patterns for each day of the week
   */
  private generateEnergyPatterns(): any[] {
    const patterns = [];

    // Generate patterns for each day of the week
    for (let day = 0; day < 7; day++) {
      const isWeekend = day === 0 || day === 6;

      let hourlyEnergy;
      if (isWeekend) {
        // Weekend pattern - later peak
        hourlyEnergy = [
          3,
          2,
          2,
          1,
          1,
          1,
          2,
          3,
          5,
          7,
          8,
          9, // 12am-12pm
          8,
          7,
          7,
          7,
          6,
          6,
          5,
          5,
          4,
          4,
          3,
          3, // 12pm-12am
        ];
      } else {
        // Weekday pattern - earlier peak
        hourlyEnergy = [
          2,
          1,
          1,
          1,
          1,
          2,
          3,
          5,
          7,
          9,
          8,
          7, // 12am-12pm
          6,
          5,
          5,
          6,
          7,
          7,
          6,
          5,
          4,
          3,
          3,
          2, // 12pm-12am
        ];
      }

      // Add some randomness
      hourlyEnergy = hourlyEnergy.map((energy) => {
        // Random variation (-1 to +1)
        const variation = Math.floor(Math.random() * 3) - 1;
        // Keep within 1-10 range
        return Math.max(1, Math.min(10, energy + variation));
      });

      patterns.push({
        dayOfWeek: day,
        hourlyEnergy,
      });
    }

    return patterns;
  }

  /**
   * Create activities for a user
   */
  private async createActivitiesForUser(userId: mongoose.Types.ObjectId, weeksCount: number, activitiesPerDay: number): Promise<Activity[]> {
    const activities: Activity[] = [];
    const startDate = new Date();

    // Generate activities for each week
    for (let week = 0; week < weeksCount; week++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() + week * 7);

      // Generate work activities (weekdays 9-5)
      const workActivities = this.generateWorkActivities(userId, weekStart);

      // Generate class activities (2-3 per week)
      const classActivities = this.generateClassActivities(userId, weekStart);

      // Generate study and assignment activities
      const studyActivities = this.generateStudyActivities(userId, weekStart, activitiesPerDay);

      // Combine all activities for this week
      const weekActivities = [...workActivities, ...classActivities, ...studyActivities];

      // Save all activities
      for (const activityData of weekActivities) {
        const activity = new this.activityModel(activityData);
        activities.push(await activity.save());
      }
    }

    return activities;
  }

  /**
   * Generate work activities for a week (9-5 on weekdays)
   */
  private generateWorkActivities(userId: mongoose.Types.ObjectId, weekStart: Date): any[] {
    const activities = [];

    // Loop through days of the week (Monday=1 to Friday=5)
    for (let day = 1; day <= 5; day++) {
      const workDate = new Date(weekStart);
      workDate.setDate(weekStart.getDate() + day);

      activities.push({
        title: `Work - ${faker.company.name()}`,
        description: `Regular work hours for ${faker.company.buzzPhrase()}`,
        type: ActivityType.WORK,
        startTime: new Date(new Date(workDate).setHours(9, 0, 0, 0)),
        endTime: new Date(new Date(workDate).setHours(17, 0, 0, 0)),
        complexity: ActivityComplexity.MODERATE,
        priority: ActivityPriority.HIGH,
        userId: userId,
        isCompleted: false,
      });
    }

    return activities;
  }

  /**
   * Generate class activities for a week
   */
  private generateClassActivities(userId: mongoose.Types.ObjectId, weekStart: Date): any[] {
    const activities = [];

    // Class subjects
    const subjects = ["Database Systems", "Machine Learning", "Web Development", "Software Engineering", "Algorithms", "Computer Networks"];

    // Randomly select 2-3 weekdays for classes
    const numClasses = 2 + Math.floor(Math.random() * 2);
    const classDays = [];

    while (classDays.length < numClasses) {
      const day = 1 + Math.floor(Math.random() * 5); // 1-5 (Mon-Fri)
      if (!classDays.includes(day)) {
        classDays.push(day);
      }
    }

    // Create classes
    classDays.forEach((day, index) => {
      const classDate = new Date(weekStart);
      classDate.setDate(weekStart.getDate() + day);

      // Evening class (6-8 PM)
      activities.push({
        title: `${subjects[index % subjects.length]} Class`,
        description: `Weekly lecture on ${subjects[index % subjects.length]}`,
        type: ActivityType.CLASS,
        startTime: new Date(new Date(classDate).setHours(18, 0, 0, 0)),
        endTime: new Date(new Date(classDate).setHours(20, 0, 0, 0)),
        complexity: ActivityComplexity.COMPLEX,
        priority: ActivityPriority.HIGH,
        userId: userId,
        isCompleted: false,
      });
    });

    return activities;
  }

  /**
   * Generate study and assignment activities
   */
  private generateStudyActivities(userId: mongoose.Types.ObjectId, weekStart: Date, activitiesPerDay: number): any[] {
    const activities = [];

    // Study topics
    const topics = ["Database", "Machine Learning", "Algorithms", "Web Development", "Networks", "Software Engineering"];

    // Study types
    const studyTypes = ["Reading", "Problem Solving", "Project Work", "Research", "Review", "Practice"];

    // For each day of the week
    for (let day = 0; day < 7; day++) {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + day);

      // Skip some days randomly to make it realistic
      if (Math.random() > 0.7) continue;

      // Number of study activities this day (1-3)
      const numActivities = 1 + Math.floor(Math.random() * Math.min(3, activitiesPerDay));

      for (let i = 0; i < numActivities; i++) {
        const isAssignment = Math.random() > 0.7; // 30% chance of being an assignment

        const topic = faker.helpers.arrayElement(topics);
        const studyType = faker.helpers.arrayElement(studyTypes);

        // Time slot
        let startHour, duration;

        if (day >= 1 && day <= 5) {
          // Weekday - study in the evening
          startHour = 18 + Math.floor(Math.random() * 4); // 6-9 PM
          duration = 1 + Math.floor(Math.random() * 2); // 1-2 hours
        } else {
          // Weekend - study during the day
          startHour = 10 + Math.floor(Math.random() * 8); // 10 AM - 5 PM
          duration = 1 + Math.floor(Math.random() * 3); // 1-3 hours
        }

        // 30% of study activities have no pre-assigned time (to be scheduled by optimizer)
        const hasScheduledTime = Math.random() > 0.3;

        // Create activity
        const activity: any = {
          title: isAssignment ? `${topic} Assignment - ${studyType}` : `${topic} ${studyType}`,
          description: `Study task for ${topic}`,
          type: isAssignment ? ActivityType.ASSIGNMENT : ActivityType.STUDY,
          complexity: faker.helpers.arrayElement(Object.values(ActivityComplexity)),
          priority: faker.helpers.arrayElement(Object.values(ActivityPriority)),
          userId: userId,
          isCompleted: false,
        };

        // Add times if scheduled
        if (hasScheduledTime) {
          const activityDate = new Date(dayDate);
          activity.startTime = new Date(new Date(activityDate).setHours(startHour, 0, 0, 0));
          activity.endTime = new Date(new Date(activityDate).setHours(startHour + duration, 0, 0, 0));
        }

        // Add deadline for assignments
        if (isAssignment) {
          const deadline = new Date(dayDate);
          deadline.setDate(deadline.getDate() + 7 + Math.floor(Math.random() * 7)); // 1-2 weeks deadline
          activity.deadline = deadline;
        }

        activities.push(activity);
      }
    }

    return activities;
  }

  /**
   * Create weekly schedules for a user
   */
  private async createSchedulesForUser(
    userId: mongoose.Types.ObjectId,
    activityIds: mongoose.Types.ObjectId[],
    weeksCount: number
  ): Promise<Schedule[]> {
    const schedules: Schedule[] = [];
    const startDate = new Date();

    // Create a schedule for each week
    for (let week = 0; week < weeksCount; week++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + week * 7);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const scheduleData = {
        name: `Week ${week + 1} Schedule`,
        startDate: weekStart,
        endDate: weekEnd,
        userId: userId,
        activities: activityIds,
      };

      const schedule = new this.scheduleModel(scheduleData);
      schedules.push(await schedule.save());
    }

    return schedules;
  }
}
