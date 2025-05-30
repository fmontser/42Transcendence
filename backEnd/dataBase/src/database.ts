import Fastify from 'fastify';
import * as SQLite3 from 'sqlite3'; 

const server = Fastify({
	logger: true 
});

async function start() {



	try {
		await server.listen({ port: 3000, host: '0.0.0.0' });
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
}

start();
