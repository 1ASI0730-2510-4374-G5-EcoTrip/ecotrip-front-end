# Usar imagen base de Node.js
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluidas las de desarrollo para el build)
RUN npm install

# Copiar el resto de archivos del proyecto
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Limpiar dependencias de desarrollo después del build
RUN npm prune --production

# Establecer variable de entorno para producción
ENV NODE_ENV=production

# Exponer puerto
EXPOSE $PORT

# Comando para iniciar la aplicación usando tu server.js existente
CMD ["node", "server.js"]
