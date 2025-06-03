import Fastify from 'fastify';
import * as EndPoints from './endpointWS'

const server = Fastify({
	logger: true 
});

function setEndPoints(): void {
	new EndPoints.getEndpointWS('/pong', 'Error al obtener el endpoint de pong');
	EndPoints.EndpointWS.enableAll(server);
}

async function start() {

	server.register(require('@fastify/websocket'));

	setEndPoints();

	try {
		await server.listen({ port: 3000, host: '0.0.0.0' });
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
}

start();
