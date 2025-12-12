import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateCosechaDto {
  @IsString()
  @IsNotEmpty()
  unidadMedida: string = 'kg';

  @IsNumber()
  @IsNotEmpty()
  cantidad: number;

  @IsOptional()
  @IsString()
  fecha?: string;

  @IsString()
  @IsNotEmpty()
  fkCultivosVariedadXZonaId: string;

  @IsOptional()
  @IsNumber()
  cantidad_plantas_cosechadas?: number;

  @IsOptional()
  @IsNumber()
  rendimiento_por_planta?: number;
}
