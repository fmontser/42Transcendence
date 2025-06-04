import { TICK_INTERVAL } from "./serverpong";

export abstract class EndpointWS {

	protected static list: Set<EndpointWS> = new Set();
	protected path: string;
	protected errorMsg: string;

	constructor(path: string, errorMsg: string	) {
		this.path = path;
		this.errorMsg = errorMsg;
		EndpointWS.list.add(this);
	}
	
	protected abstract add(server: any): void;

	public static enableAll(server: any): void {
		for (const endpoint of EndpointWS.list)
			endpoint.add(server);
	}
}

export class getEndpointWS extends EndpointWS {
	add(server: any): void {
		server.get(this.path, { websocket: true }, (connection: any, req: any) => {
			
			//TODO enviar el estado

/* 			setInterval(() => {
				connection.send(JSON.stringify(
					{
						//TODO Actualizar estado!
					}
				));
			}, TICK_INTERVAL); */

			connection.on('message', (data: any) => {
				try {
					const jsonData = JSON.parse(data.toString());
					console.log("Received message:", jsonData);

					switch (jsonData.type) {
						case 'newGame':
							console.log("NewGame requested!");
							//TODO iniciar nuevo juego!
							break;
						case 'input':
							console.log("Input recieved!");
							//TODO mover palas!
							break;
					}
				} catch (error) {
					console.error("Error processing message:", error);
				}
			});

			connection.on('close', () => {
				console.log("Client disconnected!");
				//TODO terminar juego y limpiar
			});

		});
	}
}


/* 

JSON de intercambio entre cliente y servidor:

- El cliente solicita una nueva partida.
{
  type: "newGame"
}

- El cliente solo envia el movimiento de la paleta.
{
  type: "input",
  playerId: number,
  direction: "up" | "down" | "stop"
}

- El servidor envia el estado del juego 60 veces por segundo.
{
  ball: { x: number, y: number },
  paddles: [
	{ x: number, y: number },
	{ x: number, y: number }
  ],
  score: [number, number]
}

//TODO online multiplayer

- Mas adelante, requiere servicio de matchmaking
*/