import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TipoCultivoService } from './tipo_cultivo.service';
import { CreateTipoCultivoDto } from './dto/create-tipo_cultivo.dto';
import { UpdateTipoCultivoDto } from './dto/update-tipo_cultivo.dto';

@Controller('tipo-cultivos')
export class TipoCultivoController {
  constructor(private readonly tipoCultivoService: TipoCultivoService) {}

  // CREATE
  @Post()
  async create(@Body() createTipoCultivoDto: CreateTipoCultivoDto) {
    return await this.tipoCultivoService.create(createTipoCultivoDto);
  }

  // READ ALL
  @Get()
  async findAll() {
    return await this.tipoCultivoService.findAll();
  }

  // READ ONE
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.tipoCultivoService.findOne(id);
  }

  // UPDATE
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTipoCultivoDto: UpdateTipoCultivoDto,
  ) {
    return await this.tipoCultivoService.update(id, updateTipoCultivoDto);
  }

  // DELETE
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.tipoCultivoService.remove(id);
  }
}
