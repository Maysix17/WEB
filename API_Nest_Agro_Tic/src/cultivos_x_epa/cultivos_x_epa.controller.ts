import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CultivosXEpaService } from './cultivos_x_epa.service';
import { CreateCultivosXEpaDto } from './dto/create-cultivos_x_epa.dto';
import { UpdateCultivosXEpaDto } from './dto/update-cultivos_x_epa.dto';

@Controller('cultivos-x-epa')
export class CultivosXEpaController {
  constructor(private readonly cultivosXEpaService: CultivosXEpaService) {}

  @Post()
  create(@Body() createCultivosXEpaDto: CreateCultivosXEpaDto) {
    return this.cultivosXEpaService.create(createCultivosXEpaDto);
  }

  @Get()
  findAll() {
    return this.cultivosXEpaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cultivosXEpaService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCultivosXEpaDto: UpdateCultivosXEpaDto,
  ) {
    return this.cultivosXEpaService.update(+id, updateCultivosXEpaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cultivosXEpaService.remove(+id);
  }
}
