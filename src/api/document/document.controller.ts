import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DocumentRequestData } from './dto/document-request.dto';

@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // folder where files will be stored
        filename: (req, file, callback) => {
          const uniqueName =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueName + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          return callback(new Error('Only PDF files are allowed'), false);
        }
        callback(null, true);
      },
    }),
  )

  // upload documents for related books
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentData: CreateDocumentDto,
  ) {
    return this.documentService.create({
      ...createDocumentData,
      file_name: file.originalname,
      file_path: file.path,
    });
  }

  // get user wise and book wise all document
  @Get('get-document')
  findAll(@Body() requestData: DocumentRequestData) {
    return this.documentService.findAll(requestData);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.documentService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
  //   return this.documentService.update(+id, updateDocumentDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.documentService.remove(+id);
  // }
}
