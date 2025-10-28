import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BodegaService } from './bodega.service';
import { CreateBodegaDto } from './dto/create-bodega.dto';
import { UpdateBodegaDto } from './dto/update-bodega.dto';

@Controller('bodega')
export class BodegaController {
  constructor(private readonly bodegaService: BodegaService) {}

  @Post()
  create(@Body() createBodegaDto: CreateBodegaDto) {
    return this.bodegaService.create(createBodegaDto);
  }

  @Get()
  findAll() {
    return this.bodegaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bodegaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBodegaDto: UpdateBodegaDto) {
    return this.bodegaService.update(id, updateBodegaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bodegaService.remove(id);
  }
}
