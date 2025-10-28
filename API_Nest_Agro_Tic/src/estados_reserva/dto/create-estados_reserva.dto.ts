import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateEstadosReservaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nombre: string;
}
