import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { OptimizerService } from "src/optimizer/optimizer.service";
import { CreateScheduleDto } from "./dto/create-schedule.dto";
import { ScheduleOptimizationDto } from "./dto/schedule-optimization.dto";
import { ScheduleService } from "./schedule.service";
import { Schedule } from "./schemas/schedule.schema";

@Controller("schedules")
export class ScheduleController {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly optimizerService: OptimizerService
  ) {}

  @Post()
  create(@Body() createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    return this.scheduleService.create(createScheduleDto);
  }

  @Get()
  findAll(): Promise<Schedule[]> {
    return this.scheduleService.findAll();
  }

  @Get("user/:userId")
  findByUserId(@Param("userId") userId: string): Promise<Schedule[]> {
    return this.scheduleService.findByUserId(userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<Schedule | null> {
    return this.scheduleService.findOne(id);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updateScheduleDto: Partial<CreateScheduleDto>): Promise<Schedule | null> {
    return this.scheduleService.update(id, updateScheduleDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string): Promise<Schedule | null> {
    return this.scheduleService.remove(id);
  }

  @Put(":id/activities/:activityId")
  addActivity(@Param("id") id: string, @Param("activityId") activityId: string): Promise<Schedule | null> {
    return this.scheduleService.addActivity(id, activityId);
  }

  @Delete(":id/activities/:activityId")
  removeActivity(@Param("id") id: string, @Param("activityId") activityId: string): Promise<Schedule | null> {
    return this.scheduleService.removeActivity(id, activityId);
  }

  @Post(":id/optimize")
  optimizeSchedule(@Param("id") id: string, @Body() optimizationDto: ScheduleOptimizationDto): Promise<Schedule> {
    // Set the schedule ID from the URL parameter
    optimizationDto.scheduleId = id;
    return this.optimizerService.optimizeSchedule(optimizationDto);
  }
}
