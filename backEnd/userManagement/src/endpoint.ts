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

export class HelloEndpoint extends Endpoint {
	add(server: any): void {
		server.get(this.path, async (request: any, reply: any) => {
			try {
				reply.send({ message: 'Hello, World!' });
			} catch (error) {
				server.log.error(`HelloEndpoint: ${this.errorMsg} - `, error);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
			}
		});
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

export class SeeProfileEndpoint extends Endpoint {
	add(server: any): void {
		server.get(this.path, async (request: any, reply: any) => {
			const userId = request.query.user;
			if (!userId) {
				reply.status(400).send({ error: 'User ID is required' });
				return;
			}
			const response = await fetch(`http://dataBase:3000/database/front/get/profile?user=${userId}`, {
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

export class CreateUserEndpoint extends Endpoint {
	add(server: any): void {
		server.post(this.path, async (request: any, reply: any) => {
			const name = request.body.name;
			const pass = request.body.pass;
			if (!name || !pass) {
				reply.status(400).send({ error: 'Name and password are required' });
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
			if (data.length > 0) {
				reply.status(400).send({ error: 'User already exists' });
				return;
			}
			// const hashedPass = await bcrypt.hash(pass, 10);
			const postResponse = await fetch('http://dataBase:3000/database/front/post/user', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, pass })
			});
			if (!postResponse.ok) {
				server.log.error(`CreateUserEndpoint: ${this.errorMsg} - `, postResponse.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			reply.send({ message: 'User created successfully'});
		});
	}
}