# Usar imagen base de Node.js estándar (no Alpine)
FROM node:18

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de archivos del proyecto
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Establecer variable de entorno para producción
ENV NODE_ENV=production

# Exponer puerto
EXPOSE $PORT

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
