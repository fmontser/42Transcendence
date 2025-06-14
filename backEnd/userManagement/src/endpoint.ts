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
			const response = await fetch('http://dataBase:3000/get/users', {
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
			const response = await fetch('http://dataBase:3000/get/profiles', {
				method: 'GET'});
			if (!response.ok) {
				server.log.error(`SeeAllProfilesEndpoint: ${this.errorMsg} - `, response.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			const data = await response.json();
			reply.send(data);
		});
	}
}

export class SeeAllFriendsEndpoint extends Endpoint {
	add(server: any): void {
		server.get(this.path, async (request: any, reply: any) => {
			const response = await fetch('http://dataBase:3000/get/friends', {
				method: 'GET'});
			if (!response.ok) {
				server.log.error(`SeeAllFriendsEndpoint: ${this.errorMsg} - `, response.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			const data = await response.json();
			reply.send(data);
		});
	}
}

export class SeePseudosEndpoint extends Endpoint {
	add(server: any): void {
		server.get(this.path, { preHandler: server.authenticate }, async (request: any, reply: any) => {
			const id = request.user.id;
			const response = await fetch(`http://dataBase:3000/get/pseudos?id=${id}`, {
				method: 'GET'});
			if (!response.ok) {
				server.log.error(`SeePseudosEndpoint: ${this.errorMsg} - `, response.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			const data = await response.json();
			if (data === "[]") {
				reply.status(404).send({ error: 'No pseudos found' });
				return;
			}
			console.log(data);
			reply.send(data);
		});
	}	
}

export class SeeProfileEndpoint extends Endpoint {
	add(server: any): void {
		server.get(this.path, async (request: any, reply: any) => {
			const id = request.query.id;
			if (!id) {
				reply.status(400).send({ error: 'User ID is required' });
				return;
			}
			const response = await fetch(`http://dataBase:3000/get/profile?user=${id}`, {
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

export class CreateFriendshipEndpoint extends Endpoint {
	add(server: any): void {
		server.post(this.path, { preHandler: server.authenticate }, async (request: any, reply: any) => {
			const user = request.user;
			const friendPseudo = request.body.targetPseudo;
			if (!friendPseudo) {
				reply.status(400).send({ error: 'Friend Pseudo is required' });
				return;
			}

			const response = await fetch(`http://dataBase:3000/get/user_id_from_pseudo?user=${friendPseudo}`, {
				method: 'GET'});
			if (!response.ok) {
				server.log.error(`CreateFriendshipEndpoint: ${this.errorMsg} - `, response.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			const data = await response.json();
			if (data.length === 0) {
				reply.status(404).send({ error: 'Friend not found' });
				return;
			}
			const friendId = data[0].user_id;
			console.log(`Creating friendship between user ${user.id} and friend ${friendId}`);
			if (friendId === user.id) {
				reply.status(400).send({ error: 'You cannot befriend yourself' });
				return;
			}
			const friendshipResponse = await fetch('http://dataBase:3000/post/friendship', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId: user.id, friendId })
			});
			if (!friendshipResponse.ok) {
				server.log.error(`CreateFriendshipEndpoint: ${this.errorMsg} - `, friendshipResponse.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			reply.send({ message: 'Friendship created successfully' });
		});
	}
}

export class ModifyBioEndpoint extends Endpoint {
	add(server: any): void {
		server.patch(this.path, { preHandler: server.authenticate }, async (request: any, reply: any) => {
			const user = request.user;
			const bio = request.body.bio;
			if (!bio) {
				reply.status(400).send({ error: 'Bio is required' });
				return;
			}
			const response = await fetch('http://dataBase:3000/patch/bio', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ bio, id: user.id })

			});
			if (!response.ok) {
				server.log.error(`ModifyBioEndpoint: ${this.errorMsg} - `, response.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			reply.send({ message: 'Bio updated successfully' });
		});
	}
}

export class ModifyPseudoEndpoint extends Endpoint {
	add(server: any): void {
		server.patch(this.path, { preHandler: server.authenticate }, async (request: any, reply: any) => {
			const user = request.user;
			const pseudo = request.body.pseudo;
			if (!pseudo) {
				reply.status(400).send({ error: 'Pseudo is required' });
				return;
			}
			const response = await fetch('http://dataBase:3000/patch/pseudo', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ pseudo, id: user.id })

			});
			if (!response.ok) {
				server.log.error(`ModifyPseudoEndpoint: ${this.errorMsg} - `, response.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			reply.send({ message: 'Pseudo updated successfully' });
		});
	}
}

export class DeleteUserEndpoint extends Endpoint {
	add(server: any): void {
		server.delete(this.path, { preHandler: server.authenticate }, async (request: any, reply: any) => {
			const user = request.user;
			const response = await fetch(`http://dataBase:3000/delete/user`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: user.id })
			});
			if (!response.ok) {
				server.log.error(`DeleteUserEndpoint: ${this.errorMsg} - `, response.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			const response2 = await fetch(`http://dataBase:3000/delete/profile`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: user.id })
			});
			if (!response2.ok) {
				server.log.error(`DeleteUserEndpoint: ${this.errorMsg} - `, response2.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			const response3 = await fetch(`http://dataBase:3000/delete/friendships`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId: user.id, friendId: user.id})
			});
			if (!response3.ok) {
				server.log.error(`DeleteUserEndpoint: ${this.errorMsg} - `, response3.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			reply.clearCookie('token', {
				httpOnly: true,
				secure: true,      // à mettre sur true en production (HTTPS)
				sameSite: 'lax',
			})
			.send({ message: 'User deleted successfully' });
		});
	}
}

export class LogInEndpoint extends Endpoint {
	add(server: any): void {
		server.post(this.path, async (request:any, reply:any) => {
			const name = request.body.name;
			const pass = request.body.pass;

			const response = await fetch(`http://dataBase:3000/get/user?user=${name}`, {
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
			const id = data[0].id;
			console.log(data[0].pass, pass);

			if (pass === data[0].pass) { // Remplace par une vraie vérification de mot de passe
				const token = server.jwt.sign({ id });

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
			const user = request.user;
			reply.send({ name: user.id });
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

			const response = await fetch(`http://dataBase:3000/get/user_id?name=${name}`, {
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


			const postUserResponse = await fetch('http://dataBase:3000/post/user', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, pass })
			});
			if (!postUserResponse.ok) {
				server.log.error(`CreateUserEndpoint: ${this.errorMsg} - `, postUserResponse.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}

			const idResponse = await fetch(`http://dataBase:3000/get/user_id?user=${name}`, {
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

			const postProfileResponse = await fetch('http://dataBase:3000/post/profile', {
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