import { Injectable } from '@nestjs/common';
import { CreateCultivosXEpaDto } from './dto/create-cultivos_x_epa.dto';
import { UpdateCultivosXEpaDto } from './dto/update-cultivos_x_epa.dto';

@Injectable()
export class CultivosXEpaService {
  create(createCultivosXEpaDto: CreateCultivosXEpaDto) {
    return 'This action adds a new cultivosXEpa';
  }

  findAll() {
    return `This action returns all cultivosXEpa`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cultivosXEpa`;
  }

  update(id: number, updateCultivosXEpaDto: UpdateCultivosXEpaDto) {
    return `This action updates a #${id} cultivosXEpa`;
  }

  remove(id: number) {
    return `This action removes a #${id} cultivosXEpa`;
  }
}
