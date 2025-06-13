import * as EndPoints from './endpoint'
import FormBodyPlugin from '@fastify/formbody';
import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import cors from '@fastify/cors';

// import bcrypt from 'bcrypt';

const server = Fastify({
	logger: true 
});

function setEndPoints(): void {

	new EndPoints.SeeAllUsersEndpoint(
		"/usermanagement/front/get/users",
		"Failed to retrieve users"
	);

	new EndPoints.SeeAllProfilesEndpoint(
		"/usermanagement/front/get/profiles",
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

	new EndPoints.LogInEndpoint(
		"/usermanagement/front/post/login",
		"Failed to log in user"
	);

	new EndPoints.ProfileEndpoint(
		"/usermanagement/front/get/profile_session",
		"Failed to retrieve user profile"
	);

	new EndPoints.ModifyBioEndpoint(
		"/usermanagement/front/put/modify_bio",
		"Failed to modify user bio"
	);

	new EndPoints.ModifyPseudoEndpoint(
		"/usermanagement/front/put/modify_pseudo",
		"Failed to modify user pseudo"
	);


	new EndPoints.DeleteUserEndpoint(
		"/usermanagement/front/delete/user",
		"Failed to delete user"
	);

	EndPoints.Endpoint.enableAll(server);
}

async function start() {

	try {
		await server.register(FormBodyPlugin);
		await server.register(cors, {
			origin: 'https://transcend.42.fr',
			credentials: true
		});
		await server.register(fastifyCookie);
		await server.register(fastifyJwt, {
			secret: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eeyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0zzafemlzfzeanflzanlfknzaelnflzakenflkdFAZEGreglrngAEg12345grlek3124dsqknZA1234lkqndv231dfqdsklnlaez2134geklrnbp', // à stocker dans un fichier .env
			cookie: {
				cookieName: 'token',
				signed: false
			}
		});
		server.decorate("authenticate", async (request:any, reply:any) => {
			try {
				await request.jwtVerify();
				console.log("User authenticated");
			} catch (err) {
				console.log(request.cookies.token);
				reply.status(401).send({ error: 'Unauthorized' });
			}
		});

		setEndPoints();
		await server.listen({ port: 3000, host: '0.0.0.0' });
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
}

start();