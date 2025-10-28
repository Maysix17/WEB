import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from 'src/auth/auth.service';
import { PERMISOS_KEY } from 'src/permisos/decorators/permisos.decorator';
import { CreatePermisoDto } from 'src/permisos/dto/create-permiso.dto';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private readonly logger = new Logger(AuthorizationGuard.name);

  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.userId) {
      throw new UnauthorizedException(
        'ID de usuario no encontrado en la solicitud.',
      );
    }

    const requiredPermissions = this.reflector.getAllAndOverride<
      CreatePermisoDto[]
    >(PERMISOS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    this.logger.debug(
      `Permisos requeridos: ${JSON.stringify(requiredPermissions)}`,
    );

    try {
      const userPermissions = await this.authService.getUserPermissions(
        request.userId,
      );
      this.logger.debug(
        `Permisos del usuario ${request.userId}: ${JSON.stringify(userPermissions)}`,
      );

      const hasPermission = requiredPermissions.every((routePermission) => {
        const userPermissionForResource = userPermissions.find(
          (perm) => perm.recurso === routePermission.recurso,
        );

        if (!userPermissionForResource) return false;

        return routePermission.acciones.every((requiredAction) =>
          userPermissionForResource.acciones.includes(requiredAction),
        );
      });

      if (!hasPermission) {
        throw new ForbiddenException(
          'No tienes los permisos necesarios para acceder a este recurso.',
        );
      }

      return true;
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      this.logger.error(
        `Error inesperado en AuthorizationGuard: ${error.message}`,
        error.stack,
      );
      throw new ForbiddenException(
        'Ocurrió un error al verificar los permisos.',
      );
    }
  }
}
