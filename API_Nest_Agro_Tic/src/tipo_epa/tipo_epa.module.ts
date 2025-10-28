import { Module } from '@nestjs/common';
import { TipoEpaService } from './tipo_epa.service';
import { TipoEpaController } from './tipo_epa.controller';

@Module({
  controllers: [TipoEpaController],
  providers: [TipoEpaService],
})
export class TipoEpaModule {}
