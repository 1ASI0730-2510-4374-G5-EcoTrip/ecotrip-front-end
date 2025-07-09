#!/bin/bash

# Script de despliegue para producción

echo " Iniciando despliegue para producción..."

# Instalar dependencias
echo " Instalando dependencias..."
npm install

# Construir el proyecto para producción
echo " Construyendo el proyecto..."
npm run build

# Iniciar el servidor de producción
echo " Iniciando servidor de producción..."
npm run start:prod
