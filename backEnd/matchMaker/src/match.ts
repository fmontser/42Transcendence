import WebSocket from 'ws';

export enum Status {
	PENDING, ONGOING, COMPLETED, DISCONNECTED
}

export class MatchManager {
	matchList: Set<Match>;

	constructor() {
		this.matchList = new Set<Match>();
	}

	public async requestMatch(connection: any ,playerUID: number): Promise<void> {
		let newMatch: Match | null = this.findPendingMatch();
		if (newMatch == null) {
			newMatch = new Match();
			this.matchList.add(newMatch);
		}
		newMatch.addPlayer(connection, playerUID);

		if (this.checkPlayers(newMatch)){
			await this.postMatchEntry(newMatch);
			this.requestNewPongInstance(newMatch);
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

	private async postMatchEntry(match: Match): Promise<void> {
		const response = await fetch("http://dataBase:3000/post/match", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				player0_id: match.player0UID,
				player0_score: 0,
				player1_id: match.player1UID,
				player1_score: 0,
				winner_id: 0,
				disconnected: false
			})
		});
		console.log("Info: New match entry request sent to database");
		const data = await response.json();
		match.matchUID = data.id;
		console.log("Info: MatchUID recieved from database: " + data.id);
	}

	private async patchMatchEntry(match: Match): Promise<void> {
		const response = await fetch("http://dataBase:3000/patch/match", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				player0_score: match.score[0],
				player1_score: match.score[1],
				winner_id: match.winnerUID,
				disconnected: match.status == Status.DISCONNECTED ? true:false,
				matchUID: match.matchUID
			})
		});
		console.log("Info: patch request sent to database");
		await response.json();
		console.log("Info: Succesfully patched MatchUID: " + match.matchUID);
	};
	
	private async requestNewPongInstance(match: Match): Promise<void> {
		const ws = new WebSocket('ws://serverpong:3000/post/match');
		console.log("Info: Connection to serverPong");

		ws.on('open', () => {
			ws.send(JSON.stringify({
				type: 'postMatchRequest',
				gameUID: match.matchUID
			}));
			console.log("Info: New game request sent to serverPong");
		});

		ws.on('message', (event) => {
			const data = JSON.parse(event.toString());

			switch (data.type) {
				case 'postMatchResponse':
					console.log("Info: post match confirmation received from serverPong");
					for (const connection of [match.player0Conn, match.player1Conn]){
						connection.send(JSON.stringify({
							type: 'matchAnnounce',
							gameUID: match.matchUID,
							player0UID: match.player0UID,
							player0Name: match.player0Name,
							player1UID: match.player1UID,
							player1Name: match.player1Name
						}));
						console.log("Info: match announce sent to client");
					}
					break;
				case 'endGame':
					match.status = Status.COMPLETED;
					recordDatabase(match, data, this);
					break;
				case 'playerDisconnected':
					match.status = Status.DISCONNECTED;
					recordDatabase(match, data, this);
					break;
			}
		});

		ws.on('close', () => {
			console.log("Info: connection to serverPong for match " + match.matchUID + " ended");
		});

		function recordDatabase(match: Match, data: any, ctx: any): void {
			console.log(`Info: ${Status[match.status]} summary recieved from serverPong for matchUID: ` + data.gameUID);
			match.winnerUID = data.winnerUID;
			match.score = [data.score[0], data.score[1]];
			console.log("Info: matchUID: "  + data.gameUID + " winnerUID: " + data.winnerUID + " score: " + data.score[0] + " - " + data.score[1]);
			ctx.patchMatchEntry(match);
		}
	}
}

export class Match {
	status: Status;
	matchUID!: number;
	player0UID!: number;
	player0Name!: string;
	player0Conn!: any;
	player1UID!: number;
	player1Name!: string;
	player1Conn!: any;
	score: number[] = [0,0];
	winnerUID!: number;

	constructor (){
		this.status = Status.PENDING;
	}

	public async addPlayer(connection: any, playerUID: number) {
		if (this.player0UID == undefined) {
			this.player0UID = playerUID;
			this.player0Name = await this.getPlayerName(this.player0UID);
			this.player0Conn = connection;
		} else if (this.player1UID == undefined) {
			this.player1UID = playerUID;
			this.player1Name = await this.getPlayerName(this.player1UID);
			this.player1Conn = connection;
		}
	}

	private async getPlayerName(playerUID: number): Promise<string> {
		const response = await fetch(`http://dataBase:3000/get/username?id=${playerUID}`);
		const data = await response.json();
		return (data[0].name);
	}
}