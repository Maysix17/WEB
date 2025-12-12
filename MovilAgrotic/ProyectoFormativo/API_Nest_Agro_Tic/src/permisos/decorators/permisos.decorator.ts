import { SetMetadata } from '@nestjs/common';
import { CreatePermisoDto } from '../dto/create-permiso.dto';

export const PERMISOS_KEY = 'permisos';

export const Permisos = (...permisos: CreatePermisoDto[]) =>
  SetMetadata(PERMISOS_KEY, permisos);
