const bcrypt = require('bcrypt');

import { OAuth2Client } from 'google-auth-library';


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


// User Status Management
const connectedUsers = new Map<string, Set<any>>();

async function broadcast(id: string, status: boolean): Promise<void> {
  const response = await fetch(
    `http://dataBase:3000/get/friends_user?id1=${id}&id2=${id}&id3=${id}&id4=${id}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    console.error(`Failed to retrieve friends for user ${id}:`, response.statusText);
    return;
  }

  const friends = await response.json();
  const friendsIds = friends.map((friend: { id: string }) => friend.id);
  console.log(`friends of ${id}: ${friendsIds}`);

  if (friendsIds.length === 0) {
    console.log(`No friends found for user ${id}`);
    return;
  }

  for (const userId of friendsIds) {
    const userSockets = connectedUsers.get(String(userId));
    if (userSockets && userSockets.size > 0) {
      for (const socket of userSockets) {
        socket.send(JSON.stringify({ id, status }));
        console.log(`Message envoyé à ${userId}`);
      }
    } else {
      console.log(`Aucun socket trouvé pour l'utilisateur ${userId}`);
    }
  }
}

export class WebSocketStatusEndpoint extends Endpoint {
  add(server: any): void {
    server.get(this.path, { websocket: true }, async (socket: any, req: any) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const userId = url.searchParams.get("userId");
      if (!userId) {
        socket.close(1008, "Missing userId parameter");
        return;
      }

      if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, new Set());
        broadcast(userId, true);
      }

      connectedUsers.get(userId)!.add(socket);

      console.log(`Nouvelle connexion WebSocket pour userId: ${userId} (total onglets: ${connectedUsers.get(userId)!.size})`);

      socket.on('close', () => {
        const userSockets = connectedUsers.get(userId);
        if (userSockets) {
          userSockets.delete(socket);

          if (userSockets.size === 0) {
            connectedUsers.delete(userId);
            broadcast(userId, false);
            console.log(`Dernier onglet fermé pour userId: ${userId} → Déconnecté`);
          } else {
            console.log(`Onglet fermé pour userId: ${userId} (reste ${userSockets.size} onglets)`);
          }
        }
      });
    });
  }
}

export class ProfileEndpoint extends Endpoint {
	add(server: any): void {
		server.get(this.path, async (request:any, reply:any) => {
			const token = request.query.token
			console.log(`Token received: ${token}`);
			try {
				const decoded = server.jwt.verify(token);
				console.log('Decoded token:', decoded);
				reply.send({ id: decoded.id });
			} catch (err) {
				reply.status(401).send({ error: 'Invalid token' });
				return;
			}			
		});
	}
}

export class SeeAllUsersEndpoint extends Endpoint {
	add(server: any): void {
		server.get(this.path, async (request: any, reply: any) => {
			console.log(`SeeAllUsersEndpoint: ${this.path} called`);
			const response = await fetch('http://dataBase:3000/get/users', {
				method: 'GET'});
			if (!response.ok) {
				server.log.error(`SeeAllUsersEndpoint: ${this.errorMsg} - `, response.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			const data = await response.json();
			console.log('SeeAllUsersEndpoint: Data received:', data);
			reply.send(data);
		});
	}
}

import { randomUUID } from "crypto";
export class GoogleAuthEndpoint extends Endpoint {
	private googleClient: OAuth2Client;

	constructor(path: string, errorMsg: string) {
		super(path, errorMsg);
		this.googleClient = new OAuth2Client("826866714242-u7rb76no703g0n8vauoq926n9cdkfgv3.apps.googleusercontent.com");//TODO: Move to .env file
		Endpoint.list.add(this);
	}
	
	add(server: any): void {
		server.post(this.path, async (request: any, reply: any) => {
			const token = request.body.credential;
			if (!token) {
				reply.status(400).send({ error: 'Missing credential' });
				return;
			}

			try {
				const ticket = await this.googleClient.verifyIdToken({
					idToken: token,
					audience: this.googleClient._clientId
				});
				const payload = ticket.getPayload();
				if (!payload || !payload.email) {
					reply.status(401).send({ error: 'Invalid Google token' });
					return;
				}

				const userEmail = payload.email;
				// const userName = payload.name || '';
				// const userId = payload.sub;

				// Vérifie si l'utilisateur existe déjà dans la base
				const response = await fetch(`http://dataBase:3000/get/user?user=${userEmail}`);
				let data = await response.json();
				let created = false;

				if (data.length === 0) {
					created = true;
					// Crée un nouvel utilisateur si inexistant
					await fetch(`http://dataBase:3000/post/user`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							user: userEmail,
							pass: '', // Pas de mot de passe pour les utilisateurs Google
							login_method: 'google'
						})
					});
					
				}

				const idResponse = await fetch(`http://dataBase:3000/get/user_id?user=${userEmail}`, {
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

				if (created) {
					// Crée un profil pour l'utilisateur
					const defaultPseudo = "user-" + randomUUID().slice(0, 6); // user-a1b2c3
					const postProfileResponse = await fetch('http://dataBase:3000/post/profile', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ id, pseudo: defaultPseudo })
					});
					if (!postProfileResponse.ok) {
						server.log.error(`CreateUserEndpoint: ${this.errorMsg} - `, postProfileResponse.statusText);
						reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
						return;
					}

					console.log(`User ${userEmail} created successfully with ID ${id}`);
					reply.send({ message: 'User created successfully'});
				}

				const tokenJwt = server.jwt.sign({ id });

				reply.setCookie('token', tokenJwt, {
					httpOnly: true,
					secure: true,
					sameSite: 'lax',
					path: '/',
					maxAge: 3600
				}).send({ success: true });

			} catch (err) {
				server.log.error('Google login failed', err);
				reply.status(401).send({ error: 'Authentication failed' });
			}
		});
	}
}

