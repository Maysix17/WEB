import { PartialType } from '@nestjs/mapped-types';
import { CreateCosechaDto } from './create-cosecha.dto';

export class UpdateCosechaDto extends PartialType(CreateCosechaDto) {}
