// File: src/tipo-epa/dto/create-tipo-epa.dto.ts
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTipoEpaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nombre: string;
}
