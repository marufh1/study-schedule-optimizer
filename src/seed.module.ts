import { Body, Controller, Get, Module, Post, Query } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ActivityModule } from "./activity/activity.module";
import { Activity, ActivitySchema } from "./activity/schemas/activity.schema";
import { DataSeedService } from "./data-seed.service";
import { ScheduleModule } from "./schedule/schedule.module";
import { Schedule, ScheduleSchema } from "./schedule/schemas/schedule.schema";
import { User, UserSchema } from "./user/schemas/user.schema";
import { UserModule } from "./user/user.module";

// Simple DTO for seeding configuration
export class SeedConfigDto {
  userCount?: number;
  weeksOfData?: number;
  activitiesPerDay?: number;
  clearExistingData?: boolean;
}

@Controller("api")
export class SeedController {
  constructor(private readonly dataSeedService: DataSeedService) {}

  @Post("seed")
  async seedDatabase(@Body() config: SeedConfigDto = {}) {
    await this.dataSeedService.seedDatabase();
    return { message: "Database seeded successfully", config };
  }

  @Get("seed")
  async seedWithQueryParams(
    @Query("users") userCount?: string,
    @Query("weeks") weeksOfData?: string,
    @Query("activities") activitiesPerDay?: string,
    @Query("clear") clearExisting?: string
  ) {
    const config: SeedConfigDto = {};

    if (userCount) config.userCount = parseInt(userCount, 10);
    if (weeksOfData) config.weeksOfData = parseInt(weeksOfData, 10);
    if (activitiesPerDay) config.activitiesPerDay = parseInt(activitiesPerDay, 10);
    if (clearExisting) config.clearExistingData = clearExisting === "true";

    await this.dataSeedService.seedDatabase();
    return { message: "Database seeded successfully", config };
  }
}

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Schedule.name, schema: ScheduleSchema },
      { name: Activity.name, schema: ActivitySchema },
    ]),
    UserModule,
    ScheduleModule,
    ActivityModule,
  ],
  controllers: [SeedController],
  providers: [DataSeedService],
  exports: [DataSeedService],
})
export class SeedModule {}
