import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsuariosXActividadesService } from './usuarios_x_actividades.service';
import { CreateUsuariosXActividadeDto } from './dto/create-usuarios_x_actividade.dto';
import { UpdateUsuariosXActividadeDto } from './dto/update-usuarios_x_actividade.dto';

@Controller('usuarios-x-actividades')
export class UsuariosXActividadesController {
  constructor(
    private readonly usuariosXActividadesService: UsuariosXActividadesService,
  ) {}

  @Post()
  create(@Body() createUsuariosXActividadeDto: CreateUsuariosXActividadeDto) {
    return this.usuariosXActividadesService.create(
      createUsuariosXActividadeDto,
    );
  }

  @Get()
  findAll() {
    return this.usuariosXActividadesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosXActividadesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUsuariosXActividadeDto: UpdateUsuariosXActividadeDto,
  ) {
    return this.usuariosXActividadesService.update(
      id,
      updateUsuariosXActividadeDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosXActividadesService.remove(id);
  }
}
