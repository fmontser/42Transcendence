enum Status {
	PENDING, ONGOING, COMPLETED
}

export class MatchManager {
	matchList: Set<Match>;

	constructor() {
		this.matchList = new Set<Match>();
	}

	public joinMatch(playerUID: number) {
		let newMatch: Match | null = this.findPendingMatch();
		if (newMatch == null) {
			newMatch = new Match();
			this.matchList.add(newMatch);
		}
		newMatch.addPlayer(playerUID);
		if (this.checkPlayers(newMatch)){
			this.postMatchDB(newMatch);
			this.requestNewPongInstance(newMatch.matchUID);
		}
	}

	private checkPlayers(match: Match): boolean {
		if (match.player0UID != undefined && match.player1UID != undefined)
			return (true);
		return (false);
	}

	//TODO tratar con...try catch...
	private postMatchDB(match: Match) {
		match.postMatchEntry().then(ret => match.matchUID = ret);
	}

	//TODO tratar con...try catch...
	private requestNewPongInstance(matchUID: number): void {
		
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
	//TODO update results on database
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

	public addPlayer(playerUID: number) {
		if (this.player0UID == undefined) {
			this.player0UID = playerUID;
			this.getPlayerName(this.player0UID).then(ret => this.player0Name = ret);

			//TODO borrar test
			console.log("Debug: player0Name = " + this.player0Name);

		} else if (this.player1UID == undefined) {
			this.player1UID = playerUID;
			this.getPlayerName(this.player1UID).then(ret => this.player1Name = ret);
		}
	}
	
	public async postMatchEntry(): Promise<number> {
		const response = await fetch("http://database:3000/post/match", {
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

	private async getPlayerName(playerUID: number): Promise<string> {
		const response = await fetch("http://database:3000/get/username", {
			method: "GET",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				playerUID: playerUID
			})
		});
		const data = await response.json();
		return (data.playerName); //TODO reply AS??
	}
}