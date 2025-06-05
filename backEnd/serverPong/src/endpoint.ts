import { Game } from './pongEngine'

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
						case 'newGame':
							console.log("NewGame requested!");
							this.currentGame = new Game(jsonData.gameUID);
							this.currentGame.GameStart(connection, jsonData.player1UID, jsonData.player2UID);
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
				this.currentGame.GameEnd(connection);
			});
		});
	}
}


/* 

JSON de intercambio entre cliente y servidor:

- El cliente solicita una nueva partida.
{
  type: "newGame"
  gameUID: number (esto sera generado mas tarde en el matchmaker... no el frontend)
  player1UID: number
  player2UID: number
}

- El cliente solo envia el movimiento de la paleta.
{
  type: "input",
  playerId: number,
  direction: "up" | "down" | "stop"
}

///////////////////////////////////////////////////////


- El servidor envia el estado del juego 60 veces por segundo.
{
  type: 'update',
  ball: { x: number, y: number },
  paddles: [
	{ x: number, y: number },
	{ x: number, y: number }
  ],
  score: [number, number]
}

- El servidor envia el resultado de la partida.
{
	type: 'endgame'
	gameUID: this.gameUID,
	giveUp: 'true' | 'false' (para partidas invalidas por desconexion, solo por matchmaking, no aplica a local.)
	player1UID: this.playersUID[P1],
	player2UID: this.playersUID[P2],
	winnerUID: 'winnerUID',
	score: this.score
}

//TODO online multiplayer

- Mas adelante, requiere servicio de matchmaking
*/