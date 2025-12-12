import { IsArray, IsString } from 'class-validator';

export class UserPermissionsResponseDto {
  @IsString()
  recurso: string;

  @IsArray()
  @IsString({ each: true })
  acciones: string[];
}
