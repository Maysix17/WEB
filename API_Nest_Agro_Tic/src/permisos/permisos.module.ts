import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermisosService } from './permisos.service';
// Asumo que tienes un controlador, si no, puedes eliminar esta línea
import { PermisosController } from './permisos.controller';
import { Permiso } from './entities/permiso.entity';
import { Recurso } from '../recursos/entities/recurso.entity';
import { Modulo } from '../modulos/entities/modulo.entity';

import { AuthModule } from 'src/auth/auth.module';

import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization.guard';

@Module({
  imports: [
    // ✅ CORRECCIÓN: Añade la entidad 'Recurso' al arreglo de forFeature.
    // Esto hace que RecursoRepository esté disponible para inyección en este módulo.
    TypeOrmModule.forFeature([Permiso, Recurso, Modulo]),
    AuthModule, // ✅ CORRECTO: AuthModule se importa aquí.
  ],
  controllers: [PermisosController], // Asumo que tienes un controlador
  providers: [PermisosService],
  exports: [PermisosService], // ✅ CORRECTO: Exporta el servicio para que otros módulos puedan usarlo.
})
export class PermisosModule {}
