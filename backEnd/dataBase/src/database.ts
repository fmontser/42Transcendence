import Fastify from 'fastify';

import { writeFileSync } from 'fs';
import { join } from 'path';

const server = Fastify({
	logger: true 
});

async function start() {

const outputDir = '/usr/src/app/data'; // Ruta donde apunta tu volumen
const fileName = 'test.txt';
const filePath = join(outputDir, fileName);

try {
  writeFileSync(filePath, '¡Hola desde TypeScript en Docker!\n', 'utf-8');
  console.log(`Archivo guardado en ${filePath}`);
} catch (err) {
  console.error('Error al guardar el archivo:', err);
}


	try {
		await server.listen({ port: 3000, host: '0.0.0.0' });
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
}

start();
