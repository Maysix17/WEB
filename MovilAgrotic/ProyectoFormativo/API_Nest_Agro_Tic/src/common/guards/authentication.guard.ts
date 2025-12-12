import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    console.log('Final Extracted Token:', token); // Debugging line

    if (!token) {
      throw new UnauthorizedException('Invalid token');
    }

    try {
      const payload = this.jwtService.verify(token);
      request.userId = payload.sub;

      console.log('Token Payload:', payload); // Debugging line
    } catch (e) {
      Logger.error(e.message);
      throw new UnauthorizedException('Invalid Token');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // First try header
    let token = request.headers.authorization?.split(' ')[1];
    console.log('Token from header:', token);

    // If no header, try cookie
    if (!token) {
      token = request.cookies?.access_token; // Assuming cookie-parser middleware
      console.log('Token from cookie:', token);
    }

    return token;
  }
}
