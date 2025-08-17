import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyStatic from '@fastify/static';
import * as EndPoints from './endpoint.js';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import multipart from '@fastify/multipart';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = Fastify({
	logger: false
});

const staticPath = path.join(__dirname, '..', 'website');

server.register(fastifyStatic, {
	root: path.join(__dirname, '..', 'website'),
});



server.setNotFoundHandler(async (request: FastifyRequest, reply: FastifyReply) => {
	return reply.sendFile('index.html');
});

function setEndPoints(): void {

	/*	Create EndPoints Here 
	
	new EndPoints.SeeAllUsersEndpoint(
		"/usermanagement/front/get/users",
		"Failed to retrieve users"
	);
	
	*/
	//examples
	new EndPoints.AccessComponentEndpoint(
		"/components/:name",
		"Unknown error."
	);

	new EndPoints.AccessLoginEndpoint(
		"/access/login",
		"Unknown error."
	);

	new EndPoints.AccessSigninEndpoint(
		"/access/signin",
		"Unknown error."
	);

	new EndPoints.PostAvatarEndpoint(
		"/post/avatar",
		"Failed to upload avatar"
	);

	new EndPoints.DeleteAvatarEndpoint(
		"/delete/avatar",
		"Failed to delete avatar"
	);

	EndPoints.Endpoint.enableAll(server);
}

async function start() {
	try {
		await server.register(multipart);
		setEndPoints();


		await server.listen({ port: 3000, host: '0.0.0.0' });
	} catch (err) {
		//server.log.error(err);
		process.exit(1);
	}
}

start();
