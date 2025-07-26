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

import sharp from 'sharp';

export class ModifyAvatarEndpoint extends Endpoint {//TODO FRAN AVATAR
  add(server: any): void {
    server.patch(this.path, { preHandler: server.authenticate }, async (request: any, reply: any) => {
      console.log(`ModifyAvatarEndpoint: ${this.path} called`);
      const user = request.user;
	  const imageAvatar = request.body.image;
    //   const avatarBase64 = request.body.avatar; // envoyé par le front

    //   if (!avatarBase64) {
    //     reply.status(400).send({ error: 'Avatar is required' });
    //     return;
    //   }

	const nameAvatar = 'public/avatars/' + user.id + '.jpg';
      try {
        // // ✅ 1. Nettoyer la chaîne base64 (supprimer "data:image/png;base64," si présent)
        // const cleanedBase64 = avatarBase64.replace(/^data:image\/\w+;base64,/, '');
        
        // // ✅ 2. Convertir en Buffer brut
        // const buffer = Buffer.from(cleanedBase64, 'base64');

        // // ✅ 3. Redimensionner + compresser avec Sharp
        // const resized = await sharp(buffer)
        //   .resize(256, 256, { fit: 'cover' })  // carré 256×256
        //   .webp({ quality: 80 })               // format WebP compressé
        //   .toBuffer();

        // console.log(`Avatar compressé : ${resized.length} octets`);


        const response = await fetch('http://dataBase:3000/patch/avatar', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: nameAvatar, id: user.id })
        });

        if (!response.ok) {
          server.log.error(`ModifyAvatarEndpoint: ${this.errorMsg} - `, response.statusText);
          reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
          return;
        }
        reply.send({ message: 'Avatar updated successfully' });

		fetch('http://webServ:3000/post/avatar', {
			method: 'POST',
			headers: { 'Content-Type': 'image/jpeg' },
			body: JSON.stringify({ image: imageAvatar, name: nameAvatar })
		});

      } catch (err) {
        console.error('Erreor changing avatar:', err);
        reply.status(500).send({ error: 'Failed to process avatar image' });
      }



    });
  }
}

export class DeleteAvatarEndpoint extends Endpoint {
	add(server: any): void {
		server.delete(this.path, { preHandler: server.authenticate }, async (request: any, reply: any) => {
			console.log(`DeleteAvatarEndpoint: ${this.path} called`);
			const user = request.user;

			const response = await fetch(`http://dataBase:3000/delete/avatar`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: user.id })
			});
			if (!response.ok) {
				server.log.error(`DeleteAvatarEndpoint: ${this.errorMsg} - `, response.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			console.log(`Avatar deleted for user ${user.id}`);
			reply.send({ message: 'Avatar deleted successfully' });
		});
	}
}

