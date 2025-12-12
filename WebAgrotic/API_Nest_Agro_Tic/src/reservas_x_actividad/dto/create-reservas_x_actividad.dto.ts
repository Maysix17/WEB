import { IsUUID, IsNumber, IsOptional, IsInt } from 'class-validator';

export class CreateReservasXActividadDto {
  @IsUUID()
  fkActividadId: string;

  @IsUUID()
  fkLoteId: string;

  @IsInt()
  fkEstadoId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  cantidadReservada: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  cantidadUsada?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  cantidadDevuelta?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  capacidadPresentacionProducto: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  precioProducto: number;
}
