import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateTipoSensorDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  unidadMedida: string;
}
