import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { VariedadesService } from './variedad.service';
import { CreateVariedadDto } from './dto/create-variedad.dto';
import { UpdateVariedadDto } from './dto/update-variedad.dto';
import { AuthenticationGuard } from '../common/guards/authentication.guard';
import { AuthorizationGuard } from '../common/guards/authorization.guard';
import { Permisos } from '../permisos/decorators/permisos.decorator';

@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Controller('variedades')
export class VariedadesController {
  constructor(private readonly variedadesService: VariedadesService) {}

  @Permisos({
    recurso: 'cultivos',
    acciones: ['crear'],
    moduloNombre: 'Cultivos',
  })
  @Post()
  create(@Body() dto: CreateVariedadDto) {
    return this.variedadesService.create(dto);
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['leer'],
    moduloNombre: 'Cultivos',
  })
  @Get()
  findAll() {
    return this.variedadesService.findAll();
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['leer'],
    moduloNombre: 'Cultivos',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.variedadesService.findOne(id);
  }
  @Permisos({
    recurso: 'cultivos',
    acciones: ['leer'],
    moduloNombre: 'Cultivos',
  })
  @Get(':id/check-associated')
  checkAssociated(@Param('id') id: string) {
    return this.variedadesService.checkAssociatedRecords(id);
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['actualizar'],
    moduloNombre: 'Cultivos',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVariedadDto) {
    return this.variedadesService.update(id, dto);
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['eliminar'],
    moduloNombre: 'Cultivos',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.variedadesService.remove(id);
  }
}
