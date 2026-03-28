import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
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


  @Get()
  findAll() {
    return this.agreementService.findAll();
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
