import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { releaseFunds } from 'blockchain/blockchain.service';
import { provider } from 'blockchain/ethers.providers';

@Injectable()
export class AgreementScheduler {
  constructor(private DB: PrismaService) {}

  // runs every minute
  @Cron('* * * * *')
  async handleExpiredAgreements() {
    console.log('-----Cron is Running-----');
    const block = await provider.getBlock('latest');
    const blockchainTime = Number(block?.timestamp);
    // add 2 minutes (120 seconds)
    const sample = new Date((blockchainTime + 120) * 1000).toISOString();
    console.log(sample);

    const now = new Date();
    const isoDate = new Date(now).toISOString();

    const agreements = await this.DB.agreement.findMany({
      where: {
        status: 'PENDING',
        // endDate: { lte: isoDate }, // ✅ ONLY expired
        blockchainAddress: { not: null },
      },
    });

    // Identify exceeded agreement
    console.log(agreements.length);

    const nowSeconds = Math.floor(Date.now() / 1000);

    for (const agreement of agreements) {
      try {
        const endTimeSeconds = Math.floor(
          new Date(agreement.endDate).getTime() / 1000,
        );

        console.log('now', nowSeconds);
        console.log('DB end', endTimeSeconds);

        // if (nowSeconds < endTimeSeconds) {
        //   console.log('Not expired from agreement scheduler check');
        //   continue;
        // }

        await releaseFunds(agreement.blockchainAddress!);
        console.log({
          id: agreement.id,
          dbEndDate: agreement.endDate,
          dbEndSeconds: Math.floor(
            new Date(agreement.endDate).getTime() / 1000,
          ),
          nowSeconds,
        });

        await this.DB.agreement.update({
          where: { id: agreement.id },
          data: { status: 'COMPLETED' },
        });
      } catch (e) {
        console.error('Release failed:', e);
      }
    }

    // for (const agreement of agreements) {
    //   try {
    //     console.log('Now:', isoDate);
    //     console.log('EndDate:', agreement.endDate);
    //     await releaseFunds(agreement.blockchainAddress!);

    //     await this.DB.agreement.update({
    //       where: { id: agreement.id },
    //       data: { status: 'COMPLETED' },
    //     });
    //   } catch (e) {
    //     console.error('Release failed:', e);
    //   }
    // }
  }
}
