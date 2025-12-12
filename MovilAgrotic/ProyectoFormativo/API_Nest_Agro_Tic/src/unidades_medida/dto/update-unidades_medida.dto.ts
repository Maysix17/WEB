import { PartialType } from '@nestjs/mapped-types';
import { CreateUnidadesMedidaDto } from './create-unidades_medida.dto';

export class UpdateUnidadesMedidaDto extends PartialType(
  CreateUnidadesMedidaDto,
) {}
