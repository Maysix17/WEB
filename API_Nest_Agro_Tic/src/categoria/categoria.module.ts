import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { CategoriaService } from './categoria.service';
import { CategoriaController } from './categoria.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Categoria]), AuthModule],
  controllers: [CategoriaController],
  providers: [CategoriaService],
  exports: [CategoriaService],
})
export class CategoriaModule {}
