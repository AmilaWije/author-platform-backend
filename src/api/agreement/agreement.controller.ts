import { Controller, Get, Post, Body, Patch, Param, Delete, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { AgreementService } from './agreement.service';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { UpdateAgreementDto } from './dto/update-agreement.dto';

@Controller('agreement')
export class AgreementController {
  constructor(private readonly agreementService: AgreementService) {}

  @Post('create')
  create(@Body() createAgreementDto: CreateAgreementDto) {
    return this.agreementService.create(createAgreementDto);
  }

  @Post(':id/pay')
  pay(
    @Param('id') id: number,
    @Body('privateKey') privateKey: string
  ) {
    return this.agreementService.payAgreement(id, privateKey);
  }

  @Post(':id/sell')
  sell(
    @Param('id') id: number,
    @Body('discountPrice') discountPrice: number,
  ) {
    return this.agreementService.sellAgreement(id, discountPrice);
  }

  @Post(':id/buy')
  buy(
    @Param('id') id: number,
    @Body('buyerId') buyerId: number,
  ) {
    return this.agreementService.buyAgreement(id, buyerId);
  }

  @Get('available')
  findAvailable() {
    return this.agreementService.findAvailable();
  }

  @Get()
  findAll() {
    return this.agreementService.findAll();
  }

  @Get(':id/pdf')
  async servePdf(@Param('id') id: string, @Res() res: Response) {
    const pdfPath = await this.agreementService.getAgreementPdf(+id);
    if (!pdfPath) throw new NotFoundException('PDF not found for this agreement');
    res.sendFile(pdfPath);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agreementService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAgreementDto: UpdateAgreementDto) {
    return this.agreementService.update(+id, updateAgreementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agreementService.remove(+id);
  }
}
