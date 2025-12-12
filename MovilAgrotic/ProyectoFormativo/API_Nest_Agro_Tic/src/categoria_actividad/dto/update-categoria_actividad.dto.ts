import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaActividadDto } from './create-categoria_actividad.dto';

export class UpdateCategoriaActividadDto extends PartialType(
  CreateCategoriaActividadDto,
) {}
