import { IsString, IsNotEmpty, IsNumber, Length, IsOptional } from 'class-validator';

export class CreateZonaDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 8)
  tipoLote: string;

  @IsNumber()
  @IsNotEmpty()
  coorX: number;

  @IsNumber()
  @IsNotEmpty()
  coorY: number;

  @IsOptional()
  coordenadas?: any;

  @IsString()
  @IsOptional()
  fkMapaId?: string;
}
