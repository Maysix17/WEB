import { Module, forwardRef } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles } from './entities/role.entity';
import { Permiso } from '../permisos/entities/permiso.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([Roles, Permiso]),
  ],
  controllers: [RolesController],
  providers: [RolesService],
  // ✅ CORRECCIÓN 1: Exporta el servicio para que otros módulos puedan usarlo.
  exports: [RolesService],
})
export class RolesModule {}
