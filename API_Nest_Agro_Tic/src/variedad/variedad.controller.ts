import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { VariedadesService } from './variedad.service';
import { CreateVariedadDto } from './dto/create-variedad.dto';
import { UpdateVariedadDto } from './dto/update-variedad.dto';

@Controller('variedades')
export class VariedadesController {
  constructor(private readonly variedadesService: VariedadesService) {}

  @Post()
  create(@Body() dto: CreateVariedadDto) {
    return this.variedadesService.create(dto);
  }

  @Get()
  findAll() {
    return this.variedadesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.variedadesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVariedadDto) {
    return this.variedadesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.variedadesService.remove(id);
  }
}
