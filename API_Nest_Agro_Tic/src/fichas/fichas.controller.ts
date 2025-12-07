import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FichasService } from './fichas.service';
import { CreateFichaDto } from './dto/create-ficha.dto';
import { UpdateFichaDto } from './dto/update-ficha.dto';
import { AuthenticationGuard } from '../common/guards/authentication.guard';
import { AuthorizationGuard } from '../common/guards/authorization.guard';
import { Permisos } from '../permisos/decorators/permisos.decorator';

@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Controller('fichas')
export class FichasController {
  constructor(private readonly fichasService: FichasService) {}

  @Permisos({   moduloNombre: 'Usuarios', recurso: 'panel de control', acciones: ['ver'] })
  @Post()
  create(@Body() createFichaDto: CreateFichaDto) {
    return this.fichasService.create(createFichaDto);
  }

  @Permisos({  moduloNombre: 'Usuarios', recurso: 'panel de control', acciones: ['ver'] })
  @Get()
  findAll() {
    return this.fichasService.findAll();
  }

  @Permisos({   moduloNombre: 'Usuarios', recurso: 'panel de control', acciones: ['ver'] })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fichasService.findOne(id);
  }

  @Permisos({  moduloNombre: 'Usuarios', recurso: 'panel de control', acciones: ['ver'] })
  @Put(':id')
  update(@Param('id') id: string, @Body() updateFichaDto: UpdateFichaDto) {
    return this.fichasService.update(id, updateFichaDto);
  }

  @Permisos({ moduloNombre: 'Usuarios', recurso: 'panel de control', acciones: ['ver'] })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fichasService.remove(id);
  }
}
