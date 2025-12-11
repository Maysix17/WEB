import {
  IsString,
  IsNotEmpty,
  Length,
  IsNumber,
  IsPositive,
  IsOptional,
} from 'class-validator';

export class CreateRopaDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  precio: number;
}