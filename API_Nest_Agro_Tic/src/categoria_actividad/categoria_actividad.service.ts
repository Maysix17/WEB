import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CategoriaActividad } from './entities/categoria_actividad.entity';
import { Actividad } from '../actividades/entities/actividades.entity';
import { CreateCategoriaActividadDto } from './dto/create-categoria_actividad.dto';
import { UpdateCategoriaActividadDto } from './dto/update-categoria_actividad.dto';

@Injectable()
export class CategoriaActividadService {
  constructor(
    @InjectRepository(CategoriaActividad)
    private readonly categoriaRepository: Repository<CategoriaActividad>,
    @InjectRepository(Actividad)
    private readonly actividadRepository: Repository<Actividad>,
  ) {}

  async create(
    createCategoriaActividadDto: CreateCategoriaActividadDto,
  ): Promise<CategoriaActividad> {
    const categoria = this.categoriaRepository.create(
      createCategoriaActividadDto,
    );
    return await this.categoriaRepository.save(categoria);
  }

  async findAll(): Promise<CategoriaActividad[]> {
    return await this.categoriaRepository.find();
  }

  async search(query: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await this.categoriaRepository.findAndCount({
      where: {
        nombre: Like(`%${query}%`),
      },
      skip,
      take: limit,
    });
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<CategoriaActividad> {
    const categoria = await this.categoriaRepository.findOne({ where: { id } });
    if (!categoria) {
      throw new NotFoundException(
        `CategoriaActividad con ID ${id} no encontrada`,
      );
    }
    return categoria;
  }

  async update(
    id: string,
    updateCategoriaActividadDto: UpdateCategoriaActividadDto,
  ): Promise<CategoriaActividad> {
    const categoria = await this.findOne(id);
    Object.assign(categoria, updateCategoriaActividadDto);
    return await this.categoriaRepository.save(categoria);
  }

  async remove(id: string): Promise<void> {
    const categoria = await this.findOne(id);
    
    // Verificar si hay actividades asociadas a esta categoría
    const actividadesAsociadas = await this.actividadRepository.count({
      where: { fkCategoriaActividadId: id }
    });

    if (actividadesAsociadas > 0) {
      // Obtener algunas actividades para mostrar en el mensaje
      const actividades = await this.actividadRepository
        .createQueryBuilder('a')
        .where('a.fkCategoriaActividadId = :id', { id })
        .limit(3) // Limitar a 3 actividades para el mensaje
        .getMany();

      const descripcionesActividades = actividades.map(a => {
        const desc = a.descripcion.length > 30 ? a.descripcion.substring(0, 30) + '...' : a.descripcion;
        return desc;
      }).join(', ');
      
      const mensajeAdicional = actividadesAsociadas > 3
        ? ` y ${actividadesAsociadas - 3} actividades más`
        : '';

      throw new BadRequestException(
        `No se puede eliminar la categoría de actividad "${categoria.nombre}" porque tiene ${actividadesAsociadas} actividad(es) asociada(s): ${descripcionesActividades}${mensajeAdicional}. ` +
        `Para eliminar esta categoría, primero debe eliminar o reassignar las actividades a otras categorías. ` +
        `Le sugerimos revisar la sección de actividades para gestionar estas asociaciones.`
      );
    }

    await this.categoriaRepository.remove(categoria);
  }
}
