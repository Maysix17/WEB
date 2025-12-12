import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cultivo } from './entities/cultivo.entity';
import { CultivosVariedadXZona } from '../cultivos_variedad_x_zona/entities/cultivos_variedad_x_zona.entity';
import { CultivosXVariedad } from '../cultivos_x_variedad/entities/cultivos_x_variedad.entity';
import { Variedad } from '../variedad/entities/variedad.entity';
import { Zona } from '../zonas/entities/zona.entity';
import { CreateCultivoDto } from './dto/create-cultivo.dto';
import { UpdateCultivoDto } from './dto/update-cultivo.dto';
import { SearchCultivoDto } from './dto/search-cultivo.dto';

@Injectable()
export class CultivosService {
  constructor(
    @InjectRepository(Cultivo)
    private readonly cultivoRepo: Repository<Cultivo>,
    @InjectRepository(CultivosVariedadXZona)
    private readonly cvzRepo: Repository<CultivosVariedadXZona>,
    @InjectRepository(CultivosXVariedad)
    private readonly cxvRepo: Repository<CultivosXVariedad>,
    @InjectRepository(Variedad)
    private readonly variedadRepo: Repository<Variedad>,
    @InjectRepository(Zona)
    private readonly zonaRepo: Repository<Zona>,
  ) {}

  // [CULTIVOS] Crea cultivo con validaciones y relaciones complejas (Cultivo -> CultivosXVariedad -> CultivosVariedadXZona)
  async create(dto: CreateCultivoDto): Promise<Cultivo> {
    // Validate variedad exists and belongs to tipoCultivo
    const variedad = await this.variedadRepo.findOne({
      where: { id: dto.variedadId },
      relations: ['tipoCultivo'],
    });
    if (!variedad) {
      throw new NotFoundException(
        `Variedad con id ${dto.variedadId} no encontrada`,
      );
    }
    if (variedad.fkTipoCultivoId !== dto.tipoCultivoId) {
      throw new NotFoundException(
        `Variedad no pertenece al tipo de cultivo especificado`,
      );
    }

    // Validate zona exists
    const zona = await this.zonaRepo.findOne({ where: { id: dto.zonaId } });
    if (!zona) {
      throw new NotFoundException(`Zona con id ${dto.zonaId} no encontrada`);
    }

    // Create Cultivo
    const cultivo = this.cultivoRepo.create({
      estado: dto.estado,
      siembra: dto.siembra,
    });
    const savedCultivo = await this.cultivoRepo.save(cultivo);

    // Create CultivosXVariedad
    const cxv = this.cxvRepo.create({
      fkCultivoId: savedCultivo.id,
      fkVariedadId: dto.variedadId,
    });
    const savedCxv = await this.cxvRepo.save(cxv);

    // Create CultivosVariedadXZona
    const cvz = this.cvzRepo.create({
      fkCultivosXVariedadId: savedCxv.id,
      fkZonaId: dto.zonaId,
      cantidadPlantasInicial: dto.cantidad_plantas_inicial || 0,
      cantidadPlantasActual: dto.cantidad_plantas_inicial || 0,
      fkEstadoFenologicoId: dto.fk_estado_fenologico || 1,
    });
    const savedCvz = await this.cvzRepo.save(cvz);
    console.log('🌱 CULTIVOS SERVICE - CVZ creado:', {
      id: savedCvz.id,
      cantidadPlantasInicial: savedCvz.cantidadPlantasInicial,
      cantidadPlantasActual: savedCvz.cantidadPlantasActual,
      fkEstadoFenologicoId: savedCvz.fkEstadoFenologicoId,
    });

    return savedCultivo;
  } /**
   * NOTA: Esta función fue simplificada para usar la lógica de búsqueda,
   * la cual es más robusta. Solo llama a 'search' sin filtros.
   */

  async findAll(): Promise<any[]> {
    return this.search({});
  }

  async findOne(id: string): Promise<Cultivo> {
    const cultivo = await this.cultivoRepo.findOne({ where: { id } });
    if (!cultivo)
      throw new NotFoundException(`Cultivo con id ${id} no encontrado`);
    return cultivo;
  }

