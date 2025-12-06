import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import { AuthenticationGuard } from '../common/guards/authentication.guard';
import { AuthorizationGuard } from '../common/guards/authorization.guard';
import { Permisos } from '../permisos/decorators/permisos.decorator';
import { ZonasService } from './zonas.service';
import { CreateZonaDto } from './dto/create-zona.dto';
import { UpdateZonaDto } from './dto/update-zona.dto';

@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Controller('zonas')
export class ZonasController {
  constructor(private readonly zonasService: ZonasService) {}

  @Permisos({
    recurso: 'zonas',
    acciones: ['crear'],
    moduloNombre: 'Zonas',
  })
  @Post()
  create(@Body() createZonaDto: CreateZonaDto) {
    return this.zonasService.create(createZonaDto);
  }

  @Permisos({
    recurso: 'zonas',
    acciones: ['leer'],
    moduloNombre: 'Zonas',
  })
  @Get()
  findAll(@Query('nombre') nombre?: string) {
    if (nombre) {
      return this.zonasService.findByNombre(nombre);
    }
    return this.zonasService.findAll();
  }

  @Permisos({
    recurso: 'zonas',
    acciones: ['leer'],
    moduloNombre: 'Zonas',
  })
  @Get('search/:query')
  search(
    @Param('query') query: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.zonasService.search(query, page, limit);
  }

  @Permisos({
    recurso: 'zonas',
    acciones: ['leer'],
    moduloNombre: 'Zonas',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.zonasService.findOne(id);
  }

  @Permisos({
    recurso: 'zonas',
    acciones: ['leer'],
    moduloNombre: 'Zonas',
  })
  @Get(':id/cultivos-variedad-zona')
  getCultivosVariedadXZona(@Param('id') id: string) {
    return this.zonasService.getCultivosVariedadXZona(id);
  }

  @Permisos({
    recurso: 'zonas',
    acciones: ['actualizar'],
    moduloNombre: 'Zonas',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateZonaDto: UpdateZonaDto) {
    return this.zonasService.update(id, updateZonaDto);
  }

  @Permisos({
    recurso: 'zonas',
    acciones: ['eliminar'],
    moduloNombre: 'Zonas',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.zonasService.remove(id);
  }
}
