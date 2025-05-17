import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";
import { ActivityService } from "../activity/activity.service";
import { ActivityType } from "../activity/schemas/activity.schema";
import { OptimizationStrategy, ScheduleOptimizationDto } from "../schedule/dto/schedule-optimization.dto";
import { ScheduleService } from "../schedule/schedule.service";
import { UserService } from "../user/user.service";
import { EnergyPatternAnalyzer } from "./algorithms/energy-pattern-analyzer";
import { GeneticAlgorithm } from "./algorithms/genetic-algorithm";

@Injectable()
export class OptimizerService {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly activityService: ActivityService,
    private readonly userService: UserService
  ) {}

  async optimizeSchedule(optimizationDto: ScheduleOptimizationDto): Promise<any> {
    const schedule = await this.scheduleService.findOne(optimizationDto.scheduleId);

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    const user = await this.userService.findOne(schedule.userId.toString());

    if (!user) {
      throw new Error("User not found");
    }

    const activities = await this.activityService.findByDateRange(user._id.toString(), schedule.startDate, schedule.endDate);

    let energyPatterns = user.energyPatterns;

    if (!energyPatterns || energyPatterns.length === 0) {
      const allUserActivities = await this.activityService.findByUserId(user._id.toString());
      const analyzer = new EnergyPatternAnalyzer(user._id.toString(), allUserActivities);
      energyPatterns = analyzer.analyzeEnergyPatterns();
      await this.userService.updateEnergyPatterns(user._id.toString(), energyPatterns);
    }

    const fixedActivities = activities.filter((activity) => activity.type !== ActivityType.STUDY && activity.type !== ActivityType.ASSIGNMENT);

    const studyActivities = activities.filter((activity) => activity.type === ActivityType.STUDY || activity.type === ActivityType.ASSIGNMENT);

    switch (optimizationDto.strategy) {
      case OptimizationStrategy.DEADLINE_PRIORITY:
        studyActivities.sort((a, b) => {
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return a.deadline.getTime() - b.deadline.getTime();
        });
        break;

      case OptimizationStrategy.ENERGY_BASED:
      case OptimizationStrategy.BALANCED:
      default:
        break;
    }

    if (optimizationDto.prioritizeActivities && optimizationDto.prioritizeActivities.length > 0) {
      const priorityMap = new Map<string, number>();

      optimizationDto.prioritizeActivities.forEach((id, index) => {
        priorityMap.set(id, index);
      });

      studyActivities.sort((a: { _id: Types.ObjectId }, b: { _id: Types.ObjectId }) => {
        const aIndex: number = priorityMap.get(a._id.toString()) ?? Number.MAX_SAFE_INTEGER;
        const bIndex: number = priorityMap.get(b._id.toString()) ?? Number.MAX_SAFE_INTEGER;
        return aIndex - bIndex;
      });
    }

    const geneticAlgorithm = new GeneticAlgorithm(fixedActivities, studyActivities, energyPatterns, schedule.startDate, schedule.endDate);

    const optimizedSchedule = geneticAlgorithm.optimize();

    const updatedSchedule = await this.scheduleService.updateOptimizedBlocks(schedule._id.toString(), optimizedSchedule);

    return updatedSchedule;
  }
}
