import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZonasService } from './zonas.service';
import { ZonasController } from './zonas.controller';
import { Zona } from './entities/zona.entity';
import { CultivosVariedadXZona } from '../cultivos_variedad_x_zona/entities/cultivos_variedad_x_zona.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Zona, CultivosVariedadXZona])],
  controllers: [ZonasController],
  providers: [ZonasService],
})
export class ZonasModule {}
