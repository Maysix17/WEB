import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  Length,
} from 'class-validator';

export class CreateVariedadDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  nombre: string;

  @IsOptional()
  @IsUUID()
  fkTipoCultivoId?: string;
}
