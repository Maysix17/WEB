import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoEpaDto } from './create-tipo_epa.dto';

export class UpdateTipoEpaDto extends PartialType(CreateTipoEpaDto) {}
