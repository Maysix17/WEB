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
import { CosechasService } from './cosechas.service';
import { CreateCosechaDto } from './dto/create-cosecha.dto';
import { UpdateCosechaDto } from './dto/update-cosecha.dto';
import { AuthenticationGuard } from '../common/guards/authentication.guard';
import { AuthorizationGuard } from '../common/guards/authorization.guard';
import { Permisos } from '../permisos/decorators/permisos.decorator';

@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Controller('cosechas')
export class CosechasController {
  constructor(private readonly cosechasService: CosechasService) {}

  @Permisos({
    recurso: 'cultivos',
    acciones: ['crear'],
    moduloNombre: 'Cultivos',
  })
  @Post()
  create(@Body() createCosechaDto: CreateCosechaDto) {
    return this.cosechasService.create(createCosechaDto);
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['leer'],
    moduloNombre: 'Cultivos',
  })
  @Get()
  findAll() {
    return this.cosechasService.findAll();
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['leer'],
    moduloNombre: 'Cultivos',
  })
  @Get('today')
  findAllToday() {
    return this.cosechasService.findAllToday();
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['leer'],
    moduloNombre: 'Cultivos',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cosechasService.findOne(id);
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['actualizar'],
    moduloNombre: 'Cultivos',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCosechaDto: UpdateCosechaDto) {
    return this.cosechasService.update(id, updateCosechaDto);
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['eliminar'],
    moduloNombre: 'Cultivos',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cosechasService.remove(id);
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['actualizar'],
    moduloNombre: 'Cultivos',
  })
  @Post(':id/close')
  closeHarvest(@Param('id') id: string) {
    return this.cosechasService.closeHarvest(id);
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['actualizar'],
    moduloNombre: 'Cultivos',
  })
  @Post(':id/close-sales')
  closeHarvestSales(@Param('id') id: string) {
    return this.cosechasService.closeHarvestSales(id);
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['actualizar'],
    moduloNombre: 'Cultivos',
  })
  @Post('cultivo/:cvzId/close-all-sales')
  closeAllHarvestSalesByCultivo(@Param('cvzId') cvzId: string) {
    return this.cosechasService.closeAllHarvestSalesByCultivo(cvzId);
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['leer'],
    moduloNombre: 'Cultivos',
  })
  @Get(':id/disponible')
  getCantidadDisponible(@Param('id') id: string) {
    return this.cosechasService.getCantidadDisponible(id);
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['leer'],
    moduloNombre: 'Cultivos',
  })
  @Get('cultivo/:cvzId')
  getCosechasByCultivo(@Param('cvzId') cvzId: string) {
    return this.cosechasService.getCosechasByCultivo(cvzId);
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['leer'],
    moduloNombre: 'Cultivos',
  })
  @Get('cultivo/:cvzId/abiertas')
  getCosechasAbiertasByCultivo(@Param('cvzId') cvzId: string) {
    return this.cosechasService.getCosechasAbiertasByCultivo(cvzId);
  }

  @Permisos({
    recurso: 'cultivos',
    acciones: ['actualizar'],
    moduloNombre: 'Cultivos',
  })
  @Post('cultivo/:cvzId/close-all')
  closeAllHarvestsByCultivo(@Param('cvzId') cvzId: string) {
    return this.cosechasService.closeAllHarvestsByCultivo(cvzId);
  }
}
