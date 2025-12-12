import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateCultivosXVariedadDto {
  @IsNumber()
  @IsNotEmpty()
  fkCultivoId: number;

  @IsNumber()
  @IsNotEmpty()
  fkVariedadId: number;
}
