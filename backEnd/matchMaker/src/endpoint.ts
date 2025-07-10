import { matchManager } from './matchmaker'
import { Tournament } from './tournament';

export abstract class Endpoint {

	protected static list: Set<Endpoint> = new Set();
	protected path: string;
	protected errorMsg: string;
	protected sessionToken!: any;
	protected userId!: number;

	constructor(path: string, errorMsg: string	) {
		this.path = path;
		this.errorMsg = errorMsg;
		Endpoint.list.add(this);
	}
	
	public static enableAll(server: any): void {
		for (const endpoint of Endpoint.list)
			endpoint.add(server);
	}
	
	protected abstract add(server: any): void;

	protected async validateSession(): Promise<boolean> {
		const reply = await fetch(`http://userAuthentication:3000/userauthentication/front/get/profile_session_with_token?token=${this.sessionToken}`, {
			method: 'GET'
		});
		if (reply.ok) {
			const data = await reply.json();
			console.log(`Info: UserId ${data.id} session confirmed`);
			this.userId = data.id;
			return (true);
		} else {
			console.log('Info: Invalid user session');
			return (false);
		}
	}

	protected retrieveSessionToken(request: any): any {
			const cookieHeader = request.headers.cookie;
			if (cookieHeader) {
				const cookies = cookieHeader.split(';');
				for (const c of cookies) {
					const [name, value] = c.trim().split('=');
					if (name === 'token') {
						this.sessionToken = value;
						break;
					}
				}
			}
			return (this.sessionToken);
	}

	protected replyAccepted(connection: any): void {
		connection.send(JSON.stringify({
		type: 'accepted',
		code: 202,
		message: 'Token accepted'
		}));
	}

	protected replyNotAllowed(connection: any): void {
		connection.send(JSON.stringify({
		type: 'error',
		code: 403,
		message: 'Not allowed please login'
		}));
		connection.close();
	}

	protected replyServerError(connection: any): void {
		connection.send(JSON.stringify({
		type: 'error',
		code: 500,
		message: 'Internal server error'
		}));
		connection.close();
	}
}

export class PostMatchRequest extends Endpoint {

	add(server: any): void {
		server.get(this.path, { websocket: true }, async (connection: any, req: any) => {

			const sessionToken = this.retrieveSessionToken(req);
			if (sessionToken == null || !(await this.validateSession())) {
				this.replyNotAllowed(connection);
				return;
			}
			this.replyAccepted(connection);

			connection.on('message', (data: any) => {
				try {
					const jsonData = JSON.parse(data.toString());
					switch (jsonData.type) {
						case 'matchRequest':
							console.log(`Info: Recieved matchRequest from userId ${this.userId}`);
							matchManager.requestMatch(connection, this.userId);
							break;
					}
				} catch (error) {
					console.error("Error processing message:", error);
					this.replyServerError(connection);
					return;
				}
			});

			connection.on('close', () => {
				console.log("Client left the matchMaker");
			});
		});
	}
}

/* export class PostTournamentRequest extends Endpoint {

	add(server: any): void {
		server.get(this.path, { websocket: true }, (connection: any, req: any) => {
			
			connection.on('message', (data: any) => {
				try {
					const jsonData = JSON.parse(data.toString());

					switch (jsonData.type) {
						case 'tournamentRequest':
							console.log("Info: Tournament request recieved");
							matchManager.requestTournament(connection, jsonData.userId);
							break;
						case 'tournamentPhaseEnd':
							console.log("Info: Tournament phase request recieved");
							matchManager.phaseTournament(jsonData.tournamentUID, jsonData.userId);
							break;
					}
				} catch (error) {
					console.error("Error processing message:", error);
				}
			});

			connection.on('close', () => {
				console.log("Client left the matchMaker");
			});
		});
	}
} */