/**
 * Servicio de configuración centralizada para FrontEnd React
 * Lee la API URL desde el archivo api-config.json compartido
 */

export interface CentralizedConfig {
  apiUrl: string;
  environment: string;
  lastUpdated: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isStaging: boolean;
}

class CentralizedConfigService {
  private config: CentralizedConfig | null = null;

  constructor() {
    this.loadConfig();
  }

  private async loadConfig(): Promise<void> {
    try {
      // Intentar cargar desde el archivo de configuración compartido
      const response = await fetch('/api-config.json');
      if (response.ok) {
        const configData = await response.json();
        this.config = {
          ...configData,
          isDevelopment: configData.environment === 'development',
          isProduction: configData.environment === 'production',
          isStaging: configData.environment === 'staging',
        };
        
        console.log('✅ FrontEnd: Usando API URL centralizada:', configData.apiUrl);
        return;
      }
    } catch (error) {
      console.warn('⚠️ FrontEnd: No se pudo cargar api-config.json, usando fallback');
    }

    // Fallback: usar variables de entorno
    const envApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const env = import.meta.env.MODE || 'development';
    
    this.config = {
      apiUrl: envApiUrl,
      environment: env,
      lastUpdated: new Date().toISOString(),
      isDevelopment: env === 'development',
      isProduction: env === 'production',
      isStaging: env === 'staging',
    };

    console.log('✅ FrontEnd: Usando configuración de fallback:', envApiUrl);
  }

  getApiUrl(): string {
    return this.config?.apiUrl || 'http://localhost:3000';
  }

  getEnvironment(): string {
    return this.config?.environment || 'development';
  }

  getLastUpdated(): string {
    return this.config?.lastUpdated || '';
  }

  isDevelopment(): boolean {
    return this.config?.isDevelopment || false;
  }

  isProduction(): boolean {
    return this.config?.isProduction || false;
  }

  isStaging(): boolean {
    return this.config?.isStaging || false;
  }

  getConfig(): CentralizedConfig {
    return this.config || {
      apiUrl: 'http://localhost:3000',
      environment: 'development',
      lastUpdated: '',
      isDevelopment: true,
      isProduction: false,
      isStaging: false,
    };
  }

  /**
   * Recargar configuración
   */
  async reloadConfig(): Promise<void> {
    console.log('🔄 FrontEnd: Recargando configuración centralizada...');
    await this.loadConfig();
  }
}

// Instancia singleton
const centralizedConfigService = new CentralizedConfigService();

export default centralizedConfigService;
export { CentralizedConfigService };