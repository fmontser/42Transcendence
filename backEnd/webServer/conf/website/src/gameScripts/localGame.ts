
export class LocalGame {
	//TODO implement
	constructor () {

	}
}

class MatchMakerConnector {
	private gameCtx: LocalGame;

	constructor (gameCtx: LocalGame) {
		this.gameCtx = gameCtx;
	}

}

class ServerPongConnector {
	private gameCtx: LocalGame;

	constructor (gameCtx: LocalGame) {
		this.gameCtx = gameCtx;
	}
}