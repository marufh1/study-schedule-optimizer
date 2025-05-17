import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ActivityService } from "./activity.service";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { Activity } from "./schemas/activity.schema";

@Controller("activities")
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  create(@Body() createActivityDto: CreateActivityDto): Promise<Activity> {
    return this.activityService.create(createActivityDto);
  }

  @Get()
  findAll(): Promise<Activity[]> {
    return this.activityService.findAll();
  }

  @Get("user/:userId")
  findByUserId(@Param("userId") userId: string): Promise<Activity[]> {
    return this.activityService.findByUserId(userId);
  }

  @Get("date-range")
  findByDateRange(@Query("userId") userId: string, @Query("startDate") startDate: string, @Query("endDate") endDate: string): Promise<Activity[]> {
    return this.activityService.findByDateRange(userId, new Date(startDate), new Date(endDate));
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<Activity | null> {
    return this.activityService.findOne(id);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updateActivityDto: Partial<CreateActivityDto>): Promise<Activity | null> {
    return this.activityService.update(id, updateActivityDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string): Promise<Activity | null> {
    return this.activityService.remove(id);
  }
}
