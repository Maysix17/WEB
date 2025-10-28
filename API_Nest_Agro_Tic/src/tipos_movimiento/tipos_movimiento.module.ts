import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiposMovimientoService } from './tipos_movimiento.service';
import { TiposMovimientoController } from './tipos_movimiento.controller';
import { TipoMovimiento } from './entities/tipos_movimiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoMovimiento])],
  controllers: [TiposMovimientoController],
  providers: [TiposMovimientoService],
})
export class TiposMovimientoModule {}
