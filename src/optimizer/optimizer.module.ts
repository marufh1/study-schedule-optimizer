import { Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module';
import { ScheduleModule } from '../schedule/schedule.module';
import { UserModule } from '../user/user.module';
import { OptimizerService } from './optimizer.service';

@Module({
  imports: [ScheduleModule, ActivityModule, UserModule],
  providers: [OptimizerService],
  exports: [OptimizerService],
})
export class OptimizerModule {}
