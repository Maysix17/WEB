import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsuariosXActividadesService } from './usuarios_x_actividades.service';
import { CreateUsuariosXActividadeDto } from './dto/create-usuarios_x_actividade.dto';
import { UpdateUsuariosXActividadeDto } from './dto/update-usuarios_x_actividade.dto';
import { AuthenticationGuard } from '../common/guards/authentication.guard';

@Controller('usuarios-x-actividades')
@UseGuards(AuthenticationGuard)
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
  findAll(@Request() req: any) {
    const userId = req.userId;
    return this.usuariosXActividadesService.findByUser(userId);
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
