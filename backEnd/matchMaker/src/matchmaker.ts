import Fastify from 'fastify';
import * as EndPoints from './endpoint'
import { MatchManager } from './matchManager';

const server = Fastify({
	logger: true 
});

export const matchManager = new MatchManager();

function setEndPoints(): void {
	new EndPoints.PostMatchRequest('/matchmaker/front/post/match', 'Error obtaining post match endpoint');

	new EndPoints.PostTournamentRequest('/matchmaker/front/post/tournament', 'Error obtaining post tournament endpoint');

	new EndPoints.PostHotSeatTournamentRequest('/matchmaker/front/post/hotseat', 'Error obtaining post hotseat endpoint');

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
