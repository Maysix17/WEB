import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bodega } from './entities/bodega.entity';
import { BodegaService } from './bodega.service';
import { BodegaController } from './bodega.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bodega]), AuthModule],
  controllers: [BodegaController],
  providers: [BodegaService],
  exports: [BodegaService],
})
export class BodegaModule {}
