import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Modulo } from './entities/modulo.entity';
import { ModulosService } from './modulos.service';
import { ModulosController } from './modulos.controller';
import { AuthModule } from '../auth/auth.module'; // Para los guards

@Module({
  imports: [TypeOrmModule.forFeature([Modulo]), AuthModule],
  controllers: [ModulosController],
  providers: [ModulosService],
})
export class ModulosModule {}
