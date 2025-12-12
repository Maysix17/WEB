import { Controller, Get, Param } from '@nestjs/common';
import { FinanzasService } from './finanzas.service';
import { FinanzasDataDto } from './dto/finanzas-data.dto';
import { Permisos } from '../permisos/decorators/permisos.decorator';

@Controller('finanzas')
export class FinanzasController {
  constructor(private readonly finanzasService: FinanzasService) {}

    @Permisos({
    recurso: 'cultivos',
    acciones: ['crear'],
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
    acciones: ['crear'],
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
    acciones: ['crear'],
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
    acciones: ['crear'],
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
    acciones: ['crear'],
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
