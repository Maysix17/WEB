import { IsNotEmpty, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMedicionSensorDto {
  @IsNumber()
  @IsNotEmpty()
  valor: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  fechaMedicion: Date;

  @IsNumber()
  @IsNotEmpty()
  fkSensorId: number;
}
