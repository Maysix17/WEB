import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CultivosXVariedadService } from './cultivos_x_variedad.service';
import { CreateCultivosXVariedadDto } from './dto/create-cultivos_x_variedad.dto';
import { UpdateCultivosXVariedadDto } from './dto/update-cultivos_x_variedad.dto';
import { AuthenticationGuard } from '../common/guards/authentication.guard';
import { AuthorizationGuard } from '../common/guards/authorization.guard';
import { Permisos } from '../permisos/decorators/permisos.decorator';

@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Controller('cultivos-x-variedad')
export class CultivosXVariedadController {
  constructor(
    private readonly cultivosXVariedadService: CultivosXVariedadService,
  ) {}

  @Permisos({
    recurso: 'cultivos',
    acciones: ['crear'],
    moduloNombre: 'Cultivos',
  })
  @Post()
  create(@Body() createCultivosXVariedadDto: CreateCultivosXVariedadDto) {
    return this.cultivosXVariedadService.create(createCultivosXVariedadDto);
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['leer'],
    moduloNombre: 'Cultivos',
  })
  @Get()
  findAll() {
    return this.cultivosXVariedadService.findAll();
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['leer'],
    moduloNombre: 'Cultivos',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cultivosXVariedadService.findOne(+id);
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['actualizar'],
    moduloNombre: 'Cultivos',
  })
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

  @Permisos({
    recurso: 'cultivos',
    acciones: ['eliminar'],
    moduloNombre: 'Cultivos',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cultivosXVariedadService.remove(+id);
  }
}
