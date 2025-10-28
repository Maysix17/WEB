FROM node:20-alpine

WORKDIR /app

# Copiar archivos de package para aprovechar cache de Docker
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar todo el código
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando para desarrollo con hot reload
CMD ["npm", "run", "start:dev"]