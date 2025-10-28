// src/auth/dto/login-auth.dto.ts
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class LoginAuthDto {
  @IsNumber() // Cambiamos a IsNumber para validar que sea un número
  @IsNotEmpty()
  dni: number; // Cambiamos la propiedad de 'correo' a 'dni'

  @IsString()
  @IsNotEmpty()
  password: string;
}
