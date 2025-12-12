# Fix 403 Forbidden Error - Actividades Permission Issue

## Problem
403 Forbidden error when accessing activity details: "No tienes los permisos necesarios para acceder a este recurso."

## Root Cause Analysis

**Permission Mismatch**: The user doesn't have the required permissions to access the `/actividades/:id` endpoint.

### Technical Details

1. **API Endpoint**: `/actividades/:id` requires:
   - Resource: `actividades`
   - Action: `leer` (read)

2. **Frontend Calls**: Both ActivityDetailModal components make:
   ```typescript
   const activityRes = await apiClient.get(`/actividades/${activity.id}`);
   ```

3. **Authorization Flow**: `AuthorizationGuard` checks permissions and throws 403 if missing.

## Quick Solutions

### 1. Database Fix (Fastest)

Run this SQL query to add missing permissions:

```sql
-- Check current permissions
SELECT p.id, p.accion, r.nombre as recurso, m.nombre as modulo
FROM permisos p
JOIN recursos r ON p.fk_recurso_id = r.id
JOIN modulos m ON r.fk_modulo_id = m.id
WHERE m.nombre = 'Actividades' AND r.nombre = 'actividades';

-- Insert missing permission if needed
INSERT INTO permisos (accion, fk_recurso_id, created_at, updated_at)
SELECT 'leer', r.id, NOW(), NOW()
FROM recursos r
JOIN modulos m ON r.fk_modulo_id = m.id
WHERE m.nombre = 'Actividades' AND r.nombre = 'actividades'
AND NOT EXISTS (
    SELECT 1 FROM permisos p2 
    WHERE p2.accion = 'leer' AND p2.fk_recurso_id = r.id
);

-- Assign to all roles
INSERT INTO roles_permisos (fk_rol_id, fk_permiso_id)
SELECT rol.id, p.id
FROM roles rol
CROSS JOIN permisos p
JOIN recursos r ON p.fk_recurso_id = r.id
JOIN modulos m ON r.fk_modulo_id = m.id
WHERE m.nombre = 'Actividades' 
  AND r.nombre = 'actividades' 
  AND p.accion = 'leer'
  AND NOT EXISTS (
      SELECT 1 FROM roles_permisos rp2 
      WHERE rp2.fk_rol_id = rol.id AND rp2.fk_permiso_id = p.id
  );
```

### 2. Backend Restart

Restart the backend to trigger auto-seeding:

```bash
cd Produccion_Agro_Tic/API_Nest_Agro_Tic
npm run start:dev
```

### 3. Frontend Error Handling

Update activity detail modals to handle 403 errors gracefully:

```typescript
const fetchFullActivityData = async () => {
  if (!activity) return;
  setLoading(true);
  try {
    const activityRes = await apiClient.get(`/actividades/${activity.id}`);
    setFullActivity(activityRes.data);
  } catch (error: any) {
    if (error.response?.status === 403) {
      // Permission denied - use existing activity data
      setFullActivity(activity);
    } else {
      Alert.alert('Error', 'No se pudo cargar los detalles de la actividad');
    }
  } finally {
    setLoading(false);
  }
};
```

## Debug Steps

1. **Check Permissions**:
```typescript
import { usePermission } from '../contexts/PermissionContext';
const { hasPermission } = usePermission();
console.log('Has actividades leer permission:', 
  hasPermission('Actividades', 'actividades', 'leer'));
```

2. **Test API Directly**:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/actividades/SOME_ACTIVITY_ID
```

## Prevention

- Ensure seeder creates consistent permissions
- Add permission tests
- Improve error handling in frontend