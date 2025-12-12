import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class AssignMultiplePermissionsDto {
  @IsArray()
  @IsNotEmpty()
  @IsUUID('all', { each: true })
  permisoIds: string[];
}
