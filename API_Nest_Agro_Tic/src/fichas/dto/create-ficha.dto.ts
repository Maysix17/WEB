import { IsNumber, IsPositive } from 'class-validator';

export class CreateFichaDto {
  @IsNumber()
  @IsPositive()
  numero: number;
}
