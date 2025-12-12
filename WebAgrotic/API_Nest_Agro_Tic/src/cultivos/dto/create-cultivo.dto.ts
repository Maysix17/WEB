import {
  IsString,
  IsOptional,
  IsNumber,
  IsDate,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCultivoDto {
  @IsUUID()
  tipoCultivoId: string;

  @IsUUID()
  variedadId: string;

  @IsUUID()
  zonaId: string;

  @IsNumber()
  @IsOptional()
  estado?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  siembra?: Date;

  @IsNumber()
  @IsOptional()
  cantidad_plantas_inicial?: number;

  @IsNumber()
  @IsOptional()
  fk_estado_fenologico?: number;
}
