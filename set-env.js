import { existsSync, mkdirSync, writeFile } from 'fs';

// 1. Aquí le decimos a Node exactamente DÓNDE guardar el archivo
const targetPath = './src/environments/environment.prod.ts';

// 2. Aquí guardamos la estructura de las variables de entorno que queremos en el archivo
const envConfigFile = `
export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL || ""}'
};
`;

// 3. Este paso crea la carpeta /environments en el servidor si no existe
if (!existsSync('./src/environments')) {
  mkdirSync('./src/environments', { recursive: true });
}

// 4. Este paso toma el texto y lo escribe físicamente en el disco
writeFile(targetPath, envConfigFile, function (err) {
  if (err) {
    console.error('Error fatal al generar environment.prod.ts:', err);
  } else {
    console.log('¡Éxito! El archivo environment.prod.ts se creó correctamente en el servidor.');
  }
});
