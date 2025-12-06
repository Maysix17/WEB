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
import { AuthenticationGuard } from '../common/guards/authentication.guard';
import { AuthorizationGuard } from '../common/guards/authorization.guard';
import { Permisos } from '../permisos/decorators/permisos.decorator';
import { MovimientosInventarioService } from './movimientos_inventario.service';
import { CreateMovimientosInventarioDto } from './dto/create-movimientos_inventario.dto';
import { UpdateMovimientosInventarioDto } from './dto/update-movimientos_inventario.dto';

@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Controller('movimientos-inventario')
export class MovimientosInventarioController {
  constructor(
    private readonly movimientosInventarioService: MovimientosInventarioService,
  ) {}

  @Permisos({
    recurso: 'inventario',
    acciones: ['crear'],
    moduloNombre: 'Inventario',
  })
  @Post()
  create(
    @Body() createMovimientosInventarioDto: CreateMovimientosInventarioDto,
  ) {
    return this.movimientosInventarioService.create(
      createMovimientosInventarioDto,
    );
  }

  @Permisos({
    recurso: 'inventario',
    acciones: ['leer'],
    moduloNombre: 'Inventario',
  })
  @Get()
  findAll() {
    return this.movimientosInventarioService.findAll();
  }

  @Permisos({
    recurso: 'inventario',
    acciones: ['leer'],
    moduloNombre: 'Inventario',
  })
  @Get('filter')
  filter(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('productQuery') productQuery?: string,
  ) {
    return this.movimientosInventarioService.filter(
      startDate,
      endDate,
      productQuery,
    );
  }

  @Permisos({
    recurso: 'inventario',
    acciones: ['leer'],
    moduloNombre: 'Inventario',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movimientosInventarioService.findOne(id);
  }

  @Permisos({
    recurso: 'inventario',
    acciones: ['actualizar'],
    moduloNombre: 'Inventario',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMovimientosInventarioDto: UpdateMovimientosInventarioDto,
  ) {
    return this.movimientosInventarioService.update(
      id,
      updateMovimientosInventarioDto,
    );
  }

  @Permisos({
    recurso: 'inventario',
    acciones: ['eliminar'],
    moduloNombre: 'Inventario',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.movimientosInventarioService.remove(id);
  }
}
