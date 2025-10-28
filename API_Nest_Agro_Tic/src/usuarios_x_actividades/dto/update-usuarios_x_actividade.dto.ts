import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuariosXActividadeDto } from './create-usuarios_x_actividade.dto';

export class UpdateUsuariosXActividadeDto extends PartialType(
  CreateUsuariosXActividadeDto,
) {}
