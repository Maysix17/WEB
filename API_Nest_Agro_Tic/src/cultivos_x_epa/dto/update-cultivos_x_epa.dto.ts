import { PartialType } from '@nestjs/mapped-types';
import { CreateCultivosXEpaDto } from './create-cultivos_x_epa.dto';

export class UpdateCultivosXEpaDto extends PartialType(CreateCultivosXEpaDto) {}
