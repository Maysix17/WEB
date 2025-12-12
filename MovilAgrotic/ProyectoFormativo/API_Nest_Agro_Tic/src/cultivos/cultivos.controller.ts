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
  UseGuards,
} from '@nestjs/common';
import { CultivosService } from './cultivos.service';
import { CreateCultivoDto } from './dto/create-cultivo.dto';
import { UpdateCultivoDto } from './dto/update-cultivo.dto';
import { SearchCultivoDto } from './dto/search-cultivo.dto';
import { AuthenticationGuard } from '../common/guards/authentication.guard';
import { AuthorizationGuard } from '../common/guards/authorization.guard';
import { Permisos } from '../permisos/decorators/permisos.decorator';

@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Controller('cultivos')
export class CultivosController {
  constructor(private readonly cultivosService: CultivosService) {}

  @Permisos({
    recurso: 'cultivos',
    acciones: ['crear'],
    moduloNombre: 'Cultivos',
  })
  @Post()
  create(@Body() dto: CreateCultivoDto) {
    return this.cultivosService.create(dto);
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['leer'],
    moduloNombre: 'Cultivos',
  })
  @Get()
  findAll() {
    return this.cultivosService.findAll();
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['leer'],
    moduloNombre: 'Cultivos',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cultivosService.findOne(id);
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['actualizar'],
    moduloNombre: 'Cultivos',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCultivoDto) {
    return this.cultivosService.update(id, dto);
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['eliminar'],
    moduloNombre: 'Cultivos',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cultivosService.remove(id);
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['leer'],
    moduloNombre: 'Cultivos',
  })
  @Post('search')
  @HttpCode(HttpStatus.OK)
  search(@Body() dto: SearchCultivoDto) {
    return this.cultivosService.search(dto);
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['actualizar'],
    moduloNombre: 'Cultivos',
  })
  @Patch(':id/finalize')
  finalize(@Param('id') id: string) {
    return this.cultivosService.finalize(id);
  }
}
