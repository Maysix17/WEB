import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UnidadesMedidaService } from './unidades_medida.service';
import { CreateUnidadesMedidaDto } from './dto/create-unidades_medida.dto';
import { UpdateUnidadesMedidaDto } from './dto/update-unidades_medida.dto';

@Controller('unidades-medida')
export class UnidadesMedidaController {
  constructor(private readonly unidadesMedidaService: UnidadesMedidaService) {}

  @Post()
  create(@Body() createUnidadesMedidaDto: CreateUnidadesMedidaDto) {
    return this.unidadesMedidaService.create(createUnidadesMedidaDto);
  }

  @Get()
  findAll() {
    return this.unidadesMedidaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unidadesMedidaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUnidadesMedidaDto: UpdateUnidadesMedidaDto,
  ) {
    return this.unidadesMedidaService.update(id, updateUnidadesMedidaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.unidadesMedidaService.remove(id);
  }
}
