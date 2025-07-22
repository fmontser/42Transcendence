import * as EndPoints from './endpoint'
import FormBodyPlugin from '@fastify/formbody';
import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import cors from '@fastify/cors';
import fastifyWebsocket from '@fastify/websocket';

const server = Fastify({
	logger: true 
});

function setEndPoints(): void {

	/*	Create EndPoints Here 
	
	new EndPoints.SeeAllUsersEndpoint(
		"/usermanagement/front/get/users",
		"Failed to retrieve users"
	);
	
	*/
	//TODO este endpoint no tendria que estar expuesto!! uso exclusivo del backend (y /userauthentication/ es redundante..)
	new EndPoints.ProfileEndpoint(
		"/userauthentication/front/get/profile_session_with_token",
		"Failed to retrieve user profile"
	);	
	

	new EndPoints.CreateUserEndpoint(
		"/userauthentication/front/post/create",
		"Failed to create user"
	);

	new EndPoints.GoogleAuthEndpoint(
		"/userauthentication/front/post/google_connect",
		"Failed to connect user with Google",
	);

	new EndPoints.LogOutEndpoint(
		"/userauthentication/front/post/logout",
		"Failed to log out user"
	);

	new EndPoints.LogInEndpoint(
		"/userauthentication/front/post/login",
		"Failed to log in user"
	);

	new EndPoints.SeeAllUsersEndpoint(
		"/userauthentication/front/get/users",
		"Failed to retrieve users"
	);

	new EndPoints.WebSocketStatusEndpoint(
    	"/userauthentication/front/ws/status",
    	"Failed to handle websocket status"
  	);

	EndPoints.Endpoint.enableAll(server);
}

async function start() {

	try {
		await server.register(FormBodyPlugin);
		await server.register(cors, {
			origin: 'https://localhost',
			credentials: true
		});
		await server.register(fastifyCookie);
		await server.register(fastifyJwt, {
			secret: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eeyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0zzafemlzfzeanflzanlfknzaelnflzakenflkdFAZEGreglrngAEg12345grlek3124dsqknZA1234lkqndv231dfqdsklnlaez2134geklrnbp', // TODO put in a .env file
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
		
		await server.register(fastifyWebsocket);

		setEndPoints();
		await server.listen({ port: 3000, host: '0.0.0.0' });
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
}

start();
