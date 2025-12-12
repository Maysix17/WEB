#  API NestJS Agro TIC

API para gestión agrícola desarrollada con NestJS, PostgreSQL y Redis.

### Instalación y Configuración

1. **Navegar al directorio del proyecto**

Abrimos una terminal y ejecutamos :
   ```bash
   cd web
   cd MovilAgrotic
   cd ProyectoFormativo
   cd API_Nest_Agro_Tic
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```
4. **Ejecutar el backend(API_Nest_Agro_Tic)**

Primero: 
npm run docker:clean
Luego:
npm run docker:dev
5. **variables de entorno**
en el .env se encuentras las variables para igresar a la base de datos.

6. **Ejecutar migraciones**
en otra terminal, hacemos estos mismos pasos:
cd web
   cd MovilAgrotic
   cd ProyectoFormativo
   cd API_Nest_Agro_Tic
   
   ```bash
   generamos las migraciones:
   npm run docker:g
   corremos las migraciones:
   npm run migration:r
   ```

7. **Ejecutar seeders**
   ```bash
   npm run docker:seed
   ```

7. **Credenciales**
  ```bash
   N.Documento: 123456789
   Contraseña:admin123
   ```

