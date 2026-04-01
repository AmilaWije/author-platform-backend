import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { UpdateAgreementDto } from './dto/update-agreement.dto';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { Agreement } from './entities/agreement.entity';
import { generateAgreementPDF } from 'utils/pdf-generator';
import { deployContract } from 'blockchain/blockchain.service';

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
      const authorWallet = (await this.DB.user.findUnique({
        where: { id: book?.userId },
        select: { walletId: true },
      }))!.walletId;
      const publisherWallet = (await this.DB.user.findUnique({
        where: { id: dto.publisherId },
        select: { walletId: true },
      }))!.walletId;
      // deploy contract using web3 or ethers
      const duration = BigInt(
        Math.floor((new Date(dto.endDate).getTime() - Date.now()) / 1000),
      );
      const contractAddress = await deployContract(
        authorWallet, // address
        publisherWallet, // address
        duration,
      );
      // update agreement after excuting agreement in the chain
      await this.DB.agreement.update({
        where: { id: agreement.id },
        data: {
          blockchainAddress: String(contractAddress),
        },
      });

      return {
        success: true,
        message: 'Agreement created with PDF',
        data: agreement,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
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
