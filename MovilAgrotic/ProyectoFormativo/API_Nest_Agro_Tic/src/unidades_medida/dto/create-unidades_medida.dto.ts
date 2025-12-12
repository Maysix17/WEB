import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateUnidadesMedidaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  abreviatura: string;
}
