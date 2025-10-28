import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsUUID,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateActividadeDto {
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  fechaAsignacion: Date;

  @IsNumber()
  @IsOptional()
  horasDedicadas?: number;

  @IsString()
  @IsOptional()
  observacion?: string;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;

  @IsUUID()
  @IsNotEmpty()
  fkCultivoVariedadZonaId: string;

  @IsUUID()
  @IsNotEmpty()
  fkCategoriaActividadId: string;

  @IsString()
  @IsOptional()
  imgUrl?: string;
}
