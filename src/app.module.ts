import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ActivityModule } from "./activity/activity.module";
import { OptimizerModule } from "./optimizer/optimizer.module";
import { ScheduleModule } from "./schedule/schedule.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || "", {
      autoIndex: true,
    }),
    UserModule,
    ScheduleModule,
    ActivityModule,
    OptimizerModule,
  ],
})
export class AppModule {}
