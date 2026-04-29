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
    console.log('Current time (local):', now.toLocaleString());
    console.log('Current time (UTC):', now.toISOString());

    // Fetch all APPROVED agreements with a blockchain address (include publisher private key for gas)
    const agreements = await this.DB.agreement.findMany({
      where: {
        status: 'APPROVED',
        blockchainAddress: { not: null },
      },
      include: {
        publisher: {
          select: { privateKey: true },
        },
      },
    });

    // Debug: log how dates are being interpreted
    for (const a of agreements) {
      const endDate = new Date(a.endDate);
      console.log(`Agreement ${a.id}: endDate(DB)=${a.endDate}, endDate(JS)=${endDate.toISOString()}, endDate(Local)=${endDate.toLocaleString()}, now=${now.toISOString()}`);
    }

    // Compare using local time strings to avoid UTC/local mismatch
    const expiredAgreements = agreements.filter((a) => {
      const endDate = new Date(a.endDate);
      // Treat the DB date as local time by parsing its local components
      const endDateLocal = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
        endDate.getHours(),
        endDate.getMinutes(),
        endDate.getSeconds(),
      );
      return endDateLocal <= now;
    });

    console.log(`Found ${expiredAgreements.length} expired agreements (out of ${agreements.length} total APPROVED)`);

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
