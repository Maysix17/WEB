import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization.guard';
import { Permisos } from 'src/permisos/decorators/permisos.decorator';
import { UpdateMeDto } from './dto/update-me.dto';
import { Request } from 'express';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @UseGuards(AuthenticationGuard)
  @Get('me')
  findMe(@Req() req: Request) {
    const userId = req['userId'];
    return this.usuariosService.findMe(userId);
  }

  @UseGuards(AuthenticationGuard)
  @Patch('me')
  updateMe(@Req() req: Request, @Body() updateMeDto: UpdateMeDto) {
    const userId = req['userId'];
    return this.usuariosService.updateMe(userId, updateMeDto);
  }

  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permisos({ moduloNombre: 'Usuarios', recurso: 'panel de control', acciones: ['ver'] },
    {
    recurso: 'actividades',
    acciones: ['crear'],
    moduloNombre: 'Actividades',
  }
  )
  @Post('register')
  create(@Body() createUserDto: CreateUsuarioDto, @Req() req: any) {
    return this.usuariosService.createUserByPanel(createUserDto, req.user);
  }

  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permisos({ moduloNombre: 'Usuarios', recurso: 'panel de control', acciones: ['ver']})
  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permisos({ moduloNombre: 'Usuarios', recurso: 'panel de control', acciones: ['ver']})
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(+id);
  }

  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permisos({moduloNombre: 'Usuarios', recurso: 'panel de control', acciones: ['ver']})
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto, @Req() req: any) {
    const requestingUser = req.user ? { rol: req.user.rol?.nombre } : undefined;
    return this.usuariosService.update(id, updateUsuarioDto, requestingUser);
  }

  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permisos({moduloNombre: 'Usuarios', recurso: 'panel de control', acciones: ['ver'] })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(+id);
  }

  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permisos(
    { moduloNombre: 'Actividades', recurso: 'actividades', acciones: ['leer'] },
    { moduloNombre: 'Usuarios', recurso: 'panel de control', acciones: ['ver']}
  )
  @Get('search/:query')
  search(
    @Param('query') query: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.usuariosService.search(query, page, limit);
  }

  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permisos(
    { moduloNombre: 'Actividades', recurso: 'actividades', acciones: ['leer'] },
    { moduloNombre: 'Cultivos', recurso: 'cultivos', acciones: ['leer'] },
    { moduloNombre: 'Usuarios', recurso: 'panel de control', acciones: ['ver'] }
  )
  @Get('search/dni/:dni')
  findByDni(@Param('dni') dni: string) {
    return this.usuariosService.findByDni(+dni);
  }
}

