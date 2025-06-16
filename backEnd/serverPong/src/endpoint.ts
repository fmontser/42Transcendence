import { MultiGame, Player } from './pongEngine'
//import { LocalGame, MultiGame, Player } from './pongEngine'
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
		server.get(this.path, { websocket: true }, (connection: any, request: any) => {
			connection.on('message', (data: any) => {
				try {
					const jsonData = JSON.parse(data.toString());
					console.log("Received message:", jsonData);

					switch (jsonData.type) {
						case 'postMatchRequest':
							console.log("Info: Match request recieved");
							multiGameManager.createGame(jsonData.gameUID);
							connection.send(JSON.stringify({
								type: 'postMatchResponse'
							}));
							console.log("Info: post match confirmation sent");
							break;
					}
				} catch (error) {
					console.error("Error processing message:", error);
				}
			});

			connection.on('close', () => {
				//TODO clean?
				console.log("Info: MatchMaker disconnected!");
			});
		});
	}
}

/*
//TODO el UID debe venir del matchmaker?? no del cliente... para ambos modos??

export class GetNewLocalGame extends Endpoint {
	private currentGame!: LocalGame;

	add(server: any): void {

		//TODO reqeuest no es necesario?
	/* 	server.get(this.path, { websocket: true }, (connection: any, req: any) => {
			connection.on('message', (data: any) => {
				try {
					const jsonData = JSON.parse(data.toString());
					console.log("Received message:", jsonData);

					switch (jsonData.type) {
						case 'setupRequest':
							this.currentGame = new LocalGame(jsonData.gameUID);
							this.currentGame.gameSetup(connection);
							break;
						case 'newGame':
							console.log("NewGame requested!");
							this.currentGame.addPlayer(new Player(connection, jsonData.player1UID));
							this.currentGame.addPlayer(new Player(connection, jsonData.player2UID));
							this.currentGame.gameStart(connection);
							break;
						case 'input': //TODO sacar a funcion?? esta compartida...
							console.log("Input recieved!");
							if (jsonData.playerSlot == P1)
								this.currentGame.playField.paddle0.updateVector(jsonData.direction);
							else if (jsonData.playerSlot == P2)
								this.currentGame.playField.paddle1.updateVector(jsonData.direction);
							break;
					}
				} catch (error) {
					console.error("Error processing message:", error);
				}
			});

			connection.on('close', () => {
				console.log("Client disconnected!");
				this.currentGame.gameEnd(connection);
			});
		});
	}
}
*/

export class GetNewMultiGame extends Endpoint {
	private currentGame!: MultiGame;
	private player!: Player;

	//TODO reqeuest no es necesario?
	add(server: any): void {
		server.get(this.path, { websocket: true }, (connection: any, req: any) => {
			
			connection.on('message', async (data: any) => {
				try {
					const jsonData = JSON.parse(data.toString());
					console.log("Received message:", jsonData);

					switch (jsonData.type) {
						case 'setupRequest':
							console.log("Info: Player " + jsonData.userUID + " is requesting setup data");
							this.player = new Player(connection, jsonData.userUID, jsonData.userSlot);
							this.currentGame = multiGameManager.joinGame(connection, jsonData.gameUID, this.player);
							this.currentGame.gameSetup(connection, this.player);
							console.log("Info: Sent setupResponse to user: " + this.player.playerUID);
							break;
						case 'startRequest':
							console.log("Info: Player " + this.player.playerUID + " is ready");
							this.player.isReady = true;
							this.currentGame.gameStart();
							break;
						case 'input':
							console.log("Input recieved!");
							if (jsonData.playerSlot == P1)
								this.currentGame.playField.paddle0.updateVector(jsonData.direction);
							else if (jsonData.playerSlot == P2)
								this.currentGame.playField.paddle1.updateVector(jsonData.direction);
							break;
					}
				} catch (error) {
					console.error("Error processing message:", error);
				}
			});

			connection.on('close', () => {
				console.log("Client disconnected!");
				this.currentGame.gameEnd(this.player);
			});
		});
	}
}