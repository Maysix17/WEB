import { Injectable } from '@nestjs/common';
import { CreateCultivosXVariedadDto } from './dto/create-cultivos_x_variedad.dto';
import { UpdateCultivosXVariedadDto } from './dto/update-cultivos_x_variedad.dto';

@Injectable()
export class CultivosXVariedadService {
  create(createCultivosXVariedadDto: CreateCultivosXVariedadDto) {
    return 'This action adds a new cultivosXVariedad';
  }

  findAll() {
    return `This action returns all cultivosXVariedad`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cultivosXVariedad`;
  }

  update(id: number, updateCultivosXVariedadDto: UpdateCultivosXVariedadDto) {
    return `This action updates a #${id} cultivosXVariedad`;
  }

  remove(id: number) {
    return `This action removes a #${id} cultivosXVariedad`;
  }
}
