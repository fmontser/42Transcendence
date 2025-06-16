enum Status {
	PENDING, ONGOING, COMPLETED
}

export class MatchManager {
	matchList: Set<Match>;

	constructor() {
		this.matchList = new Set<Match>();
	}

	public requestMatch(connection: any ,playerUID: number): void {
		let newMatch: Match | null = this.findPendingMatch();
		if (newMatch == null) {
			newMatch = new Match();
			this.matchList.add(newMatch);
		}
		newMatch.addPlayer(playerUID);

		if (this.checkPlayers(newMatch)){
			this.postMatchEntry(newMatch);
			this.requestNewPongInstance(connection, newMatch);
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
		if (match.player0UID != undefined && match.player1UID != undefined) {
			return (true);
		}
		return (false);
	}

	private async postMatchEntry(match: Match): Promise<number> {
		const response = await fetch("http://dataBase:3000/post/match", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				player0_id: match.player0UID,
				player0_score: 0,
				player1_id: match.player1UID,
				player1_score: 0,
				winner_id: -1
			})
		});

		console.log("Info: New match entry request sent to database");
		const data = await response.json();
		console.log("Info: MatchUID recieved from database: " + data.id);
		return (data.id);
	}

	//TODO no hay endpoint en la database!!
	private async patchMatchEntry(matchUID: number, column: string, value: string): Promise<void> {
		await fetch("http://dataBase:3000/patch/match", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				matchUID: matchUID,
				[column]: value
			})
		});
	};
	
	private async requestNewPongInstance(connection: any, match: Match): Promise<void> {
		let ws = new WebSocket(`wss://serverpong:3000/post/match`);

		ws.send(JSON.stringify({
			type: 'postMatchRequest',
			gameUID: match.matchUID
		}));
		console.log("Info: New game request sent to serverPong");


		ws.onmessage = (event) => {
			const data = JSON.parse(event.data);
			switch(data.type) {
				case 'postMatchResponse':
					console.log("Info: post match confirmation recieved from serverPong");
					connection.send(JSON.stringify({
						type: 'matchResponse',
						gameUID: match.matchUID
					}))
					console.log("Info: post match confirmation sent to client");
					break;
				case 'endGameSummary':
					//TODO mensaje fin de juego!
					break;
			}
		};

		ws.onclose = () => {
			//TODO limpiar??
		}
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
			this.player1Name = await this.getPlayerName(this.player1UID);
		}
	}

	private async getPlayerName(playerUID: number): Promise<string> {
		const response = await fetch(`http://dataBase:3000/get/username?id=${playerUID}`);
		const data = await response.json();
		return (data[0].name);
	}
}