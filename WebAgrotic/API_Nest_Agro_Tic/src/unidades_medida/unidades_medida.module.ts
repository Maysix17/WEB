import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnidadesMedidaService } from './unidades_medida.service';
import { UnidadesMedidaController } from './unidades_medida.controller';
import { UnidadMedida } from './entities/unidades_medida.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UnidadMedida])],
  controllers: [UnidadesMedidaController],
  providers: [UnidadesMedidaService],
})
export class UnidadesMedidaModule {}
