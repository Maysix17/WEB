import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CultivosVariedadXZonaService } from './cultivos_variedad_x_zona.service';
import { CultivosVariedadXZonaController } from './cultivos_variedad_x_zona.controller';
import { CultivosVariedadXZona } from './entities/cultivos_variedad_x_zona.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CultivosVariedadXZona])],
  controllers: [CultivosVariedadXZonaController],
  providers: [CultivosVariedadXZonaService],
})
export class CultivosVariedadXZonaModule {}
