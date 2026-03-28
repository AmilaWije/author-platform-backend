import { Module } from '@nestjs/common';
import { AgreementService } from './agreement.service';
import { AgreementController } from './agreement.controller';

@Module({
  controllers: [AgreementController],
  providers: [AgreementService],
})
export class AgreementModule {}
