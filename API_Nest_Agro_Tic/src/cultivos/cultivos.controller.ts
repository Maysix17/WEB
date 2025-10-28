import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CultivosService } from './cultivos.service';
import { CreateCultivoDto } from './dto/create-cultivo.dto';
import { UpdateCultivoDto } from './dto/update-cultivo.dto';
import { SearchCultivoDto } from './dto/search-cultivo.dto';

@Controller('cultivos')
export class CultivosController {
  constructor(private readonly cultivosService: CultivosService) {}

  @Post()
  create(@Body() dto: CreateCultivoDto) {
    return this.cultivosService.create(dto);
  }

  @Get()
  findAll() {
    return this.cultivosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cultivosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCultivoDto) {
    return this.cultivosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cultivosService.remove(id);
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  search(@Body() dto: SearchCultivoDto) {
    return this.cultivosService.search(dto);
  }

  @Patch(':id/finalize')
  finalize(@Param('id') id: string) {
    return this.cultivosService.finalize(id);
  }
}