  async update(id: string, dto: UpdateCultivoDto): Promise<Cultivo> {
    const cultivo = await this.findOne(id);
    Object.assign(cultivo, dto);
    return await this.cultivoRepo.save(cultivo);
  }

  async remove(id: string): Promise<void> {
    const cultivo = await this.findOne(id);
    await this.cultivoRepo.remove(cultivo);
  }

  // [CULTIVOS] CONSULTA COMPLEJA: Busca cultivos con filtros avanzados y agregaciones
  async search(dto: SearchCultivoDto): Promise<any[]> {
    try {
      // CONSTRUCCIÓN DE QUERY COMPLEJA CON MÚLTIPLES JOINS:
      // cvz (CultivosVariedadXZona) es tabla central - une cultivo + variedad + zona
      const qb = this.cvzRepo
        .createQueryBuilder('cvz')
        // JOIN 1: cvz -> cultivos_x_variedad (cxv) - relación cultivo-variedad
        .leftJoin('cvz.cultivoXVariedad', 'cxv')
        // JOIN 2: cxv -> cultivo (c) - datos básicos del cultivo
        .leftJoin('cxv.cultivo', 'c')
        // JOIN 3: cxv -> variedad (v) - información de la variedad
        .leftJoin('cxv.variedad', 'v')
        // JOIN 4: v -> tipo_cultivo (tc) - clasificación del cultivo
        .leftJoin('v.tipoCultivo', 'tc')
        // JOIN 5: cvz -> zona (z) - ubicación geográfica
        .leftJoin('cvz.zona', 'z')
        // JOIN 6: cvz -> actividades (a) - actividades realizadas
        .leftJoin('cvz.actividades', 'a')
        // JOIN 7: a -> usuarios_asignados (uxa) - usuarios asignados a actividades
        .leftJoin('a.usuariosAsignados', 'uxa')
        // JOIN 8: uxa -> usuario (u) - datos del usuario asignado
        .leftJoin('uxa.usuario', 'u')
        // JOIN 9: u -> ficha (f) - ficha del aprendiz si aplica
        .leftJoin('u.ficha', 'f')
        // JOIN 10: cvz -> cosechas (cos) - cosechas realizadas
        .leftJoin('cvz.cosechas', 'cos')
        // JOIN 11: cvz -> estado_fenologico (ef) - estado actual del cultivo
        .leftJoin('cvz.estadoFenologico', 'ef');

      // APLICACIÓN DE FILTROS CONDICIONALES:
      // Filtro 1: Estado del cultivo (activo/inactivo)
      if (dto.estado_cultivo !== undefined && dto.estado_cultivo !== null) {
        qb.andWhere('c.estado = :estado', { estado: dto.estado_cultivo });
      }

      // Filtro 2: Búsqueda por nombre de zona (ILIKE = case insensitive)
      if (dto.buscar && dto.buscar.trim()) {
        qb.andWhere('z.nombre ILIKE :buscar', { buscar: `%${dto.buscar}%` });
      }

      // Filtro 3: Búsqueda por nombre de variedad O tipo de cultivo
      if (dto.buscar_cultivo && dto.buscar_cultivo.trim()) {
        qb.andWhere(
          '(v.var_nombre ILIKE :cultivo OR tc.tpc_nombre ILIKE :cultivo)',
          { cultivo: `%${dto.buscar_cultivo}%` },
        );
      }

      // Filtro 4: Rango de fechas de siembra
      if (dto.fecha_inicio && dto.fecha_fin) {
        qb.andWhere('c.siembra BETWEEN :inicio AND :fin', {
          inicio: dto.fecha_inicio,
          fin: dto.fecha_fin,
        });
      }

      // NOTA: Filtro por ficha se aplica después de obtener resultados (post-procesamiento)

      // SELECCIÓN DE CAMPOS CON FUNCIONES DE AGREGACIÓN AVANZADAS:
      qb.select([
        // IDs principales
        'cvz.id as cvzid',           // ID de CultivosVariedadXZona (clave primaria)
        'c.id as id',                // ID del cultivo

        // FICHAS: CONCATENACIÓN de números de ficha con COALESCE para valores nulos
        "COALESCE(string_agg(distinct f.ficha_numero::text, ', '), 'Sin ficha') as ficha",

        // INFORMACIÓN BÁSICA con COALESCE para evitar valores nulos
        "COALESCE(z.nombre, 'Sin zona') as lote",                    // Nombre de la zona
        "COALESCE(v.var_nombre, 'Sin variedad') as nombrecultivo",   // Nombre de la variedad
        'c.siembra as fechasiembra',                                  // Fecha de siembra
        'c.estado as estado',                                        // Estado del cultivo

        // AGREGACIONES DE COSECHAS:
        'MAX(cos.cos_fecha) as fechacosecha',                        // Última fecha de cosecha
        'COUNT(cos.id) as numCosechas',                              // Número total de cosechas

        // SUBQUERY: Obtener ID de la última cosecha (más eficiente que MAX)
        '(SELECT cos2.pk_id_cosecha FROM cosechas cos2 WHERE cos2.fk_id_cultivos_variedad_x_zona = cvz.pk_id_cv_zona ORDER BY cos2.cos_fecha DESC LIMIT 1) as cosechaid',

        // DATOS DE PLANTAS:
        'cvz.cantidadPlantasInicial as cantidad_plantas_inicial',    // Plantas iniciales
        'cvz.cantidadPlantasActual as cantidad_plantas_actual',      // Plantas actuales
        'cvz.fkEstadoFenologicoId as fk_estado_fenologico',          // Estado fenológico ID
        'cvz.fechaActualizacion as fecha_actualizacion',             // Última actualización

        // INFORMACIÓN COMPLETA DEL ESTADO FENOLÓGICO:
        'ef.nombre as estado_fenologico_nombre',                     // Nombre del estado
        'ef.descripcion as estado_fenologico_descripcion',           // Descripción del estado

        // INFORMACIÓN DEL TIPO DE CULTIVO:
        'tc.tpc_nombre as tipo_cultivo_nombre',                      // Nombre del tipo
        'tc.tpc_es_perenne as tipo_cultivo_es_perenne',              // Si es perenne
      ])

      // GROUP BY: Campos no agregados deben estar en GROUP BY
      .groupBy(
        'cvz.id, c.id, z.nombre, c.siembra, c.estado, v.var_nombre, ef.nombre, ef.descripcion, tc.tpc_nombre, tc.tpc_es_perenne',
      )
      .orderBy('cvz.id'); // Ordenado por ID de CVZ para consistencia

      // EJECUCIÓN Y DEPURACIÓN DE LA QUERY:
      console.log('Generated Query:', qb.getQuery());           // SQL generado
      console.log('Query Parameters:', qb.getParameters());     // Parámetros bind
      const result = await qb.getRawMany();                     // Ejecutar query
      console.log('Search result count before ficha filter:', result.length);
      console.log('Applied filters:', dto);
      console.log('First 3 results:', result.slice(0, 3));

      // POST-PROCESAMIENTO: FILTRO POR FICHA (después de la query)
      // NOTA: Este filtro se aplica en memoria porque involucra string_agg()
      // que no se puede filtrar eficientemente en SQL puro
      let filteredResult = result;
      if (dto.id_titulado && dto.id_titulado.trim()) {
        filteredResult = result.filter(
          (r) =>
            r.ficha &&
            r.ficha.toLowerCase().includes(dto.id_titulado!.toLowerCase()),
        );
        console.log(
          'Search result count after ficha filter:',
          filteredResult.length,
        );
      }

      return filteredResult;
    } catch (error) {
      console.error('Error en search:', error);
      // Devolver array vacío en caso de error para evitar crash
      return [];
    }
  }

  // [CULTIVOS] Finaliza cultivo cambiando estado a 0 (inactivo)
  async finalize(id: string): Promise<Cultivo> {
    const cultivo = await this.findOne(id);
    cultivo.estado = 0; // Cambiar estado a finalizado
    return await this.cultivoRepo.save(cultivo);
  }
}
