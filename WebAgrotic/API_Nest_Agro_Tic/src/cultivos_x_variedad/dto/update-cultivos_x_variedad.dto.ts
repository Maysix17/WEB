import { PartialType } from '@nestjs/mapped-types';
import { CreateCultivosXVariedadDto } from './create-cultivos_x_variedad.dto';

export class UpdateCultivosXVariedadDto extends PartialType(
  CreateCultivosXVariedadDto,
) {}
