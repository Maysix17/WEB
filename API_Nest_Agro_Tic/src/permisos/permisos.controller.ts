import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { Permiso } from './entities/permiso.entity';
import { AuthenticationGuard } from '../common/guards/authentication.guard';
import { AuthorizationGuard } from '../common/guards/authorization.guard';
import { Permisos } from './decorators/permisos.decorator';

@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Controller('permisos')
export class PermisosController {
  constructor(private readonly permisosService: PermisosService) {}

  /* {
  "recurso": "productos",
  "acciones": ["leer", "crear", "actualizar", "eliminar"]
}*/
  @Post('sincronizar')
  create(@Body(new ValidationPipe()) createPermisoDto: CreatePermisoDto) {
    return this.permisosService.sincronizarPermisos(createPermisoDto);
  }
}
