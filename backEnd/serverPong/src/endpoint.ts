import { LocalGame, MultiGame, Player } from './pongEngine'
import { P1, P2, multiGameManager } from './serverpong';

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

export class PostNewMatch extends Endpoint {
	add(server: any): void {
		let actualGame!: MultiGame;

		server.get(this.path, { websocket: true }, (connection: any, request: any) => {
			connection.on('message', (data: any) => {
				try {
					const jsonData = JSON.parse(data.toString());
					console.log("Received message:", jsonData);

					switch (jsonData.type) {
						case 'postMatchRequest':
							console.log("Info: Match request recieved");
							actualGame = multiGameManager.createGame(jsonData.gameUID);
							connection.send(JSON.stringify({
								type: 'postMatchResponse'
							}));
							console.log("Info: post match confirmation sent");
							actualGame.activateMatchDaemon(connection);
							break;
					}
				} catch (error) {
					console.error("Error processing message:", error);
				}
			});

			connection.on('close', () => {
				console.log("Info: MatchMaker disconnected!");
			});
		});
	}
}

export class GetNewLocalGame extends Endpoint {
	private currentGame!: LocalGame;

	add(server: any): void {
		server.get(this.path, { websocket: true }, (connection: any, req: any) => {
			connection.on('message', (data: any) => {
				try {
					const jsonData = JSON.parse(data.toString());
					switch (jsonData.type) {
						case 'setupRequest':
							this.currentGame = new LocalGame(jsonData.gameUID);
							this.currentGame.gameSetup(connection);
							break;
						case 'startRequest':
							console.log("New local game requested!");
							this.currentGame.addLocalPlayers(connection);
							this.currentGame.gameStart(connection);
							break;
						case 'input':
							if (jsonData.playerSlot == P1)
								this.currentGame.playField.paddle0.updateVector(jsonData.direction);
							else if (jsonData.playerSlot == P2)
								this.currentGame.playField.paddle1.updateVector(jsonData.direction);
							break;
						case 'canceled':
							console.log("Info: local game got canceled");
							connection.close();
					}
				} catch (error) {
					console.error("Error processing message:", error);
				}
			});

			connection.on('close', () => {
				console.log("Client (local) disconnected!");
				this.currentGame.gameEnd(connection);
			});
		});
	}
}

export class GetNewMultiGame extends Endpoint {
	add(server: any): void {
		server.get(this.path, { websocket: true }, (connection: any, req: any) => {

			let currentGame!: MultiGame;
			let player!: Player;
			
			connection.on('message', async (data: any) => {
				try {
					const jsonData = JSON.parse(data.toString());
					switch (jsonData.type) {
						case 'setupRequest':
							console.log("Info: Player " + jsonData.userUID + " is requesting setup data");
							player = new Player(connection, jsonData.userUID, jsonData.userSlot);
							currentGame = multiGameManager.joinGame(jsonData.gameUID, player);
							currentGame.gameSetup(connection, player);
							console.log("Info: Sent setupResponse to user: " + player.playerUID);
							break;
						case 'startRequest':
							console.log("Info: Player " + player.playerUID + " is ready");
							player.isReady = true;
							currentGame.gameStart();
							break;
						case 'input':
							if (jsonData.playerSlot == P1)
								currentGame.playField.paddle0.updateVector(jsonData.direction);
							else if (jsonData.playerSlot == P2)
								currentGame.playField.paddle1.updateVector(jsonData.direction);
							break;
					}
				} catch (error) {
					console.error("Error processing message:", error);
				}
			});

			connection.on('close', () => {
				console.log(`Info: PlayerUID: ${player.playerUID} disconnected!`);
				currentGame.gameEnd(player);
			});
		});
	}
}