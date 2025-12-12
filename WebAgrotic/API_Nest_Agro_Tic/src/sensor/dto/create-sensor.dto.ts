import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUrl,
  IsDate,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSensorDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  nombre: string;

  @IsNumber()
  @IsNotEmpty()
  coorX: number;

  @IsNumber()
  @IsNotEmpty()
  coorY: number;

  @IsNumber()
  @IsOptional()
  rangoMinimo?: number;

  @IsNumber()
  @IsOptional()
  rangoMaximo?: number;

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  img: string;

  @IsNumber()
  @IsNotEmpty()
  estado: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  fechaInstalacion: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  fechaUltimoMantenimiento?: Date;

  @IsNumber()
  @IsNotEmpty()
  fkTipoSensorId: number;

  @IsNumber()
  @IsOptional()
  fkZonaId?: number;
}
