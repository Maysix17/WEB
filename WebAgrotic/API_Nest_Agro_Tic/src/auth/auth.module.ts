// src/auth/auth.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Roles } from '../roles/entities/role.entity';
import { Session } from './sessions/entities/session.entity';
import { RolesModule } from 'src/roles/roles.module';
import { AuthorizationGuard } from 'src/common/guards/authorization.guard';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';

@Module({
  imports: [
    forwardRef(() => RolesModule),
    TypeOrmModule.forFeature([Usuario, Roles, Session]),
    // JwtModule y CacheModule ya son globales, no es necesario re-importarlos
  ],
  controllers: [AuthController],
  // Debes proveer tanto el servicio de autenticación como la estrategia JWT
  providers: [AuthService, AuthenticationGuard, AuthorizationGuard],
  exports: [AuthService], // <-- Añade esta línea para exportar el servicio
})
export class AuthModule {}
