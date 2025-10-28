import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadosReservaService } from './estados_reserva.service';
import { EstadosReservaController } from './estados_reserva.controller';
import { EstadoReserva } from './entities/estados_reserva.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EstadoReserva])],
  controllers: [EstadosReservaController],
  providers: [EstadosReservaService],
})
export class EstadosReservaModule {}
