// import bcrypt from 'bcryptjs';

export abstract class Endpoint {

	protected static list: Set<Endpoint> = new Set();
	protected path: string;
	protected errorMsg: string;

	constructor(path: string, errorMsg: string	) {
		this.path = path;
		this.errorMsg = errorMsg;
		Endpoint.list.add(this);
	}
	
	protected abstract add(server: any): void;

	public static enableAll(server: any): void {
		for (const endpoint of Endpoint.list)
			endpoint.add(server);
	}
}

export class SeeAllUsersEndpoint extends Endpoint {
	add(server: any): void {
		server.get(this.path, async (request: any, reply: any) => {
			const response = await fetch('http://dataBase:3000/database/front/get/users', {
				method: 'GET'});
			if (!response.ok) {
				server.log.error(`SeeAllUsersEndpoint: ${this.errorMsg} - `, response.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			const data = await response.json();
			reply.send(data);
		});
	}
}

export class SeeAllProfilesEndpoint extends Endpoint {
	add(server: any): void {
		server.get(this.path, async (request: any, reply: any) => {
			const response = await fetch('http://dataBase:3000/database/front/get/profiles', {
				method: 'GET'});
			if (!response.ok) {
				server.log.error(`SeeAllUsersEndpoint: ${this.errorMsg} - `, response.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			const data = await response.json();
			reply.send(data);
		});
	}
}

export class SeeProfileEndpoint extends Endpoint {
	add(server: any): void {
		server.get(this.path, async (request: any, reply: any) => {
			const name = request.query.user;
			if (!name) {
				reply.status(400).send({ error: 'User ID is required' });
				return;
			}
			const response = await fetch(`http://dataBase:3000/database/front/get/profile?user=${name}`, {
				method: 'GET'});
			if (!response.ok) {
				server.log.error(`SeeProfileEndpoint: ${this.errorMsg} - `, response.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			const data = await response.json();
			if (data.length === 0) {
				reply.status(404).send({ error: 'User not found' });
				return;
			}
			reply.send(data);
		});
	}
}

export class LogInEndpoint extends Endpoint {
	add(server: any): void {
		server.post(this.path, async (request:any, reply:any) => {
			const name = request.body.name;
			const pass = request.body.pass;

			const response = await fetch(`http://dataBase:3000/database/front/get/user?user=${name}`, {
				method: 'GET'});
			if (!response.ok) {
				server.log.error(`SeeProfileEndpoint: ${this.errorMsg} - `, response.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			const data = await response.json();

			console.log(request.body);

			console.log(data);
			if (data.length === 0) {
				reply.status(404).send({ error: 'User not found' });
				return;
			}

			console.log(data[0].pass, pass);

			if (pass === data[0].pass) { // Remplace par une vraie vérification de mot de passe
				const token = server.jwt.sign({ name });

				reply.setCookie('token', token, {
					httpOnly: true,
					secure: true,      // à mettre sur true en production (HTTPS)
					sameSite: 'lax',
					path: '/',
					maxAge: 3600       // 1h
				})
				.send({ success: true });
			} else {
				reply.status(401).send({ error: 'Invalid credentials' });
			}
		});
	}
}

export class ProfileEndpoint extends Endpoint {
	add(server: any): void {
		server.get(this.path, { preHandler: server.authenticate }, async (request:any, reply:any) => {
			// const name = request.user.name;
			console.log('Cookies reçus:', request.cookies);
  			console.log('Utilisateur JWT:', request.user);
			reply.send("test");
		});
	}
}

export class CreateUserEndpoint extends Endpoint {
	add(server: any): void {
		server.post(this.path, async (request: any, reply: any) => {
			const name = request.body.name;
			const pass = request.body.pass;
			if (!name || !pass) {
				reply.status(400).send({ error: 'Name and password are required' });
				return;
			}

			const response = await fetch(`http://dataBase:3000/database/front/get/user_id?name=${name}`, {
				method: 'GET'});
			if (!response.ok) {
				server.log.error(`SeeProfileEndpoint: ${this.errorMsg} - `, response.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			const data = await response.json();
			if (data.length > 0) {
				reply.status(404).send({ error: "User already exist" });
				return;
			}


			const postUserResponse = await fetch('http://dataBase:3000/database/front/post/user', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, pass })
			});
			if (!postUserResponse.ok) {
				server.log.error(`CreateUserEndpoint: ${this.errorMsg} - `, postUserResponse.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}

			const idResponse = await fetch(`http://dataBase:3000/database/front/get/user_id?user=${name}`, {
				method: 'GET'});
			if (!idResponse.ok) {
				server.log.error(`SeeProfileEndpoint: ${this.errorMsg} - `, idResponse.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			const idData = await idResponse.json();
			const id = idData[0]?.id || null;
			if (!id) {
				reply.status(404).send({ error: 'User not found' });
				return;
			}

			const postProfileResponse = await fetch('http://dataBase:3000/database/front/post/profile', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id })
			});
			if (!postProfileResponse.ok) {
				server.log.error(`CreateUserEndpoint: ${this.errorMsg} - `, postProfileResponse.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}


			reply.send({ message: 'User created successfully'});
		});
	}
}