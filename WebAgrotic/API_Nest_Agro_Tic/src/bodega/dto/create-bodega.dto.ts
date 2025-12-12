import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateBodegaDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 15)
  numero: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  nombre: string;
}
