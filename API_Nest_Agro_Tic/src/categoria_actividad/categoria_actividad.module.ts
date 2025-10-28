import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaActividadService } from './categoria_actividad.service';
import { CategoriaActividadController } from './categoria_actividad.controller';
import { CategoriaActividad } from './entities/categoria_actividad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriaActividad])],
  controllers: [CategoriaActividadController],
  providers: [CategoriaActividadService],
})
export class CategoriaActividadModule {}
