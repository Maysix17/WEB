import { Injectable } from '@nestjs/common';
import { CreateTipoEpaDto } from './dto/create-tipo_epa.dto';
import { UpdateTipoEpaDto } from './dto/update-tipo_epa.dto';

@Injectable()
export class TipoEpaService {
  create(createTipoEpaDto: CreateTipoEpaDto) {
    return 'This action adds a new tipoEpa';
  }

  findAll() {
    return `This action returns all tipoEpa`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tipoEpa`;
  }

  update(id: number, updateTipoEpaDto: UpdateTipoEpaDto) {
    return `This action updates a #${id} tipoEpa`;
  }

  remove(id: number) {
    return `This action removes a #${id} tipoEpa`;
  }
}
