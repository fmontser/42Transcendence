
export class TournamentGame {
	//TODO implement
	constructor (userUID: number) {

	}
}

class MatchMakerConnector {
	private gameCtx: TournamentGame;

	constructor (gameCtx: TournamentGame) {
		this.gameCtx = gameCtx;
	}

}

class ServerPongConnector {
	private gameCtx: TournamentGame;

	constructor (gameCtx: TournamentGame) {
		this.gameCtx = gameCtx;
	}
}