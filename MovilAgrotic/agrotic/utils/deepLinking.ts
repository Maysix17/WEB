import * as Linking from 'expo-linking';
import { router } from 'expo-router';

export const config = {
  screens: {
    index: '',
    'modulo-usuarios': {
      screens: {
        LoginPage: 'login',
        RegistroPage: 'registro',
        RecuperarPage: 'recuperar',
        CambioContraPage: 'cambiar-contrasena',
        ProfilePage: 'perfil',
        PanelControlPage: 'panel-control',
      },
    },
    'modulo-cultivos': {
      screens: {
        CultivosPage: 'cultivos',
        TipoCultivoPage: 'tipo-cultivo',
        VariedadPage: 'variedad',
      },
    },
    'modulo-actividades': {
      screens: {
        ActividadesPage: 'actividades',
        DashboardPage: 'dashboard',
        HistorialActividadesPage: 'historial',
      },
    },
    'modulo-inventario': {
      screens: {
        InventarioPage: 'inventario',
        ProductDetailPage: 'producto',
        MovimientosPage: 'movimientos',
      },
    },
    'modulo-iot': {
      screens: {
        IOTPage: 'iot',
      },
    },
    'modulo-zonas': {
      screens: {
        ZonasPage: 'zonas',
        ZonaPage: 'zona',
      },
    },
    'modulo-inicio': {
      screens: {
        dashboard: 'inicio',
      },
    },
  },
};

export const linking = {
  prefixes: [Linking.createURL('/'), 'agrotic://'],
  config,
};

// Función para manejar deep links
export const handleDeepLink = (url: string) => {
  try {
    const { hostname, path, queryParams } = Linking.parse(url);

    console.log('Deep link received:', { hostname, path, queryParams });

    // Manejar enlaces de recuperación de contraseña
    if (path?.includes('reset-password') || path?.includes('cambiar-contrasena') || path?.includes('CambioContraPage')) {
      const token = queryParams?.token as string;
      if (token) {
        console.log('Navigating to login page to show change password modal with token:', token);
        router.push({
          pathname: '/modulo-usuarios/LoginPage',
          params: { showChangePasswordModal: 'true', token }
        });
        return true;
      }
    }

    // Manejar enlaces para mostrar modal de recuperación
    if (path?.includes('recuperar') || path?.includes('forgot-password') || path?.includes('RecuperarPage')) {
      console.log('Navigating to login page to show recovery modal');
      router.push({
        pathname: '/modulo-usuarios/LoginPage',
        params: { showRecoverModal: 'true' }
      });
      return true;
    }

    // Manejar otros tipos de deep links aquí si es necesario
    // Por ejemplo: notificaciones, invitaciones, etc.

    return false;
  } catch (error) {
    console.error('Error handling deep link:', error);
    return false;
  }
};

// Función para crear URLs de deep linking
export const createDeepLink = (path: string, params?: Record<string, string>) => {
  return Linking.createURL(path, { queryParams: params });
};

// Función para compartir enlaces de recuperación de contraseña
export const createPasswordResetLink = (token: string) => {
  return `agrotic://modulo-usuarios/CambioContraPage?token=${token}`;
};