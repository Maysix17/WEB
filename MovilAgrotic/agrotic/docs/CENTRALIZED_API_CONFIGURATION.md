# Configuración Centralizada de API URL

## 📋 Resumen

Este documento explica cómo funciona el sistema de configuración centralizada de API URLs implementado en el proyecto AgroTic. Ahora puedes cambiar la URL de la API en un solo lugar y se aplicará automáticamente a todos los proyectos.

## 🏗️ Arquitectura

### Archivos Principales

1. **`agrotic/app.json`** - Configuración principal de Expo (fuente de verdad)
2. **`agrotic/config/api-config.json`** - Archivo compartido entre proyectos
3. **`agrotic/scripts/sync-config.js`** - Script de sincronización

### Proyectos Integrados

1. **`agrotic/`** - React Native/Expo (fuente principal)
2. **`Produccion_Agro_Tic/API_Nest_Agro_Tic/`** - API NestJS
3. **`Produccion_Agro_Tic/FrontEnd_AgroTic/`** - Frontend React

## 🚀 Uso

### Cambiar la API URL

**Solo necesitas editar un archivo:**

```bash
# 1. Editar agrotic/app.json
{
  "expo": {
    "extra": {
      "apiUrl": "TU_NUEVA_URL_AQUI"
    }
  }
}

# 2. Sincronizar la configuración
cd agrotic
node scripts/sync-config.js
```

### Verificar la Configuración

Cada proyecto mostrará en consola qué URL está usando:

- **API NestJS**: `✅ API: Usando API URL centralizada desde api-config.json: TU_URL`
- **Frontend React**: `✅ FrontEnd: Usando API URL centralizada: TU_URL`
- **React Native**: Lee directamente desde `app.json`

## 🔄 Sincronización Automática

### Script de Sincronización

```bash
# Ejecutar manualmente
cd agrotic
node scripts/sync-config.js

# El script:
# 1. Lee la URL desde app.json
# 2. Detecta el entorno automáticamente
# 3. Actualiza api-config.json
# 4. Los otros proyectos lo leen automáticamente
```

### Detección Automática de Entorno

El sistema detecta automáticamente el entorno basado en la URL:

```javascript
// URLs de desarrollo
- ngrok-free.dev
- localhost
- 192.168.x.x
- 127.0.0.1

// URLs de staging
- staging.*
- test.*

// URLs de producción
- Otras URLs
```

## 📁 Estructura de Archivos

```
agrotic/
├── app.json                           # ← EDITAR AQUÍ
├── config/
│   └── api-config.json               # ← SE GENERA AUTOMÁTICAMENTE
└── scripts/
    └── sync-config.js                # ← SCRIPT DE SINCRONIZACIÓN

Produccion_Agro_Tic/
├── API_Nest_Agro_Tic/
│   └── src/common/config/
│       └── centralized-config.service.ts  # ← LEE api-config.json
└── FrontEnd_AgroTic/
    └── src/lib/config/
        └── centralized-config.ts          # ← LEE api-config.json
```

## 🛠️ Implementación Técnica

### API NestJS

```typescript
// src/common/config/centralized-config.service.ts
@Injectable()
export class CentralizedConfigService {
  getApiUrl(): string {
    // Lee desde api-config.json con fallback a .env
    return this.config?.apiUrl || 'http://localhost:3000';
  }
}
```

### Frontend React

```typescript
// src/lib/config/centralized-config.ts
const apiClient = axios.create({
  baseURL: centralizedConfig.getApiUrl(), // ← URL centralizada
});
```

### React Native (Expo)

```typescript
// config/appConfig.ts (ya existente)
const getApiUrl = (): string => {
  // Lee directamente desde app.json
  const configUrl = Constants.expoConfig?.extra?.apiUrl;
  return configUrl;
};
```

## 🔧 Solución de Problemas

### Si los proyectos no detectan la nueva URL:

1. **Ejecutar sincronización manual:**
   ```bash
   cd agrotic
   node scripts/sync-config.js
   ```

2. **Verificar que `api-config.json` se actualizó:**
   ```json
   {
     "apiUrl": "TU_NUEVA_URL",
     "environment": "development",
     "lastUpdated": "2025-12-09T07:00:00.000Z"
   }
   ```

3. **Reiniciar los servidores de desarrollo**

### Si hay errores de CORS:

Asegúrate de que la nueva URL esté configurada en el backend:

```javascript
// En el API NestJS (.env)
API_URL=TU_NUEVA_URL
FRONTEND_URL=http://localhost:5173
```

## 📊 Ventajas del Sistema

- ✅ **Un solo lugar para cambiar URLs**
- ✅ **Detección automática de entorno**
- ✅ **Fallbacks seguros**
- ✅ **Logs informativos**
- ✅ **Compatibilidad hacia atrás**
- ✅ **Fácil debugging**

## 🎯 Ejemplo de Uso Completo

```bash
# 1. Cambiar URL en app.json
vim agrotic/app.json
# Cambiar "apiUrl": "https://old-url.ngrok-free.dev"
# a        "apiUrl": "https://new-url.ngrok-free.dev"

# 2. Sincronizar
cd agrotic && node scripts/sync-config.js

# 3. Reiniciar todos los proyectos
# - API: npm run start
# - Frontend: npm run dev  
# - Mobile: npx expo start

# 4. Verificar logs
# API: "✅ API: Usando API URL centralizada desde api-config.json: https://new-url.ngrok-free.dev"
# Frontend: "✅ FrontEnd: Usando API URL centralizada: https://new-url.ngrok-free.dev"
```

## 🚨 Notas Importantes

- **El archivo `api-config.json` se genera automáticamente** - no lo edites manualmente
- **Usa el script `sync-config.js` siempre** después de cambiar `app.json`
- **Los proyectos tienen fallbacks** - si no pueden leer `api-config.json`, usan `.env`
- **Los logs te dicen exactamente qué URL está usando cada proyecto**

---

¡Con este sistema, cambiar la API URL es tan simple como editar una línea en `app.json`! 🎉