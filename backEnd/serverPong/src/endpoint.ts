import { Game } from './pongEngine'
import { PADDLE_MARGIN } from './serverpong';

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

export class GetNewGame extends Endpoint {
	private currentGame!: Game;

	add(server: any): void {
		server.get(this.path, { websocket: true }, (connection: any, req: any) => {
			
			connection.on('message', (data: any) => {
				try {
					const jsonData = JSON.parse(data.toString());
					console.log("Received message:", jsonData);

					switch (jsonData.type) {
						case 'setupRequest':
							this.currentGame = new Game(jsonData.gameUID);
							this.currentGame.gameSetup(connection);
							break;
						case 'newGame':
							console.log("NewGame requested!");

							this.currentGame.gameStart(connection, jsonData.player1UID, jsonData.player2UID);
							break;
						case 'input':
							console.log("Input recieved!");
							if (jsonData.playerId == '0')
								this.currentGame.playField.paddle0.updateVector(jsonData.direction);
							else if (jsonData.playerId == '1')
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


/* 

//TODO online multiplayer

- Mas adelante, requiere servicio de matchmaking
*/