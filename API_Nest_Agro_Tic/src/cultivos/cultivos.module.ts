import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cultivo } from './entities/cultivo.entity';
import { CultivosService } from './cultivos.service';
import { CultivosController } from './cultivos.controller';
import { CultivosVariedadXZona } from '../cultivos_variedad_x_zona/entities/cultivos_variedad_x_zona.entity';
import { CultivosXVariedad } from '../cultivos_x_variedad/entities/cultivos_x_variedad.entity';
import { Variedad } from '../variedad/entities/variedad.entity';
import { Zona } from '../zonas/entities/zona.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cultivo,
      CultivosVariedadXZona,
      CultivosXVariedad,
      Variedad,
      Zona,
    ]),
  ],
  controllers: [CultivosController],
  providers: [CultivosService],
})
export class CultivosModule {}
