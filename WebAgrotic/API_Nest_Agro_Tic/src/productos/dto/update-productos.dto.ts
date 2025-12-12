import { PartialType } from '@nestjs/mapped-types';
import { CreateProductosDto } from './create-productos.dto';

export class UpdateProductosDto extends PartialType(CreateProductosDto) {}
