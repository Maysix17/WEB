// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Patch,
  Query,
  Get,
  UseGuards, // Es buena práctica proteger endpoints sensibles
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport'; // Asumiendo que usas JWT guard

import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthenticationGuard } from '../common/guards/authentication.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterAuthDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginAuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    console.log(
      'AuthController: Login attempt for user with N. Documento:',
      loginDto.dni,
    );
    console.log('AuthController: NODE_ENV:', process.env.NODE_ENV);

    const result = await this.authService.login(loginDto);
    const accessMaxAge = 15 * 60 * 1000; // 15 min
    const refreshMaxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    const isProduction = process.env.NODE_ENV === 'production';

    console.log(
      'AuthController: Environment check - isProduction:',
      isProduction,
    );
    console.log(
      'AuthController: Setting access_token cookie:',
      result.access_token ? 'present' : 'missing',
    );
    console.log(
      'AuthController: Setting refresh_token cookie:',
      result.refresh_token ? 'present' : 'missing',
    );

    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      domain: isProduction ? undefined : 'localhost',
      maxAge: accessMaxAge,
    });

    response.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      domain: isProduction ? undefined : 'localhost',
      maxAge: refreshMaxAge,
    });

    console.log('AuthController: Cookies set successfully, sending response');
    console.log(
      'AuthController: Response headers will include Set-Cookie headers',
    );
    return {
      message: result.message,
      access_token: result.access_token,
      refresh_token: result.refresh_token,
    };
  }
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
    @Body() body?: { refreshToken?: string },
  ) {
    const refreshToken = req.cookies?.refresh_token || body?.refreshToken;
    console.log(
      'Refresh token from cookie or body:',
      refreshToken ? 'present' : 'missing',
    );
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }
    const result = await this.authService.refreshToken(refreshToken);
    const accessMaxAge = 15 * 60 * 1000; // 15 min
    const refreshMaxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    const isProduction = process.env.NODE_ENV === 'production';
    console.log('Setting new access_token cookie on refresh');
    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      domain: isProduction ? undefined : 'localhost',
      maxAge: accessMaxAge,
    });
    console.log('Setting new refresh_token cookie on refresh');
    response.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      domain: isProduction ? undefined : 'localhost',
      maxAge: refreshMaxAge,
    });
    return {
      message: result.message,
      access_token: result.access_token,
      refresh_token: result.refresh_token,
    };
  }

  // En una aplicación real, este endpoint debería estar protegido.
  // El ID del usuario se extrae del token JWT verificado, no del body.

  @UseGuards(AuthenticationGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const userId = (req as any).userId;
    console.log('Logout request received, userId:', userId);
    await this.authService.logout(userId);
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    return { message: 'Sesión cerrada exitosamente' };
  }

  /**
   * Endpoint para solicitar el restablecimiento de contraseña.
   * Recibe el correo electrónico del usuario y opcionalmente la plataforma.
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(forgotPasswordDto.email, forgotPasswordDto.platform);
  }

  /**
   * Endpoint para establecer la nueva contraseña.
   * Recibe el token de la URL y la nueva contraseña del cuerpo de la solicitud.
   */
  @Patch('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Query('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    // ✅ CAMBIO: Se pasa el DTO completo al servicio.
    return this.authService.resetPassword(token, resetPasswordDto);
  }

  @UseGuards(AuthenticationGuard)
  @Get('permissions')
  async getPermissions(@Req() req: Request): Promise<any[]> {
    const userId = (req as any).userId;
    return this.authService.getUserPermissions(userId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('ws-token')
  async getWebSocketToken(@Req() req: Request): Promise<{ token: string }> {
    const accessToken = req.cookies?.access_token;
    if (!accessToken) {
      throw new UnauthorizedException('No access token available');
    }
    return { token: accessToken };
  }

  /**
   * Endpoint para verificar si el token de acceso es válido.
   * Utilizado por el frontend para verificar el estado de autenticación.
   */
  @UseGuards(AuthenticationGuard)
  @Get('verify-token')
  async verifyToken(@Req() req: Request): Promise<{ valid: boolean }> {
    // Si llegamos aquí, significa que el AuthenticationGuard verificó el token exitosamente
    // Solo necesitamos confirmar que el token es válido
    return {
      valid: true
    };
  }

  /**
   * Endpoint para redireccionar desde móvil al deep link de la app.
   * Sirve una página HTML que redirige al deep link.
   */
  @Get('reset-password-mobile')
  @HttpCode(HttpStatus.OK)
  async resetPasswordMobile(@Query('token') token: string, @Res() res: Response) {
    const deepLink = `agrotic://modulo-usuarios/CambioContraPage?token=${token}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Restableciendo contraseña...</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script>
          window.onload = function() {
            // Intentar abrir el deep link
            window.location.href = '${deepLink}';
            // Si no se abre la app después de 2 segundos, mostrar mensaje
            setTimeout(function() {
              document.getElementById('message').innerHTML = 'Si la app no se abrió automáticamente, copia este enlace: <a href="${deepLink}">${deepLink}</a>';
            }, 2000);
          };
        </script>
      </head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
        <h1>Redirigiendo a la app...</h1>
        <p>Abriendo AgroTic para restablecer tu contraseña.</p>
        <div id="message"></div>
      </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}
