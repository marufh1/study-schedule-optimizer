import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Activity, ActivitySchema } from "../activity/schemas/activity.schema";
import { OptimizerModule } from "../optimizer/optimizer.module";
import { ScheduleController } from "./schedule.controller";
import { ScheduleService } from "./schedule.service";
import { Schedule, ScheduleSchema } from "./schemas/schedule.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Schedule.name, schema: ScheduleSchema },
      { name: Activity.name, schema: ActivitySchema },
    ]),
    forwardRef(() => OptimizerModule),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
