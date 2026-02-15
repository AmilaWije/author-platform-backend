import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { DocumentRequestData } from './dto/document-request.dto';

@Injectable()
export class DocumentService {
  constructor(private readonly DB: PrismaService) {}

  // upload documents
  async create(createDocumentDto: CreateDocumentDto) {
    console.log(createDocumentDto)
    try {
      const createdDocuemntData = await this.DB.document.create({
        data: {
          file_name: createDocumentDto.file_name,
          file_path: createDocumentDto.file_path,
          book_id: Number(createDocumentDto.book_id)
        }
      });

      return {
        success: true,
        message: 'PDF successfully uploaded',
        data: createdDocuemntData
      }
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async findAll(reqData: DocumentRequestData) {
    try {
      const allDocs = await this.DB.document.findMany({
        where: {
          book: {
            userId: reqData.userId
          },
        },
        include: {
          book: true
        }
      });
      return {
        success: true,
        message: 'Document data feeded successfully',
        data: allDocs
      }
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} document`;
  }

  update(id: number, updateDocumentDto: UpdateDocumentDto) {
    return `This action updates a #${id} document`;
  }

  remove(id: number) {
    return `This action removes a #${id} document`;
  }
}
