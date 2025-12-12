import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EstadosReservaService } from './estados_reserva.service';
import { CreateEstadosReservaDto } from './dto/create-estados_reserva.dto';
import { UpdateEstadosReservaDto } from './dto/update-estados_reserva.dto';

@Controller('estados-reserva')
export class EstadosReservaController {
  constructor(private readonly estadosReservaService: EstadosReservaService) {}

  @Post()
  create(@Body() createEstadosReservaDto: CreateEstadosReservaDto) {
    return this.estadosReservaService.create(createEstadosReservaDto);
  }

  @Get()
  findAll() {
    return this.estadosReservaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estadosReservaService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEstadosReservaDto: UpdateEstadosReservaDto,
  ) {
    return this.estadosReservaService.update(+id, updateEstadosReservaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estadosReservaService.remove(+id);
  }
}
