import { IsNotEmpty, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCultivosXEpaDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  fechaDeteccion: Date;

  @IsNumber()
  @IsNotEmpty()
  estado: number;

  @IsNumber()
  @IsNotEmpty()
  fkCultivosXVariedadId: number;

  @IsNumber()
  @IsNotEmpty()
  fkEpaId: number;
}
