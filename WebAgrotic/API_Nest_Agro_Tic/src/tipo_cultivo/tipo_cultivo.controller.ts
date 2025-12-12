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
import { TipoCultivoService } from './tipo_cultivo.service';
import { CreateTipoCultivoDto } from './dto/create-tipo_cultivo.dto';
import { UpdateTipoCultivoDto } from './dto/update-tipo_cultivo.dto';
import { AuthenticationGuard } from '../common/guards/authentication.guard';
import { AuthorizationGuard } from '../common/guards/authorization.guard';
import { Permisos } from '../permisos/decorators/permisos.decorator';

@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Controller('tipo-cultivos')
export class TipoCultivoController {
  constructor(private readonly tipoCultivoService: TipoCultivoService) {}

  // CREATE
  @Permisos({
    recurso: 'cultivos',
    acciones: ['crear'],
    moduloNombre: 'Cultivos',
  })
  @Post()
  async create(@Body() createTipoCultivoDto: CreateTipoCultivoDto) {
    return await this.tipoCultivoService.create(createTipoCultivoDto);
  }

  // READ ALL
  @Permisos({
    recurso: 'cultivos',
    acciones: ['leer'],
    moduloNombre: 'Cultivos',
  })
  @Get()
  async findAll() {
    return await this.tipoCultivoService.findAll();
  }

  // READ ONE
  @Permisos({
    recurso: 'cultivos',
    acciones: ['leer'],
    moduloNombre: 'Cultivos',
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.tipoCultivoService.findOne(id);
  }

  // UPDATE
  @Permisos({
    recurso: 'cultivos',
    acciones: ['actualizar'],
    moduloNombre: 'Cultivos',
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTipoCultivoDto: UpdateTipoCultivoDto,
  ) {
    return await this.tipoCultivoService.update(id, updateTipoCultivoDto);
  }

  // DELETE
  @Permisos({
    recurso: 'cultivos',
    acciones: ['eliminar'],
    moduloNombre: 'Cultivos',
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.tipoCultivoService.remove(id);
  }
}
