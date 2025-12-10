

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

