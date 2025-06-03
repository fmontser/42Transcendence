
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
			const tickRate = 60;
			const tickInterval = 1000 / tickRate;
			
			setInterval(() => {
				connection.socket.send(JSON.stringify(
					{
						//TODO Game state JSON
					}
				));
			}, tickInterval);

			connection.socket.on('input', (data: any) => {
				//TODO Manejar movimiento
			})

			connection.socket.on('newGame', () => {
				//TODO partida nueva, modo local SOLO!!
			})

			connection.socket.on('close', () => {
				//TODO Limpiar cuando el cliente se desconecta
			})
		})
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

- El cliente cierra la conexión cuando se desconecta.
{
  type: "close"
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