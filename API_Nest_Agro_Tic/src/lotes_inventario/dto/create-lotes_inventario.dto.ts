import {
  IsUUID,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateLotesInventarioDto {
  @IsUUID()
  fkProductoId: string;

  @IsUUID()
  fkBodegaId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  stock: number;

  @IsBoolean()
  esParcial: boolean;

  @IsDateString()
  @IsOptional()
  fechaVencimiento?: string;
}
