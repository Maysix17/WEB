import { PartialType } from '@nestjs/mapped-types';
import { CreateEstadosReservaDto } from './create-estados_reserva.dto';

export class UpdateEstadosReservaDto extends PartialType(
  CreateEstadosReservaDto,
) {}
