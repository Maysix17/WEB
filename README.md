

### 1. Instalar Dependencias

#### Backend (API_Nest_Agro_Tic)

cd API_Nest_Agro_Tic
npm install

#### Frontend (FrontEnd_AgroTic)

cd FrontEnd_AgroTic
npm install


### 2. Configurar el Backend

#### Levantar los Servicios con Docker

cd API_Nest_Agro_Tic
npm run docker:dev

Este comando levantará los contenedores de Docker necesarios (PostgreSQL, Redis, etc.).



#### Generar Migraciones

Ahora ejecutamos estos comando en una terminal aparte. Para que funcione debe estar el backend cooriendo

npm run docker:g

#### Ejecutar Migraciones

npm run docker:r


#### Ejecutar Seeders

npm run docker:seed


### 3. Configurar el Frontend

#### Ejecutar el Servidor de Desarrollo

cd FrontEnd_AgroTic
npm run dev


## Acceso al Sistema

Después de ejecutar los seeders, podrás acceder al sistema con las siguientes credenciales de prueba:

- **Administrador:**
  - Usuario: 123456789
  - Contraseña: admin123

- **Instructor:**
  - Usuario: 987654321
  - Contraseña: instructor123

- **Aprendiz:**
  - Usuario: 111111111
  - Contraseña: aprendiz123

## Comandos Útiles

### Backend
- `npm run start:dev`: Iniciar servidor en modo desarrollo
- `npm run build`: Construir la aplicación
- `npm run test`: Ejecutar pruebas

### Frontend
- `npm run dev`: Iniciar servidor de desarrollo
- `npm run build`: Construir la aplicación para producción
- `npm run preview`: Vista previa de la build de producción

### Docker (Backend)
- `npm run docker:up`: Levantar contenedores
- `npm run docker:down`: Detener contenedores
- `npm run docker:logs`: Ver logs de los contenedores
- `npm run docker:clean`: Limpiar contenedores y volúmenes


## Tecnologías Utilizadas

- **Backend:** NestJS, TypeORM, PostgreSQL, Redis, JWT
- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Contenedores:** Docker, Docker Compose
- **Comunicación:** WebSockets, MQTT

## Notas Importantes

- Asegúrate de que Docker esté ejecutándose antes de usar los comandos de Docker.
- Las migraciones y seeders solo deben ejecutarse una vez al configurar el proyecto inicialmente.
- Si encuentras problemas con los puertos, verifica que no estén en uso por otras aplicaciones.