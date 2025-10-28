import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LotesInventarioService } from './lotes_inventario.service';
import { LotesInventarioController } from './lotes_inventario.controller';
import { LotesInventario } from './entities/lotes_inventario.entity';
import { MovimientosInventario } from '../movimientos_inventario/entities/movimientos_inventario.entity';
import { TipoMovimiento } from '../tipos_movimiento/entities/tipos_movimiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LotesInventario, MovimientosInventario, TipoMovimiento])],
  controllers: [LotesInventarioController],
  providers: [LotesInventarioService],
})
export class LotesInventarioModule {}
