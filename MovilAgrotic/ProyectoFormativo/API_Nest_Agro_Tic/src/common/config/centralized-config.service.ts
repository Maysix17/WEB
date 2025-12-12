import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface CentralizedConfig {
  apiUrl: string;
  frontendUrl: string;
  environment: string;
}

/**
 * Servicio de configuración centralizada que lee la API URL desde api-config.json compartido
 * y usa .env como fallback para otras configuraciones
 */
@Injectable()
export class CentralizedConfigService {
  private readonly logger = new Logger(CentralizedConfigService.name);
  private config: CentralizedConfig | null = null;

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      // 1. Intentar leer desde api-config.json compartido
      const configPath = path.join(
        __dirname,
        '../../../../../agrotic/config/api-config.json'
      );

      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf8');
        const configData = JSON.parse(configContent);
        
        const apiUrlFromConfig = configData?.apiUrl;
        if (apiUrlFromConfig) {
          this.config = {
            apiUrl: apiUrlFromConfig,
            frontendUrl: apiUrlFromConfig.replace('https://', 'http://').replace('/api', ''),
            environment: configData?.environment || this.detectEnvironment(apiUrlFromConfig),
          };
          
          this.logger.log(`✅ API: Usando API URL centralizada desde api-config.json: ${apiUrlFromConfig}`);
          return;
        }
      }

      // 2. Fallback: usar variables de entorno existentes
      this.logger.warn('⚠️ API: No se pudo leer api-config.json, usando configuración de .env');
      this.config = {
        apiUrl: process.env.API_URL || 'http://localhost:3000',
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
        environment: process.env.NODE_ENV || 'development',
      };

    } catch (error) {
      this.logger.error('❌ API: Error cargando configuración centralizada:', error);
      
      // 3. Fallback final
      this.config = {
        apiUrl: 'http://localhost:3000',
        frontendUrl: 'http://localhost:5173',
        environment: 'development',
      };
    }
  }

  private detectEnvironment(apiUrl: string): string {
    if (apiUrl.includes('ngrok-free.dev') || 
        apiUrl.includes('localhost') || 
        apiUrl.includes('192.168.') ||
        apiUrl.includes('127.0.0.1')) {
      return 'development';
    }
    if (apiUrl.includes('staging') || apiUrl.includes('test')) {
      return 'staging';
    }
    return 'production';
  }

  getApiUrl(): string {
    return this.config?.apiUrl || 'http://localhost:3000';
  }

  getFrontendUrl(): string {
    return this.config?.frontendUrl || 'http://localhost:5173';
  }

  getEnvironment(): string {
    return this.config?.environment || 'development';
  }

  isDevelopment(): boolean {
    return this.getEnvironment() === 'development';
  }

  isProduction(): boolean {
    return this.getEnvironment() === 'production';
  }

  isStaging(): boolean {
    return this.getEnvironment() === 'staging';
  }

  getConfig(): CentralizedConfig {
    return this.config || {
      apiUrl: 'http://localhost:3000',
      frontendUrl: 'http://localhost:5173',
      environment: 'development',
    };
  }

  /**
   * Método para recargar la configuración (útil para desarrollo)
   */
  reloadConfig(): void {
    this.logger.log('🔄 Recargando configuración centralizada...');
    this.loadConfig();
  }
}