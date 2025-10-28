import { Module } from '@nestjs/common';
import { CultivosXEpaService } from './cultivos_x_epa.service';
import { CultivosXEpaController } from './cultivos_x_epa.controller';

@Module({
  controllers: [CultivosXEpaController],
  providers: [CultivosXEpaService],
})
export class CultivosXEpaModule {}
