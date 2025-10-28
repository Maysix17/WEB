import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateCultivosVariedadXZonaDto {
  @IsString()
  @IsNotEmpty()
  fkCultivosXVariedadId: string;

  @IsString()
  @IsNotEmpty()
  fkZonaId: string;

  @IsNumber()
  @IsOptional()
  cantidadPlantasInicial?: number;

  @IsNumber()
  @IsOptional()
  fkEstadoFenologicoId?: number;
}
