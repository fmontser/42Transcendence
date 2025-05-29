import Fastify from 'fastify';
import * as sqlite3 from 'sqlite3';

const server = Fastify({
	logger: true 
});

function initDataBase(): void {
	const db = new sqlite3.Database('./mydatabase.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
		if (err) {
			console.error("Error al abrir/crear la base de datos:", err.message);
		} else {
			console.log('Conectado a la base de datos SQLite.');
			// Ejemplo: crear una tabla
			db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)', (errRun) => {
				if (errRun) {
					return console.error("Error al crear tabla:", errRun.message);
				}
				console.log("Tabla 'users' verificada/creada.");
	
				// No olvides cerrar la base de datos cuando termines (ej. en un servidor, al apagarlo)
				// db.close();
			});
		}
	});
}

async function start() {

	initDataBase();

	try {
		await server.listen({ port: 3000, host: '0.0.0.0' });
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
}

start();
