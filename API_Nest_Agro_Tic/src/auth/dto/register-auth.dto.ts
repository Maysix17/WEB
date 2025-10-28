// src/auth/dto/register-auth.dto.ts
import {
  IsString,
  IsEmail,
  IsNumber,
  MinLength,
  IsNotEmpty,
} from 'class-validator';

export class RegisterAuthDto {
  @IsNumber({}, { message: 'El DNI debe ser un valor numérico.' })
  @IsNotEmpty({ message: 'El DNI no puede estar vacío.' })
  dni: number;

  @IsNumber({}, { message: 'El teléfono debe ser un valor numérico.' })
  @IsNotEmpty({ message: 'El teléfono no puede estar vacío.' })
  telefono: number;

  @IsString({ message: 'Los nombres deben ser una cadena de texto.' })
  @IsNotEmpty({ message: 'Los nombres no pueden estar vacíos.' })
  nombres: string;

  @IsString({ message: 'Los apellidos deben ser una cadena de texto.' })
  @IsNotEmpty({ message: 'Los apellidos no pueden estar vacíos.' })
  apellidos: string;

  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío.' })
  @IsString({ message: 'El correo electrónico debe ser una cadena de texto.' })
  @IsEmail({}, { message: 'El formato del correo electrónico no es válido.' })
  correo: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía.' })
  password: string;
}
