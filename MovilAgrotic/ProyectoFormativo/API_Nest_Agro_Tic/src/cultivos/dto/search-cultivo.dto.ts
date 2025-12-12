import { IsOptional, IsString, IsNumber } from 'class-validator';

export class SearchCultivoDto {
  @IsOptional()
  @IsString()
  buscar?: string;

  @IsOptional()
  @IsString()
  buscar_cultivo?: string;

  @IsOptional()
  @IsString()
  fecha_inicio?: string;

  @IsOptional()
  @IsString()
  fecha_fin?: string;

  @IsOptional()
  @IsString()
  id_titulado?: string;

  @IsOptional()
  @IsNumber()
  estado_cultivo?: number;
}
