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
    
    // Verificar si el estado fenológico tiene registros asociados
    const hasAssociatedRecords = await this.checkAssociatedRecords(id);
    if (hasAssociatedRecords) {
      throw new BadRequestException(
        'No se puede eliminar el estado fenológico porque tiene cultivos asociados.'
      );
    }
    
    await this.estadoRepository.remove(estado);
  }

  /**
   * Verifica si un estado fenológico tiene registros asociados (cultivos)
   */
  async checkAssociatedRecords(estadoId: number): Promise<boolean> {
    try {
      // Verificar si hay cultivos que estén en este estado fenológico
      const count = await this.cultivosVariedadXZonaRepository.count({
        where: { fkEstadoFenologicoId: estadoId }
      });
      return count > 0;
    } catch (error) {
      console.error('Error checking associated records for estado fenológico:', estadoId, error);
      // Por seguridad, asumir que hay registros asociados si hay error
      return true;
    }
  }
}
