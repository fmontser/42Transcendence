import * as EndPoints from './endpoint'
import FormBodyPlugin from '@fastify/formbody';
import Fastify from 'fastify';
// import bcrypt from 'bcrypt';

const server = Fastify({
	logger: true 
});

function setEndPoints(): void {
	new EndPoints.HelloEndpoint(
		"/usermanagement/front/say/hello",
		"Failed to say hello"
	);

	new EndPoints.SeeAllUsersEndpoint(
		"/usermanagement/front/get/users",
		"Failed to retrieve users"
	);

	new EndPoints.SeeProfileEndpoint(
		"/usermanagement/front/get/profile",
		"Failed to retrieve user profile"
	);

	new EndPoints.CreateUserEndpoint(
		"/usermanagement/front/post/create",
		"Failed to create user"
	);

	EndPoints.Endpoint.enableAll(server);
}

async function start() {

	setEndPoints();

	try {
		server.register(FormBodyPlugin);
		await server.listen({ port: 3000, host: '0.0.0.0' });
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
}

start();
