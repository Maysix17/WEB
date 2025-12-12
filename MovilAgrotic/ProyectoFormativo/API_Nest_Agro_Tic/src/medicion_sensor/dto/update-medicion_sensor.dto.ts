import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicionSensorDto } from './create-medicion_sensor.dto';

export class UpdateMedicionSensorDto extends PartialType(
  CreateMedicionSensorDto,
) {}
