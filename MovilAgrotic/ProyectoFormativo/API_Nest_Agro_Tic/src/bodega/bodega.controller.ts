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
import { BodegaService } from './bodega.service';
import { CreateBodegaDto } from './dto/create-bodega.dto';
import { UpdateBodegaDto } from './dto/update-bodega.dto';
import { AuthenticationGuard } from '../common/guards/authentication.guard';
import { AuthorizationGuard } from '../common/guards/authorization.guard';
import { Permisos } from '../permisos/decorators/permisos.decorator';

@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Controller('bodega')
export class BodegaController {
  constructor(private readonly bodegaService: BodegaService) {}

  @Permisos({
    recurso: 'inventario',
    acciones: ['crear'],
    moduloNombre: 'Inventario',
  })
  @Post()
  create(@Body() createBodegaDto: CreateBodegaDto) {
    return this.bodegaService.create(createBodegaDto);
  }

  @Permisos({
    recurso: 'inventario',
    acciones: ['leer'],
    moduloNombre: 'Inventario',
  })
  @Get()
  findAll() {
    return this.bodegaService.findAll();
  }

  @Permisos({
    recurso: 'inventario',
    acciones: ['leer'],
    moduloNombre: 'Inventario',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bodegaService.findOne(id);
  }

  @Permisos({
    recurso: 'inventario',
    acciones: ['actualizar'],
    moduloNombre: 'Inventario',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBodegaDto: UpdateBodegaDto) {
    return this.bodegaService.update(id, updateBodegaDto);
  }

  @Permisos({
    recurso: 'inventario',
    acciones: ['eliminar'],
    moduloNombre: 'Inventario',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bodegaService.remove(id);
  }
}
