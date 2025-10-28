import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateProductosDto {
  @IsString()
  @MaxLength(150)
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  sku?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  precioCompra: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  capacidadPresentacion: number;

  @IsUUID()
  @IsOptional()
  fkCategoriaId?: string;

  @IsUUID()
  @IsOptional()
  fkUnidadMedidaId?: string;

  @IsNumber()
  @IsOptional()
  vidaUtilPromedioPorUsos?: number;
}
