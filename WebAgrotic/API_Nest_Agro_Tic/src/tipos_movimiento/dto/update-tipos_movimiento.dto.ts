import { PartialType } from '@nestjs/mapped-types';
import { CreateTiposMovimientoDto } from './create-tipos_movimiento.dto';

export class UpdateTiposMovimientoDto extends PartialType(
  CreateTiposMovimientoDto,
) {}
