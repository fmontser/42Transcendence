
export class HotSeatGame {
	//TODO implement
	constructor (userUID: number[]) {

	}
}

class MatchMakerConnector {
	private gameCtx: HotSeatGame;

	constructor (gameCtx: HotSeatGame) {
		this.gameCtx = gameCtx;
	}

}

class ServerPongConnector {
	private gameCtx: HotSeatGame;

	constructor (gameCtx: HotSeatGame) {
		this.gameCtx = gameCtx;
	}
}