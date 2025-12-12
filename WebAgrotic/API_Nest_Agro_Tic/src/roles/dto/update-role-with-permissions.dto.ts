import { IsOptional, IsString, IsArray, IsUUID } from 'class-validator';

export class UpdateRoleWithPermissionsDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  permisoIds?: string[];
}
