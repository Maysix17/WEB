import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Roles } from '../roles/entities/role.entity';
import { Ficha } from '../fichas/entities/ficha.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    // La línea clave que probablemente te falta o está incompleta:
    TypeOrmModule.forFeature([Usuario, Roles, Ficha]),
    // ✅ SOLUCIÓN: Importamos AuthModule para tener acceso a AuthService.
    AuthModule,
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService], // <-- AÑADE ESTA LÍNEA
})
export class UsuariosModule {}