export class SeeAllUsersEndpoint extends Endpoint {
	add(server: any): void {
		server.get(this.path, async (request: any, reply: any) => {
			console.log(`SeeAllUsersEndpoint: ${this.path} called`);
			const response = await fetch('../src/users', {
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

export class SeeAllProfilesEndpoint extends Endpoint {
	add(server: any): void {
		server.get(this.path, async (request: any, reply: any) => {
			console.log(`SeeAllProfilesEndpoint: ${this.path} called`);
			const response = await fetch('http://dataBase:3000/get/profiles', {
				method: 'GET'});
			if (!response.ok) {
				server.log.error(`SeeAllProfilesEndpoint: ${this.errorMsg} - `, response.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			const data = await response.json();
			console.log('SeeAllProfilesEndpoint: Data received:', data);
			reply.send(data);
		});
	}
}

export class SeeAllFriendsEndpoint extends Endpoint {
	add(server: any): void {
		server.get(this.path, async (request: any, reply: any) => {
			console.log(`SeeAllFriendsEndpoint: ${this.path} called`);
			const response = await fetch('http://dataBase:3000/get/friends', {
				method: 'GET'});
			if (!response.ok) {
				server.log.error(`SeeAllFriendsEndpoint: ${this.errorMsg} - `, response.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			const data = await response.json();
			console.log('SeeAllFriendsEndpoint: Data received:', data);
			reply.send(data);
		});
	}
}

export class SeePseudosEndpoint extends Endpoint {
	add(server: any): void {
		server.get(this.path, { preHandler: server.authenticate }, async (request: any, reply: any) => {
			console.log(`SeePseudosEndpoint: ${this.path} called`);
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
			console.log('SeePseudosEndpoint: Data received:', data);
			reply.send(data);
		});
	}	
}

export class SeeProfileEndpoint extends Endpoint {
	add(server: any): void {
		server.get(this.path, async (request: any, reply: any) => {
			console.log(`SeeProfileEndpoint: ${this.path} called`);
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
			console.log('SeeProfileEndpoint: Data received:', data);
			reply.send(data);
		});
	}
}

export class CreateFriendshipEndpoint extends Endpoint {
	add(server: any): void {
		server.post(this.path, { preHandler: server.authenticate }, async (request: any, reply: any) => {
			console.log(`CreateFriendshipEndpoint: ${this.path} called`);
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
				reply.status(400).send({ error: 'You cannot be friend yourself' });
				return;
			}
			let uid1 = Math.min(user.id, friendId);
			let uid2 = Math.max(user.id, friendId);
			const friendshipResponse = await fetch('http://dataBase:3000/post/friendship', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ uid1, uid2 , sender: user.id})
			});
			if (!friendshipResponse.ok) {
				server.log.error(`CreateFriendshipEndpoint: ${this.errorMsg} - `, friendshipResponse.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			console.log(`Friendship created between user ${user.id} and friend ${friendId}`);
			reply.send({ message: 'Friendship created successfully' });
		});
	}
}

export class SeeFriendshihpsPendingEndpoint extends Endpoint {
	add(server: any): void {
		server.get(this.path, { preHandler: server.authenticate }, async (request: any, reply: any) => {
			console.log(`SeeFriendshihpsPendingEndpoint: ${this.path} called`);
			const user = request.user;
			const response = await fetch(`http://dataBase:3000/get/friendships_pending?id1=${user.id}&id2=${user.id}&id3=${user.id}&id4=${user.id}`, {
				method: 'GET'});
			if (!response.ok) {
				server.log.error(`SeeFriendshihpsPendingEndpoint: ${this.errorMsg} - `, response.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			const data = await response.json();
			console.log('SeeFriendshihpsPendingEndpoint: Data received:', data);

			
			reply.send(data);
		});
	}
}

export class AcceptFriendshipEndpoint extends Endpoint {
	add(server: any): void {
		server.patch(this.path, { preHandler: server.authenticate }, async (request: any, reply: any) => {
			console.log(`AcceptFriendshipEndpoint: ${this.path} called`);
			const user = request.user;
			const id = request.body.id;
			if (!id) {
				reply.status(400).send({ error: 'Request Id is required' });
				return;
			}

			const response = await fetch(`http://dataBase:3000/patch/friendship`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id })
				});
			if (!response.ok) {
				server.log.error(`AcceptFriendshipEndpoint: ${this.errorMsg} - `, response.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			
			console.log(`Friendship request ${id} accepted for user ${user.id}`);
			reply.send({ message: 'Friendship request accepted successfully' });
		});
	}
}

export class SeeFriendshihpsAcceptedEndpoint extends Endpoint {
	add(server: any): void {
		server.get(this.path, { preHandler: server.authenticate }, async (request: any, reply: any) => {
			console.log(`SeeFriendshihpsAcceptedEndpoint: ${this.path} called`);
			const user = request.user;
			const response = await fetch(`http://dataBase:3000/get/friendships_accepted?id1=${user.id}&id2=${user.id}&id3=${user.id}`, {
				method: 'GET'});
			if (!response.ok) {
				server.log.error(`SeeFriendshihpsAcceptedEndpoint: ${this.errorMsg} - `, response.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			const data = await response.json();
			console.log('SeeFriendshihpsAcceptedEndpoint: Data received:', data);

			
			reply.send(data);
		});
	}
}

export class BlockFriendshipEndpoint extends Endpoint {
	add(server: any): void {
		server.patch(this.path, { preHandler: server.authenticate }, async (request: any, reply: any) => {
			console.log(`BlockFriendshipEndpoint: ${this.path} called`);
			const user = request.user;
			const id = request.body.id;
			if (!id) {
				reply.status(400).send({ error: 'Request Id is required' });
				return;
			}

			const response = await fetch(`http://dataBase:3000/patch/friendship_block`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id })
				});
			if (!response.ok) {
				server.log.error(`BlockFriendshipEndpoint: ${this.errorMsg} - `, response.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			
			console.log(`Friendship request ${id} blocked for user ${user.id}`);
			reply.send({ message: 'Friendship request blocked successfully' });
		});
	}
}

export class SeeFriendshihpsBlockedEndpoint extends Endpoint {
	add(server: any): void {
		server.get(this.path, { preHandler: server.authenticate }, async (request: any, reply: any) => {
			console.log(`SeeFriendshihpsBlockedEndpoint: ${this.path} called`);
			const user = request.user;
			const response = await fetch(`http://dataBase:3000/get/friendships_blocked?id1=${user.id}&id2=${user.id}&id3=${user.id}`, {
				method: 'GET'});
			if (!response.ok) {
				server.log.error(`SeeFriendshihpsBlockedEndpoint: ${this.errorMsg} - `, response.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			const data = await response.json();
			console.log('SeeFriendshihpsBlockedEndpoint: Data received:', data);

			
			reply.send(data);
		});
	}
}

export class DeleteFriendshipEndpoint extends Endpoint {
	add(server: any): void {
		server.delete(this.path, { preHandler: server.authenticate }, async (request: any, reply: any) => {
			console.log(`DeleteFriendshipEndpoint: ${this.path} called`);
			const user = request.user;
			const id = request.body.id;
			if (!id) {
				reply.status(400).send({ error: 'Request Id is required' });
				return;
			}

			const response = await fetch(`http://dataBase:3000/delete/friendship`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id })
				});
			if (!response.ok) {
				server.log.error(`DeleteFriendshipEndpoint: ${this.errorMsg} - `, response.statusText);
				reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
				return;
			}
			
			console.log(`Friendship request ${id} deleted for user ${user.id}`);
			reply.send({ message: 'Friendship request deleted successfully' });
		});
	}
}


export class ModifyBioEndpoint extends Endpoint {
	add(server: any): void {
		server.patch(this.path, { preHandler: server.authenticate }, async (request: any, reply: any) => {
			console.log(`ModifyBioEndpoint: ${this.path} called`);
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
			console.log(`Bio updated for user ${user.id}`);
			reply.send({ message: 'Bio updated successfully' });
		});
	}
}

export class ModifyPseudoEndpoint extends Endpoint {
	add(server: any): void {
		server.patch(this.path, { preHandler: server.authenticate }, async (request: any, reply: any) => {
			console.log(`ModifyPseudoEndpoint: ${this.path} called`);
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
			console.log(`Pseudo updated for user ${user.id}`);
			reply.send({ message: 'Pseudo updated successfully' });
		});
	}
}

export class DeleteUserEndpoint extends Endpoint {
	add(server: any): void {
		server.delete(this.path, { preHandler: server.authenticate }, async (request: any, reply: any) => {
			console.log(`DeleteUserEndpoint: ${this.path} called`);
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
			console.log(`User ${user.id} deleted successfully`);
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
			const id = data[0].id;
			console.log(data[0].pass, pass);

			if (pass === data[0].pass) { // Remplace par une vraie vérification de mot de passe
				const token = server.jwt.sign({ id });

				console.log(`User ${name} logged in successfully, token: ${token}`);
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
			console.log(`ProfileEndpoint: ${this.path} called`);
			console.log('Cookies reçus:', request.cookies);
  			console.log('Utilisateur JWT:', request.user);
			const user = request.user;
			reply.send({ name: user.id });
		});
	}
}

import { randomUUID } from "crypto";
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