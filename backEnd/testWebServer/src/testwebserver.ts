import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path'; // FIX: Import the 'path' module
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as EndPoints from './endpoint'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = Fastify({
	logger: true // It's good practice to enable logging
});


//    Serves files from the 'public' directory
server.register(fastifyStatic, {
	root: path.join(__dirname, '..', 'website'),
	// Optional: All other fastify-static options can be specified here
});



server.setNotFoundHandler(async (request: FastifyRequest, reply: FastifyReply) => {
	// The client-side router will handle the 404
	return reply.sendFile('index.html');
});

// function setEndPoints(): void {

// 	/*	Create EndPoints Here 
	
// 	new EndPoints.SeeAllUsersEndpoint(
// 		"/usermanagement/front/get/users",
// 		"Failed to retrieve users"
// 	);
	
// 	*/
// 	//examples
// 	new EndPoints.CreateUserEndpoint(
// 		"/userauthentication/front/post/create",
// 		"Failed to create user"
// 	);

// 	new EndPoints.GoogleAuthEndpoint(
// 		"/userauthentication/front/post/google_connect",
// 		"Failed to connect user with Google",
// 	);

// 	new EndPoints.LogOutEndpoint(
// 		"/userauthentication/front/post/logout",
// 		"Failed to log out user"
// 	);

// 	new EndPoints.LogInEndpoint(
// 		"/userauthentication/front/post/login",
// 		"Failed to log in user"
// 	);

// 	new EndPoints.SeeAllUsersEndpoint(
// 		"/userauthentication/front/get/users",
// 		"Failed to retrieve users"
// 	);

// 	EndPoints.Endpoint.enableAll(server);
// }

async function start() {
	try {
		console.log(path.dirname);
		await server.listen({ port: 3000, host: '0.0.0.0' });
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
}

start();
