import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoFenologico } from './entities/estado_fenologico.entity';
import { CultivosVariedadXZona } from '../cultivos_variedad_x_zona/entities/cultivos_variedad_x_zona.entity';

@Injectable()
export class EstadosFenologicosService {
  constructor(
    @InjectRepository(EstadoFenologico)
    private readonly estadoRepository: Repository<EstadoFenologico>,
    @InjectRepository(CultivosVariedadXZona)
    private readonly cultivosVariedadXZonaRepository: Repository<CultivosVariedadXZona>,
  ) {}

  async create(createEstadoDto: {
    nombre: string;
    descripcion?: string;
    orden: number;
  }): Promise<EstadoFenologico> {
    const estado = this.estadoRepository.create(createEstadoDto);
    return await this.estadoRepository.save(estado);
  }

  async findAll(): Promise<EstadoFenologico[]> {
    return await this.estadoRepository.find({
      order: { orden: 'ASC' },
    });
  }

  async findOne(id: number): Promise<EstadoFenologico> {
    const estado = await this.estadoRepository.findOne({ where: { id } });
    if (!estado) {
      throw new NotFoundException(
        `Estado fenológico con id ${id} no encontrado`,
      );
    }
    return estado;
  }

  async update(
    id: number,
    updateEstadoDto: Partial<{
      nombre: string;
      descripcion?: string;
      orden: number;
    }>,
  ): Promise<EstadoFenologico> {
    const estado = await this.findOne(id);
    Object.assign(estado, updateEstadoDto);
    return await this.estadoRepository.save(estado);
  }

  async remove(id: number): Promise<void> {
    const estado = await this.findOne(id);
    
    // Verificar si hay cultivos-variedad-zona asociados a este estado fenológico
    const cultivosAsociados = await this.cultivosVariedadXZonaRepository.count({
      where: { fkEstadoFenologicoId: id }
    });

    if (cultivosAsociados > 0) {
      // Obtener algunos registros para mostrar información en el mensaje
      const registros = await this.cultivosVariedadXZonaRepository
        .createQueryBuilder('cvz')
        .leftJoinAndSelect('cvz.cultivoXVariedad', 'cxv')
        .leftJoinAndSelect('cvz.zona', 'zona')
        .where('cvz.fkEstadoFenologicoId = :id', { id })
        .limit(3) // Limitar a 3 registros para el mensaje
        .getMany();

      let infoRegistros = '';
      if (registros.length > 0) {
        const detalles = registros.map(r => {
          const nombreZona = r.zona?.nombre || 'Zona sin nombre';
          return `Cultivo en ${nombreZona}`;
        }).join(', ');
        
        infoRegistros = cultivosAsociados > 3
          ? ` (ejemplos: ${detalles} y ${cultivosAsociados - 3} registros más)`
          : ` (ejemplos: ${detalles})`;
      }

      throw new BadRequestException(
        `No se puede eliminar el estado fenológico "${estado.nombre}" porque tiene ${cultivosAsociados} registro(s) de cultivos asociados${infoRegistros}. ` +
        `Para eliminar este estado fenológico, primero debe cambiar el estado de los cultivos asociados a otro estado fenológico. ` +
        `Le sugerimos revisar la sección de cultivos para gestionar estos cambios de estado.`
      );
    }

    await this.estadoRepository.remove(estado);
  }
}
