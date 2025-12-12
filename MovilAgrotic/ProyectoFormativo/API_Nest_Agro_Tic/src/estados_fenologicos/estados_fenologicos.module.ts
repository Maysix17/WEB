import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadosFenologicosService } from './estados_fenologicos.service';
import { EstadosFenologicosController } from './estados_fenologicos.controller';
import { EstadoFenologico } from './entities/estado_fenologico.entity';
import { CultivosVariedadXZona } from '../cultivos_variedad_x_zona/entities/cultivos_variedad_x_zona.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([EstadoFenologico, CultivosVariedadXZona]), AuthModule],
  controllers: [EstadosFenologicosController],
  providers: [EstadosFenologicosService],
  exports: [EstadosFenologicosService],
})
export class EstadosFenologicosModule {}
