import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { releaseFunds } from 'blockchain/blockchain.service';

@Injectable()
export class AgreementScheduler {
  constructor(private DB: PrismaService) {}

  @Cron('* * * * *')
  async handleExpiredAgreements() {
    console.log('-----Cron is Running-----');

    const now = new Date();

    // Fetch APPROVED and SOLD agreements with a blockchain address
    const agreements = await this.DB.agreement.findMany({
      where: {
        status: { in: ['APPROVED', 'SOLD'] },
        blockchainAddress: { not: null },
      },
      include: {
        publisher: {
          select: { privateKey: true },
        },
      },
    });

    const expiredAgreements = agreements.filter((a) => new Date(a.endDate) <= now);

    console.log(`Found ${expiredAgreements.length} expired agreements (out of ${agreements.length} total)`);

    for (const agreement of expiredAgreements) {
      try {
        await releaseFunds(agreement.blockchainAddress!, agreement.publisher.privateKey ?? undefined);

        await this.DB.agreement.update({
          where: { id: agreement.id },
          data: { status: 'COMPLETED' },
        });

        console.log(`Agreement ${agreement.id} completed and funds released`);
      } catch (e) {
        console.error(`Release failed for agreement ${agreement.id}:`, e);
      }
    }
  }
}
