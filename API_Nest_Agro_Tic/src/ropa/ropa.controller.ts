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
import { RopaService } from './ropa.service';
import { CreateRopaDto } from './dto/create-ropa.dto';
import { UpdateRopaDto } from './dto/update-ropa.dto';
import { AuthenticationGuard } from '../common/guards/authentication.guard';
import { AuthorizationGuard } from '../common/guards/authorization.guard';
import { Permisos } from '../permisos/decorators/permisos.decorator';

@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Controller('ropa')
export class RopaController {
  constructor(private readonly ropaService: RopaService) {}

  @Permisos({
    recurso: 'ropa',
    acciones: ['crear'],
    moduloNombre: 'Ropa',
  })
  @Post()
  async create(@Body() createRopaDto: CreateRopaDto) {
    return await this.ropaService.create(createRopaDto);
  }

  @Permisos({
    recurso: 'ropa',
    acciones: ['leer'],
    moduloNombre: 'Ropa',
  })
  @Get()
  async findAll() {
    return await this.ropaService.findAll();
  }

  @Permisos({
    recurso: 'ropa',
    acciones: ['leer'],
    moduloNombre: 'Ropa',
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.ropaService.findOne(id);
  }

  @Permisos({
    recurso: 'ropa',
    acciones: ['actualizar'],
    moduloNombre: 'Ropa',
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRopaDto: UpdateRopaDto,
  ) {
    return await this.ropaService.update(id, updateRopaDto);
  }

  @Permisos({
    recurso: 'ropa',
    acciones: ['eliminar'],
    moduloNombre: 'Ropa',
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.ropaService.remove(id);
  }
}