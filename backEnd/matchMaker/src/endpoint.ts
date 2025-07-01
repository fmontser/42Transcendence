import { matchManager } from './matchmaker'

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

export class PostMatchRequest extends Endpoint {

	add(server: any): void {
		server.get(this.path, { websocket: true }, (connection: any, req: any) => {
			
			connection.on('message', (data: any) => {
				try {
					const jsonData = JSON.parse(data.toString());
					console.log("Received message:", jsonData);

					switch (jsonData.type) {
						case 'matchRequest':
							matchManager.requestMatch(connection, jsonData.userUID);
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
}

export class PostTournamentRequest extends Endpoint {

	add(server: any): void {
		server.get(this.path, { websocket: true }, (connection: any, req: any) => {
			
			connection.on('message', (data: any) => {
				try {
					const jsonData = JSON.parse(data.toString());

					switch (jsonData.type) {
						case 'tournamentRequest':
							console.log("Info: Tournament request recieved");
							matchManager.requestTournament(connection, jsonData.userUID);
							break;
						case 'tournamentPhaseEnd':
							console.log("Info: Tournament phase request recieved");
							matchManager.phaseTournament(jsonData.tournamentUID, jsonData.playerUID);
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
}

export class PostHotSeatTournamentRequest extends Endpoint {

	add(server: any): void {

		server.get(this.path, { websocket: true }, (connection: any, req: any) => {
			
			connection.on('message', (data: any) => {
				try {
					const jsonData = JSON.parse(data.toString());

					switch (jsonData.type) {
						case 'hotSeatTournamentRequest':
							let usersUIDs: number[] = [
								jsonData.user1UID,
								jsonData.user2UID,
								jsonData.user3UID,
								jsonData.user4UID
							];
							matchManager.requestHotSeatTournament(connection, usersUIDs);
							break;
						case 'hotSeatTournamentPhaseEnd':
							console.log("Info: Hot seat tournament phase request recieved");
							matchManager.phaseHotSeatTournament(jsonData.tournamentUID);
							break;
						case 'canceled':
							matchManager.cancelHotSeat(jsonData.tournamentUID);
						
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
}