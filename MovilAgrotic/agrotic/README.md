# Guía de Instalación y Configuración de AgroMovil
Antes de comenzar con AgroMovil, asegúrate de completar los pasos de configuración de la carpeta Proyecto_Formativo en la sub carpeta de API_Nest_Agro_Tic que es donde se almacena el backend.
## Navegar al directorio de AgroMovil
Abre tu terminal y ejecuta:

```bash
cd web
cd AgroMovil
```

## Instalar las dependencias
Una vez dentro del directorio, ejecuta:

```bash
npm install
```

## Crear una cuenta en ngrok
Dirígete a ngrok y regístrate para obtener una cuenta gratuita. Una vez creada, recibirás un token de acceso.Tambien te recomendara instalar ngrok, lo instalas de igual manera, pero no hacemos uso de esa terminal.

## Configurar el token de ngrok
Copia el token de acceso y, en una terminal, ejecuta:

```bash
ngrok authtoken TU_TOKEN

en TU_TOKEN vas a poner el token que te proporciono ngrok
```

## Crear el túnel de ngrok
En la misma terminal, ejecuta:

```bash
ngrok http 3000
```

## Actualizar la URL de la API
Cuando ejecutes el comando de ngrok, aparecerán varias URLs. Debes tomar exclusivamente la que comience con https. Con esa URL, primero ingresa a la carpeta AgroMovil y actualiza el archivo app.json, reemplazando la URL de la API por la nueva generada por ngrok. Luego, dirígete a la carpeta Proyecto_Formativo, entra a API_Nest_Agro_Tic y actualiza el archivo .env, colocando esa misma URL https en el valor de API_URL. Con esto quedarán ambas partes del proyecto apuntando correctamente al túnel generado por ngrok.

Luego vuelve a correr el backend y ya funcionara