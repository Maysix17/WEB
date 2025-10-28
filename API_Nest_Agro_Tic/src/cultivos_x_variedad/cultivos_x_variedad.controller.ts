import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CultivosXVariedadService } from './cultivos_x_variedad.service';
import { CreateCultivosXVariedadDto } from './dto/create-cultivos_x_variedad.dto';
import { UpdateCultivosXVariedadDto } from './dto/update-cultivos_x_variedad.dto';

@Controller('cultivos-x-variedad')
export class CultivosXVariedadController {
  constructor(
    private readonly cultivosXVariedadService: CultivosXVariedadService,
  ) {}

  @Post()
  create(@Body() createCultivosXVariedadDto: CreateCultivosXVariedadDto) {
    return this.cultivosXVariedadService.create(createCultivosXVariedadDto);
  }

  @Get()
  findAll() {
    return this.cultivosXVariedadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cultivosXVariedadService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCultivosXVariedadDto: UpdateCultivosXVariedadDto,
  ) {
    return this.cultivosXVariedadService.update(
      +id,
      updateCultivosXVariedadDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cultivosXVariedadService.remove(+id);
  }
}
