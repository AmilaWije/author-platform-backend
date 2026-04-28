import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { UpdateAgreementDto } from './dto/update-agreement.dto';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { Agreement } from './entities/agreement.entity';
import { generateAgreementPDF } from 'utils/pdf-generator';
import { deployContract, payAgreement } from 'blockchain/blockchain.service';
import { ethers } from 'ethers';

@Injectable()
export class AgreementService {
  constructor(private readonly DB: PrismaService) {}

  async create(dto: CreateAgreementDto) {
    try {
      const agreement = await this.DB.agreement.create({
        data: {
          title: dto.title,
          description: dto.description,
          authorId: dto.authorId,
          publisherId: dto.publisherId,
          bookId: dto.bookId,
          documentId: dto.documentId,
          contractData: dto.contractData,
          blockchainAddress: dto.blockchainAddress,
          amount: dto.amount,
          endDate: dto.endDate,
          status: 'PENDING',
        },
      });

      const book = await this.DB.book.findUnique({
        where: { id: dto.bookId },
        include: {
          user: true, // author information
        },
      });

      const publisher = await this.DB.user.findUnique({
        where: { id: dto.publisherId },
      });

      console.log('publisher object', publisher);
      console.log(`Agreement Service pasing data ${agreement}`);

      // Generate PDF
      const pdfPath = generateAgreementPDF({
        agreement,
        book,
        publisher,
      });

      //Save PDF path
      await this.DB.agreement.update({
        where: { id: agreement.id },
        data: { pdfPath },
      });

      // create signatures
      await this.DB.signature.createMany({
        data: [
          { agreementId: agreement.id, userId: dto.authorId },
          { agreementId: agreement.id, userId: dto.publisherId },
        ],
      });

      // blockchain part starting
      //Author data
      const authorWallet = (await this.DB.user.findUnique({
        where: { id: book?.userId },
        select: { walletId: true},
      }))!.walletId;
      const authorPriKey = (await this.DB.user.findUnique({
        where: { id: book?.userId },
        select: { privateKey: true },
      }))!.privateKey;
      //publisher data
      const publisherWallet = (await this.DB.user.findUnique({
        where: { id: dto.publisherId },
        select: { walletId: true },
      }))!.walletId;
      const publisherPriKey = (await this.DB.user.findUnique({
        where: { id: dto.publisherId },
        select: { privateKey: true },
      }))!.privateKey;
      // deploy contract using web3 or ethers
      // Use minimum duration of 1 second for expired dates (Ganache testing)
      // The scheduler will advance Ganache's clock via evm_increaseTime
      const durationSeconds = Math.floor(
        (new Date(dto.endDate).getTime() - Date.now()) / 1000,
      );
      const duration = BigInt(Math.max(durationSeconds, 1));
      // const duration = Math.floor((new Date(dto.endDate).getTime() - Date.now()) / 1000).toString;
      const amount = ethers.parseEther(agreement.amount.toString());
      const contractAddress = await deployContract(
        authorWallet,
        String(authorPriKey),
        publisherWallet,
        String(publisherPriKey),
        String(duration),
        amount,
        70, // author gets 70%, publisher gets 30%
      );
      // update agreement after deploying contract on the chain
      await this.DB.agreement.update({
        where: { id: agreement.id },
        data: {
          blockchainAddress: String(contractAddress),
          status: 'APPROVED',
        },
      });

      return {
        success: true,
        message: 'Agreement created with PDF',
        data: agreement,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      throw new BadRequestException(message);
    }
  }

  async payAgreement(agreementId: number, buyerPrivateKey: string) {
    const privateKey = buyerPrivateKey?.trim().replace(/['"]/g, '');

    if (
      !privateKey ||
      !privateKey.startsWith('0x') ||
      privateKey.length !== 66
    ) {
      throw new BadRequestException('Invalid private key format');
    }

    const agreement = await this.DB.agreement.findUnique({
      where: { id: Number(agreementId) },
    });

    if (!agreement?.blockchainAddress) {
      throw new BadRequestException('Contract not found');
    }

    

    const txHash = await payAgreement(
      agreement.blockchainAddress,
      privateKey,
      agreement.amount.toString(),
    );

    await this.DB.agreement.update({
      where: { id: Number(agreementId) },
      data: { status: 'APPROVED' },
    });

    return {
      message: 'Payment successful',
      txHash,
    };
  }

  findAll() {
    return `This action returns all agreement`;
  }

  findOne(id: number) {
    return `This action returns a #${id} agreement`;
  }

  update(id: number, updateAgreementDto: UpdateAgreementDto) {
    return `This action updates a #${id} agreement`;
  }

  remove(id: number) {
    return `This action removes a #${id} agreement`;
  }
}
