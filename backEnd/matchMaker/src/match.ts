enum Status {
	PENDING, ONGOING, COMPLETED
}

export class MatchManager {
	matchList: Set<Match>;

	constructor() {
		this.matchList = new Set<Match>();
	}

	public joinMatch(playerUID: number): void {
		let newMatch: Match | null = this.findPendingMatch();
		if (newMatch == null) {
			newMatch = new Match();
			this.matchList.add(newMatch);
		}
		newMatch.addPlayer(playerUID);

		//TODO @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ continuar aqui faltaria el segundo player!!

		if (this.checkPlayers(newMatch)){
			this.postMatchDB(newMatch);
			this.requestNewPongInstance(newMatch.matchUID);
		}
	}

	private findPendingMatch(): Match | null {
		for(const match of this.matchList) {
			if (match.status == Status.PENDING) {
				match.status = Status.ONGOING;
				return (match); 
			}
		}
		return (null);
	}

	private checkPlayers(match: Match): boolean {
		if (match.player0UID != undefined && match.player1UID != undefined)
			return (true);
		return (false);
	}

	private postMatchDB(match: Match): void {
		try {
			match.postMatchEntry().then(ret => match.matchUID = ret);
		} catch (error) {
			//TODO se espera un status 500?
			//TODO comunicar al cliente? para que muestre error?
		}
	}

	//TODO
	private requestNewPongInstance(matchUID: number): void {
/* 		try {
			
		} catch (error) {
			//TODO comunicar al cliente? para que muestre error?
		} */
	}

	//TODO usar resultado del serverPong y hacer update en la DB antes de limpiar
	private patchMatchDB(match: Match): void {
		match.patchMatchEntry();
	}
}


export class Match {
	status: Status;
	matchUID!: number;
	player0UID!: number;
	player0Name!: string;
	player1UID!: number;
	player1Name!: string;
	score: number[] = [0,0];

	constructor (){
		this.status = Status.PENDING;
	}

	public async addPlayer(playerUID: number) {
		if (this.player0UID == undefined) {
			this.player0UID = playerUID;
			this.player0Name = await this.getPlayerName(this.player0UID);
		} else if (this.player1UID == undefined) {
			this.player1UID = playerUID;
			this.player0Name = await this.getPlayerName(this.player0UID);
		}
	}

	private async getPlayerName(playerUID: number): Promise<string> {
		const response = await fetch(`http://dataBase:3000/get/username?userUID=${playerUID}`);
		const data = await response.json();
		return (data[0].userName);
	}

	public async postMatchEntry(): Promise<number> {
		const response = await fetch("http://dataBase:3000/post/match", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				player0UID: this.player0UID,
				player1UID: this.player1UID,
			})
		});
		const data = await response.json();

		//TODO borrar test
		console.log("Debug: matchUID = " + data.matchUID);
		return (data.matchUID); //TODO lastId AS??
	}

	public async patchMatchEntry(): Promise<void> {
		await fetch("http://dataBase:3000/patch/match", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				//TODO Patch
			})
		});
	}
}