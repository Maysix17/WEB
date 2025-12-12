import { PartialType } from '@nestjs/mapped-types';
import { CreateCultivosVariedadXZonaDto } from './create-cultivos_variedad_x_zona.dto';

export class UpdateCultivosVariedadXZonaDto extends PartialType(
  CreateCultivosVariedadXZonaDto,
) {}
