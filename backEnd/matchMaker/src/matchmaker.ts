import Fastify from 'fastify';
import * as EndPoints from './endpoint'
import { MatchManager } from './match';

const server = Fastify({
	logger: true 
});

export const matchManager = new MatchManager();

function setEndPoints(): void {
	new EndPoints.PostMatchRequest('/matchmaker/front/post/match', 'Error obtaining post match endpoint');

	EndPoints.Endpoint.enableAll(server);
}

async function start() {

	await server.register(require('@fastify/websocket'));
	setEndPoints();

	console.log("Enpoints registered:\n" + server.printRoutes());

	try {
		await server.listen({ port: 3000, host: '0.0.0.0' });
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
}

start();
