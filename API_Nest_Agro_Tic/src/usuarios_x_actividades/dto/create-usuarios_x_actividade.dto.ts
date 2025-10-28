import { IsNotEmpty, IsUUID, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUsuariosXActividadeDto {
  @IsUUID()
  @IsNotEmpty()
  fkUsuarioId: string;

  @IsUUID()
  @IsNotEmpty()
  fkActividadId: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  fechaAsignacion: Date;
}
