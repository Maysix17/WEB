import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTiposMovimientoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nombre: string;
}
