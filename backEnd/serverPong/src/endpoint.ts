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

//TODO el UID debe venir del matchmaker?? no del cliente... para ambos modos??

export class GetNewLocalGame extends Endpoint {
	private currentGame!: LocalGame;

	add(server: any): void {
		server.get(this.path, { websocket: true }, (connection: any, req: any) => {
			
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

export class GetNewMultiGame extends Endpoint {
	private currentGame!: MultiGame;
	private player!: Player;

	//TODO refactor multiplayer!!!

	add(server: any): void {
		server.get(this.path, { websocket: true }, (connection: any, req: any) => {
			
			connection.on('message', async (data: any) => {
				try {
					const jsonData = JSON.parse(data.toString());
					console.log("Received message:", jsonData);

					switch (jsonData.type) {
						case 'setupRequest':
							this.player = new Player(connection, jsonData.player1UID)
							this.currentGame = multiGameManager.joinGame(jsonData.gameUID, this.player);
							this.currentGame.gameSetup(connection, this.player);
							break;
						case 'newGame':
							console.log("NewGame requested!");
							this.player.isReady = true;
							this.currentGame.gameStart(connection); //TODO comprobar si hay concurrencia...
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
				this.currentGame.gameEnd(connection);
			});
		});
	}
}