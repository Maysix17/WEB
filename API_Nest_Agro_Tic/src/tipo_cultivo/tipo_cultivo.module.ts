import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoCultivoService } from './tipo_cultivo.service';
import { TipoCultivoController } from './tipo_cultivo.controller';
import { TipoCultivo } from './entities/tipo_cultivo.entity';
import { Variedad } from '../variedad/entities/variedad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoCultivo, Variedad])],
  controllers: [TipoCultivoController],
  providers: [TipoCultivoService],
})
export class TipoCultivoModule {}
