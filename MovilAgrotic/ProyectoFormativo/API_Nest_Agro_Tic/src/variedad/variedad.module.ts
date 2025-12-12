import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Variedad } from './entities/variedad.entity';
import { CultivosXVariedad } from '../cultivos_x_variedad/entities/cultivos_x_variedad.entity';
import { VariedadesService } from './variedad.service';
import { VariedadesController } from './variedad.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Variedad, CultivosXVariedad]), AuthModule],
  controllers: [VariedadesController],
  providers: [VariedadesService],
})
export class VariedadModule {}
