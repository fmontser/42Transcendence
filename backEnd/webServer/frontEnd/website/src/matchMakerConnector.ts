import { PongGame, PlayerPosition } from "./pongGame.js";

export class MatchMakerConnector {
	private game: PongGame;
	private ws: any;

	constructor (gameContext: PongGame) {
		this.game = gameContext;
		this.connect();
		this.setupEvents();
	}

	private connect(): void {
		try {
			this.ws = new WebSocket(`wss://${window.location.hostname}:8443/matchmaker/front/post/match`);
		} catch (error) {
			console.log(`Error: connection to matchMaker failed: ${error}`)
		}
	}

	private setupEvents(): void {

		this.ws.onmessage = (event: any) => {
			const data = JSON.parse(event.data);
			switch(data.type) {
				case 'accepted':
					this.sendMatchRequest();
					break;
				case 'matchResponse':
					console.log("Info: Recieved match response from matchMaker");
					this.handleMatchResponse(data);
					break;
				case 'error':
					console.log(`Error: ${data.message}`);
					//TODO inyectar web de error con el mensaje??
					break;
			}
		};

		this.ws.onclose = () => {
			console.log('Disconected from match maker.');
		};

		this.ws.onerror = (error: any) => {
			console.error('WebSocket error:', error);
			//TODO inyectar web de error con el mensaje??
		};
	}

	private sendMatchRequest(): void {
		this.ws.send(JSON.stringify({
			type: 'matchRequest'
		}));
		console.log("Info: Match request sent to matchMaker");
	}

	//TODO tournament
/* 	private sendTournamentRequest(): void {
		this.ws.send(JSON.stringify({
			type: 'tournamentRequest'
		}));
		console.log("Info: Tournament request sent to matchMaker");
	} */

	private handleMatchResponse(data: any) {
 		this.game.leftPlayerName = data.player0Name;
		this.game.rightPlayerName = data.player1Name;
		this.game.userSlot = data.userSlot;
		this.game.announceMatch();
		this.ws.close();
	}
}