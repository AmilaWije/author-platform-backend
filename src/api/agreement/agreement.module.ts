import { Module } from '@nestjs/common';
import { AgreementService } from './agreement.service';
import { AgreementController } from './agreement.controller';
import { AgreementScheduler } from './agreement-scheduler';

@Module({
  controllers: [AgreementController],
  providers: [AgreementService, AgreementScheduler],
})
export class AgreementModule {}
