import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FinanzasService } from './finanzas.service';
import { FinanzasDataDto } from './dto/finanzas-data.dto';
import { AuthorizationGuard } from '../common/guards/authorization.guard';
import { AuthenticationGuard } from '../common/guards/authentication.guard';      
import { Permisos } from '../permisos/decorators/permisos.decorator';

@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Controller('finanzas')
export class FinanzasController {
  constructor(private readonly finanzasService: FinanzasService) {}

  @Permisos({
    recurso: 'cultivos',
    acciones: ['leer'],
    moduloNombre: 'Cultivos',
  })

  @Get('cosecha/:cosechaId')
  async obtenerFinanzasCosecha(
    @Param('cosechaId') cosechaId: string,
  ): Promise<FinanzasDataDto | null> {
    return await this.finanzasService.obtenerFinanzasCosecha(cosechaId);
  }
  @Permisos({
    recurso: 'cultivos',
    acciones: ['leer'],
    moduloNombre: 'Cultivos',
  })

  @Get('cosecha/:cosechaId/calcular')
  async calcularFinanzasCosecha(
    @Param('cosechaId') cosechaId: string,
  ): Promise<FinanzasDataDto> {
    return await this.finanzasService.calcularFinanzasCosecha(cosechaId);
  }
 @Permisos({
    recurso: 'cultivos',
    acciones: ['leer'],
    moduloNombre: 'Cultivos',
  })
  @Get('cultivo/:cultivoId')
  async obtenerFinanzasCultivo(
    @Param('cultivoId') cultivoId: string,
  ): Promise<FinanzasDataDto[]> {
    return await this.finanzasService.obtenerFinanzasCultivo(cultivoId);
  }
 @Permisos({
    recurso: 'cultivos',
    acciones: ['leer'],
    moduloNombre: 'Cultivos',
  })
  @Get('cultivo/:cultivoId/dinamico')
  async calcularFinanzasCultivoDinamico(
    @Param('cultivoId') cultivoId: string,
  ): Promise<FinanzasDataDto> {
    return await this.finanzasService.calcularFinanzasCultivoDinamico(
      cultivoId,
    );
  }
 @Permisos({
    recurso: 'cultivos',
    acciones: ['leer'],
    moduloNombre: 'Cultivos',
  })
  @Get('cultivo/:cultivoId/actividades')
  async calcularFinanzasCultivoActividades(
    @Param('cultivoId') cultivoId: string,
  ): Promise<FinanzasDataDto> {
    return await this.finanzasService.calcularFinanzasCultivoActividades(
      cultivoId,
    );
  }
}
