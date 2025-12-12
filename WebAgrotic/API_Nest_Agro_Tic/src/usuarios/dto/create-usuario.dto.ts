import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEmail,
  IsOptional,
  Length,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  nombres: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  apellidos: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsNumber()
  telefono: number;

  @IsEmail()
  @IsNotEmpty()
  @Length(1, 255)
  correo: string;

  @IsString()
  @IsNotEmpty()
  rolId: string;

  @IsNumber()
  @IsNotEmpty()
  dni: number;

  @IsOptional()
  @IsString()
  fichaId?: string;
}
