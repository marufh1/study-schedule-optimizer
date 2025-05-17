import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ActivityModule } from "./activity/activity.module";
import { OptimizerModule } from "./optimizer/optimizer.module";
import { ScheduleModule } from "./schedule/schedule.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    MongooseModule.forRoot(
      "mongodb+srv://MCSE-1102:kdusdgCO11K02OCwo4krJ@c0.q1ttovb.mongodb.net/ScheduleOptimizerDb?retryWrites=true&w=majority&appName=c0",
      {
        autoIndex: true,
      }
    ),
    UserModule,
    ScheduleModule,
    ActivityModule,
    OptimizerModule,
  ],
})
export class AppModule {}
