import { Module } from '@nestjs/common';
import { PermissionsWsGateway } from './permissions-ws.gateway';
import { PermisosModule } from '../permisos/permisos.module';

@Module({
  imports: [PermisosModule],
  providers: [PermissionsWsGateway],
  exports: [PermissionsWsGateway],
})
export class PermissionsWsModule {}
