import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaActividadService } from './categoria_actividad.service';
import { CategoriaActividadController } from './categoria_actividad.controller';
import { CategoriaActividad } from './entities/categoria_actividad.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriaActividad]), AuthModule],
  controllers: [CategoriaActividadController],
  providers: [CategoriaActividadService],
})
export class CategoriaActividadModule {}
