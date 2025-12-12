# Guía de Instalación y Configuración de AgroMovil
Antes de comenzar con AgroMovil, asegúrate de completar los pasos de configuración de la carpeta Proyecto_Formativo en la sub carpeta de API_Nest_Agro_Tic que es donde se almacena el backend.

La apk se debe generar, debido a que el la rul https cambia para cada usuario.

## Navegar al directorio de AgroMovil
Abre tu terminal y ejecuta:

```bash
cd web
cd MovilAgrotic
cd agrotic
```

## Instalar las dependencias
Una vez dentro del directorio, ejecuta:

```bash
npm install
```
## Crear una cuenta en ngrok
Dirígete a ngrok y regístrate para obtener una cuenta gratuita. Una vez creada, recibirás un comando con un  token de acceso.

## Configurar el token de ngrok
Copia el comando de acceso y, en una terminal, ejecuta:
```bash
ngrok config add-authtoken TU_TOKEN

en TU_TOKEN vas a poner el token que te proporciono ngrok
```

## Crear el túnel de ngrok
En la misma terminal, ejecuta:

```bash
ngrok http 3000
```

## Actualizar la URL de la API
Cuando ejecutes el comando de ngrok, aparecerán varias URLs. Debes tomar exclusivamente la que comience con https. 
Con esa URL, primero ingresa a la carpeta AgroMovil, luego en la sub carpeta de agrotic actualiza el archivo app.json, reemplazando la URl de apiUrl que se encuentra en "Extra" por la nueva generada por ngrok. Luego, dirígete a la carpeta Proyecto_Formativo, entra a API_Nest_Agro_Tic y actualiza el archivo .env, colocando esa misma URL https en el valor de API_URL. Con esto quedarán ambas partes del proyecto apuntando correctamente al túnel generado por ngrok.

Luego vuelve a correr el backend y ya funcionara correctamente.
## Generar APK

Para generar el archivo APK de la aplicación móvil, sigue estos pasos:


### Crear cuenta de Expo
Ve a tu navegador y busca Expo, y creraras tu cuenta de Expo.


### Crear Nuevo proyecto en Expo

Agregas un nuevo proyecto:
Ingresas el nombre del proyecto: ej:AgroTic

- luego, te saldra una ventana con unos pasos, y dos opciones para seleccionar tu escoges la que dice: Para una base de codigo existente.

### Instalar EAS CLI
Luego te dirijes a una terminal ya dentro de agrotic
y ejecutas el siguiente comando para instalar la CLI de EAS:

```bash
npm install --global eas-cli
```
Despues sigue el paso N.2, tú copias ese id que te aparece como linea te texto; ejemplo (e35c4fe0-b8a2-4aeb-b0a8-7540b5faf179) que completo seria: eas init --id e35c4fe0-b8a2-4aeb-b0a8-7540b5faf179
pero solo tomas el id.
Luego te dirijes al app.json que esta dentro de agrotic, te ubica en "Extras" y en 'projectId' remplaza el id que esta ahi y pones el nuevo que copiaste del paso N.2.

Luego vas a tomar ese nombre del proyecto que hiciste y lo vas a poner en el app.json que se encuentra dentro de agrotic, te ubicas en 'Expo' en la linea que dice slug y cambias ese nombre que tiene por el nombre del Proyecto que creaste

### Iniciar sesión en Expo
Inicia sesión en tu cuenta de Expo:

```bash
eas login
```
ingresas tus credenciales:


### Construir el APK
Ejecuta el comando para construir el APK en modo producción:

```bash
eas build --platform android --profile preview
```
Te aparecera una pregunta tipo: Generate a new Android Keystore? : Y/n y le daras en Y

Esto generará el archivo APK que podrás descargar desde el panel de Expo o el enlace proporcionado en la terminal, tambien puedes escanear el codigo QR.


