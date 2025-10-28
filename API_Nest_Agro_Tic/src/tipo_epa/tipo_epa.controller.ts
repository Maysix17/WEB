import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TipoEpaService } from './tipo_epa.service';
import { CreateTipoEpaDto } from './dto/create-tipo_epa.dto';
import { UpdateTipoEpaDto } from './dto/update-tipo_epa.dto';

@Controller('tipo-epa')
export class TipoEpaController {
  constructor(private readonly tipoEpaService: TipoEpaService) {}

  @Post()
  create(@Body() createTipoEpaDto: CreateTipoEpaDto) {
    return this.tipoEpaService.create(createTipoEpaDto);
  }

  @Get()
  findAll() {
    return this.tipoEpaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tipoEpaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTipoEpaDto: UpdateTipoEpaDto) {
    return this.tipoEpaService.update(+id, updateTipoEpaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tipoEpaService.remove(+id);
  }
}