export class LogOutEndpoint extends Endpoint {
	add(server: any): void {
		server.post(this.path, async (request: any, reply: any) => {
			console.log(`LogOutEndpoint: ${this.path} called`);

			// Efface le cookie en le remplaçant par un vide et maxAge 0
			reply
				.clearCookie('token', {
					httpOnly: true,
					secure: true, // à garder pour production
					sameSite: 'lax',
					path: '/',
					maxAge: 0 // Efface le cookie immédiatement
				})
				.send({ success: true, message: 'Logged out successfully' });
		});
	}
}

export class LogInEndpoint extends Endpoint {
	add(server: any): void {
		server.post(this.path, async (request:any, reply:any) => {
			console.log(`LogInEndpoint: ${this.path} called`);
			const name = request.body.name;
			const pass = request.body.pass;

			const response = await fetch(`http://dataBase:3000/get/user?user=${name}`, {
				method: 'GET'});
			if (!response.ok) {
				server.log.error(`LogInEndpoint: ${this.errorMsg} - `, response.statusText);
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
			if (data[0].login_method !== 'local') {
				reply.status(403).send({ error: 'User login method is not local' });
				return;
			}
			console.log(data[0].pass, pass);

			const isValidPassword = await bcrypt.compare(pass, data[0].pass);

			if (isValidPassword) {
				const id = data[0].id;

				const two_fa = data[0].two_fa;
				if (two_fa) {
					const token = server.jwt.sign({ id, twofa: true }, { expiresIn: '5m' });
					reply.send({ token, twofaRequired: true });
				}
				else {
					const token = server.jwt.sign({ id });

					console.log(`User ${name} logged in successfully, token: ${token}`);
					reply.setCookie('token', token, {
						httpOnly: true,
						secure: true,
						sameSite: 'lax',
						path: '/',
						maxAge: 3600 * 24 * 30 * 3       // 1h ..o..un trimestre...//TODO restablecer
					})
					.send({ success: true });
				}
			} else {
				reply.status(401).send({ error: 'Invalid credentials' });
			}
		});
	}
}

export class CreateUserEndpoint extends Endpoint {
	add(server: any): void {
		server.post(this.path, async (request: any, reply: any) => {
			console.log(`CreateUserEndpoint: ${this.path} called`);
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

			const saltRounds = 10;
			try {
				const hashedPassword = await bcrypt.hash(pass, saltRounds);

				const postUserResponse = await fetch('http://dataBase:3000/post/user', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ name, hashedPassword, login_method: 'local' })
				});
				if (!postUserResponse.ok) {
					server.log.error(`CreateUserEndpoint: ${this.errorMsg} - `, postUserResponse.statusText);
					reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
					return;
				}
			} catch (err) {
				server.log.error(`CreateUserEndpoint: ${this.errorMsg} - `, err);
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

			const defaultPseudo = "user-" + randomUUID().slice(0, 6); // user-a1b2c3
			const postProfileResponse = await fetch('http://dataBase:3000/post/profile', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id, pseudo: defaultPseudo })
			});
			if (!postProfileResponse.ok) {
				server.log.error(`CreateUserEndpoint: ${this.errorMsg} - `, postProfileResponse.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}

			console.log(`User ${name} created successfully with ID ${id}`);
			reply.send({ message: 'User created successfully'});
		});
	}
}

/*export class LogInEndpoint extends Endpoint {
	add(server: any): void {
		server.post(this.path, async (request:any, reply:any) => {
			console.log(`LogInEndpoint: ${this.path} called`);
			const name = request.body.name;
			const pass = request.body.pass;

			const response = await fetch(`http://dataBase:3000/get/user?user=${name}`, {
				method: 'GET'});
			if (!response.ok) {
				server.log.error(`LogInEndpoint: ${this.errorMsg} - `, response.statusText);
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
			if (data[0].login_method !== 'local') {
				reply.status(403).send({ error: 'User login method is not local' });
				return;
			}
			console.log(data[0].pass, pass);

			const isValidPassword = await bcrypt.compare(pass, data[0].pass);

			if (isValidPassword) {
				const id = data[0].id;
				const token = server.jwt.sign({ id });

				console.log(`User ${name} logged in successfully, token: ${token}`);
				reply.setCookie('token', token, {
					httpOnly: true,
					secure: true,
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
} */