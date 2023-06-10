# Pay Form

## Descripción

Este proyecto es una aplicación de formulario de pago con integración con Mercado Pago

## Dependencias

### Dependencias de desarrollo

- [cross-env](https://www.npmjs.com/package/cross-env): Herramienta para establecer variables de entorno de manera
  multiplataforma.
- [html-minifier](https://www.npmjs.com/package/html-minifier): Minificador de HTML para reducir el tamaño de los
  archivos HTML generados.
- [http-server](https://www.npmjs.com/package/http-server): Servidor HTTP simple para servir archivos estáticos.

### Dependencias de producción

- [dotenv](https://www.npmjs.com/package/dotenv): Cargador de variables de entorno desde un archivo `.env`.
- [dotenv-expand](https://www.npmjs.com/package/dotenv-expand): Extensión para cargar variables de entorno con
  interpolaciones.
- [fs-extra](https://www.npmjs.com/package/fs-extra): Librería adicional para el manejo de archivos en Node.js.

## Iniciar el proyecto

Sigue estos pasos para iniciar el proyecto:

1. Clona el repositorio en tu máquina local.
2. Instala las dependencias ejecutando el siguiente comando:
   ``npm install``
3. Crea un archivo `.env` en la raíz del proyecto y configura las variables de entorno necesarias.
4. Ejecuta el siguiente comando para compilar el proyecto en modo producción:
   ``npm run build:prod``
5. Puedes ejecutar el siguiente comando para compilar el proyecto en modo local: ``npm run build:local``
6. Inicia el servidor HTTP ejecutando el siguiente comando: ``npm start``
7. Abre tu navegador web y accede a la URL proporcionada por el servidor HTTP para ver la aplicación de formulario de
   pago.

