import { PartialType } from '@nestjs/mapped-types';
import { CreateRopaDto } from './create-ropa.dto';

export class UpdateRopaDto extends PartialType(CreateRopaDto) {}