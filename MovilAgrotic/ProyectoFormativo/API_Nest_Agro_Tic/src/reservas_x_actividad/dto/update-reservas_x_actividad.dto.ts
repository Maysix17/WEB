import { PartialType } from '@nestjs/mapped-types';
import { CreateReservasXActividadDto } from './create-reservas_x_actividad.dto';

export class UpdateReservasXActividadDto extends PartialType(
  CreateReservasXActividadDto,
) {}
