import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientosInventarioService } from './movimientos_inventario.service';
import { MovimientosInventarioController } from './movimientos_inventario.controller';
import { MovimientosInventario } from './entities/movimientos_inventario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MovimientosInventario])],
  controllers: [MovimientosInventarioController],
  providers: [MovimientosInventarioService],
})
export class MovimientosInventarioModule {}
