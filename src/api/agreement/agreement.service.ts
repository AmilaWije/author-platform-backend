import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { UpdateAgreementDto } from './dto/update-agreement.dto';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { Agreement } from './entities/agreement.entity';
import { generateAgreementPDF } from 'utils/pdf-generator';

@Injectable()
export class AgreementService {
  constructor(private readonly DB: PrismaService) {}

  async create(dto: CreateAgreementDto) {
    console.log(dto);

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
          status: 'PENDING',
        },
      });

      // Generate PDF
      const pdfPath = generateAgreementPDF(agreement);
      //Save PDF path
      await this.DB.agreement.update({
        where: { id: agreement.id },
        data: { pdfPath }
      });

      // create signatures
      await this.DB.signature.createMany({
        data: [
          { agreementId: agreement.id, userId: dto.authorId },
          { agreementId: agreement.id, userId: dto.publisherId },
        ],
      });

      return {
        success: true,
        message: 'Agreement created with PDF',
        data: agreement,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }

    // try {
    //   const agreement = await this.DB.agreement.create({
    //     data: {
    //       title: dto.title,
    //       description: dto.description,
    //       publisherId: dto.publisherId,
    //       authorId: dto.authorId,
    //       bookId: dto.bookId,
    //       documentId: dto.documentId,
    //       contractData: dto.contractData,
    //       status: 'PENDING',
    //     },
    //   });
    //   return {
    //     success: true,
    //     message: 'Book successfully created',
    //     data: agreement,
    //   };
    // } catch (e) {
    //   throw new BadRequestException(e);
    // }

    // await this.DB.signature.createMany({
    //   data: [
    //     { agreementId: Agreement., userId: dto.authorId },
    //     { agreementId: agreement.id, userId: dto.publisherId },
    //   ],
    // });
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
