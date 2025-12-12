import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoCultivoService } from './tipo_cultivo.service';
import { TipoCultivoController } from './tipo_cultivo.controller';
import { TipoCultivo } from './entities/tipo_cultivo.entity';
import { Variedad } from '../variedad/entities/variedad.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([TipoCultivo, Variedad]), AuthModule],
  controllers: [TipoCultivoController],
  providers: [TipoCultivoService],
})
export class TipoCultivoModule {}
