import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignPermissionDto {
  @IsUUID()
  @IsNotEmpty()
  permisoId: string;
}
