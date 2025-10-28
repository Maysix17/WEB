import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateEpaDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  imgUrl?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  tipo: string;
}
