import { PartialType } from '@nestjs/mapped-types';
import { CreateLotesInventarioDto } from './create-lotes_inventario.dto';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateLotesInventarioDto extends PartialType(
  CreateLotesInventarioDto,
) {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsNumber()
  precioCompra?: number;

  @IsOptional()
  @IsNumber()
  capacidadPresentacion?: number;

  @IsOptional()
  @IsString()
  fkCategoriaId?: string;

  @IsOptional()
  @IsString()
  fkUnidadMedidaId?: string;

  @IsOptional()
  @IsString()
  fkBodegaId?: string;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsString()
  fechaVencimiento?: string;

  @IsOptional()
  @IsNumber()
  vidaUtilPromedioPorUsos?: number;
}
