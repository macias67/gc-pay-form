require('dotenv').config({path: process.env.ENV_FILE});

const fs = require('fs');
const {minify} = require('terser');
const fse = require('fs-extra');

const inputFile = 'src/app.js';
const outputDir = 'build';
const htmlFile = 'src/index.html';

// Eliminar archivos anteriores en la carpeta "build" (agregar esta sección)
fse.emptyDirSync(outputDir);

// Genera un ID único para el archivo minificado
const uniqueId = `app_${Date.now()}`;

// Genera el nombre del archivo minificado usando el ID único
const outputFile = `${uniqueId}.min.js`;

// Carga el archivo de origen
const sourceCode = fs.readFileSync(inputFile, 'utf8');

// Reemplaza las variables de entorno
const replacedCode = sourceCode.replace(/process\.env\.(\w+)/g, (match, variable) => {
    return JSON.stringify(process.env[variable]);
});

// Minifica el código
minify(replacedCode).then(({code}) => {
    // Guarda el archivo minificado
    fs.writeFileSync(`${outputDir}/${outputFile}`, code);

    // Actualiza el tag <script> en el archivo HTML
    const htmlContent = fs.readFileSync(htmlFile, 'utf8');
    const updatedHtmlContent = htmlContent.replace(
        /<script\s+id="app-script"\s+src="([^"]+)"><\/script>/,
        (match, srcAttribute) => {
            return `<script id="app-script" src="${outputFile}"></script>`;
        }
    );
    fs.writeFileSync(`${outputDir}/index.html`, updatedHtmlContent);
}).catch((error) => {
    console.error('Error al minificar el código:', error);
});
