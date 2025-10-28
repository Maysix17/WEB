import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Variedad } from './entities/variedad.entity';
import { VariedadesService } from './variedad.service';
import { VariedadesController } from './variedad.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Variedad])],
  controllers: [VariedadesController],
  providers: [VariedadesService],
})
export class VariedadModule {}
