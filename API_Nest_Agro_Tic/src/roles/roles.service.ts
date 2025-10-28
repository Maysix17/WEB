import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roles } from './entities/role.entity';
import { Permiso } from '../permisos/entities/permiso.entity';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,
    @InjectRepository(Permiso)
    private readonly permisosRepository: Repository<Permiso>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Roles> {
    const rolExistente = await this.rolesRepository.findOneBy({
      nombre: createRoleDto.nombre,
    });

    if (rolExistente) {
      throw new ConflictException('Ya existe un rol con ese nombre');
    }

    const nuevoRol = this.rolesRepository.create(createRoleDto);
    return this.rolesRepository.save(nuevoRol);
  }

  async findAll(): Promise<Roles[]> {
    return this.rolesRepository.find({
      // ✅ CAMBIO: Añadimos 'permisos.recurso.modulo' para cargar la relación anidada.
      relations: ['permisos', 'permisos.recurso', 'permisos.recurso.modulo'],
    });
  }

  async findOne(id: string): Promise<Roles> {
    const rol = await this.rolesRepository.findOne({
      where: { id },
      // Esta es la configuración clave que trae toda la información.
      relations: ['permisos', 'permisos.recurso', 'permisos.recurso.modulo'],
    });

    if (!rol) {
      throw new NotFoundException(`Rol con ID "${id}" no encontrado`);
    }
    return rol;
  }

  /**
   * Asigna un permiso a un rol y devuelve el objeto del rol completo y actualizado.
   */
  async assignPermission(roleId: string, permisoId: string): Promise<Roles> {
    // 1. Busca el rol usando findOne para asegurarnos de que tenemos los permisos actuales.
    const rol = await this.findOne(roleId);

    console.log('Rol encontrado:', rol);

    // 2. Busca el permiso que se va a asignar.
    const permiso = await this.permisosRepository.findOneBy({ id: permisoId });
    if (!permiso) {
      throw new NotFoundException(
        `Permiso con ID "${permisoId}" no encontrado`,
      );
    }

    // 3. Verifica si el permiso ya está asignado para evitar duplicados.
    const tienePermiso = rol.permisos.some((p) => p.id === permiso.id);
    if (tienePermiso) {
      throw new ConflictException('El rol ya tiene este permiso asignado');
    }

    // 4. Asigna el nuevo permiso al arreglo en memoria.
    rol.permisos.push(permiso);

    // ✅ CAMBIO CLAVE:
    // Primero, guardamos la relación en la base de datos.
    // No nos importa lo que devuelva .save() en este momento.
    await this.rolesRepository.save(rol);

    // Luego, llamamos de nuevo a findOne() para obtener el estado MÁS RECIENTE y COMPLETO
    // del rol desde la base de datos, con todas las relaciones anidadas cargadas.
    return this.findOne(roleId);
  }
  async assignMultiplePermissions(
    roleId: string,
    permisoIds: string[],
  ): Promise<Roles> {
    const rol = await this.findOne(roleId);

    // Busca los permisos que se van a asignar
    const permisos = await this.permisosRepository.findByIds(permisoIds);
    if (permisos.length !== permisoIds.length) {
      throw new NotFoundException('Uno o más permisos no encontrados');
    }

    // Filtra permisos que ya están asignados
    const nuevosPermisos = permisos.filter(
      (permiso) => !rol.permisos.some((p) => p.id === permiso.id),
    );

    // Asigna los nuevos permisos
    rol.permisos.push(...nuevosPermisos);

    await this.rolesRepository.save(rol);

    return this.findOne(roleId);
  }

  async updateRoleWithPermissions(
    roleId: string,
    updateData: { nombre?: string; permisoIds?: string[] },
  ): Promise<Roles> {
    const rol = await this.findOne(roleId);

    // Actualizar nombre si se proporciona
    if (updateData.nombre) {
      rol.nombre = updateData.nombre;
    }

    // Actualizar permisos si se proporcionan
    if (updateData.permisoIds !== undefined) {
      // Buscar permisos
      const permisos = await this.permisosRepository.findByIds(
        updateData.permisoIds,
      );
      if (permisos.length !== updateData.permisoIds.length) {
        throw new NotFoundException('Uno o más permisos no encontrados');
      }
      // Reemplazar permisos
      rol.permisos = permisos;
    }

    return this.rolesRepository.save(rol);
  }

  async removePermission(roleId: string, permisoId: string): Promise<Roles> {
    const rol = await this.findOne(roleId);

    // Filtra el permiso que se quiere eliminar
    rol.permisos = rol.permisos.filter((p) => p.id !== permisoId);

    return this.rolesRepository.save(rol);
  }

  async remove(id: string): Promise<void> {
    const rol = await this.findOne(id);
    await this.rolesRepository.remove(rol);
  }
}
