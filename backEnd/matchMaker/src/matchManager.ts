import { Match } from "./match";
import WebSocket from 'ws';

export enum Status {
	PENDING, ONGOING, COMPLETED, DISCONNECTED
}

export class MatchManager {
	matchList: Set<Match>;

	constructor() {
		this.matchList = new Set<Match>();
	}

	public async requestMatch(connection: any ,userId: number): Promise<void> {
		let newMatch: Match | null = this.findPendingMatch();

		if (newMatch == null) {
			newMatch = new Match();
			this.matchList.add(newMatch);
		}
		await newMatch.addPlayer(connection, userId);
		console.log(`Info: UserId ${userId} is waiting for a match...`);

		if (newMatch.checkMatchPlayers()){
			console.log(`Info: match found!: [${newMatch.player0Name} vs ${newMatch.player1Name}]`);
			this.requestNewPongInstance(newMatch);
		}
	}

	public async requestPairedMatch(connection: any[] ,userId: number[]): Promise<Match> {
		let newMatch: Match = new Match();

		for (let i = 0; i < connection.length; i++)
			await newMatch.addPlayer(connection[i], userId[i]);

		console.log(`Info: Requesting Paired match to serverPong: [${newMatch.player0Name} vs ${newMatch.player1Name}]`);
		this.requestNewPongInstance(newMatch);
		return (newMatch);
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

	private async postMatchEntry(match: Match, gameOverData: any): Promise<void> {
		const response = await fetch("http://dataBase:3000/post/match", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				tournament_id: match.tournamentUID,
				player0_id: match.player0Id,
				player0_score: gameOverData.score[0],
				player1_id: match.player1Id,
				player1_score: gameOverData.score[1],
				winner_id: gameOverData.winnerId,
				disconnected: match.status == Status.DISCONNECTED ? true : false
			})
		});
		console.log(`Info: New match entry request sent to database`);
		const data = await response.json();
		match.matchUID = data.id;
		console.log(`Info: Database confirmed match entry with id: ${data.id}`);
	}
	
	private async sendMatchResponse(match: Match): Promise<void> {
		let userMap: Map<string, any> = new Map<string, any>();

		userMap.set(match.player0Name, match.player0Conn);
		userMap.set(match.player1Name, match.player1Conn);

		for (const [name, connection] of userMap){
			connection.send(JSON.stringify({
				type: 'matchResponse',
				player0Name: match.player0Name,
				player1Name: match.player1Name
			}));
			console.log(`Info: Announce sent to user ${name}`);
		}
	}

	private cleanMatch(match: Match): void {
		this.matchList.delete(match);
	}

	private async requestNewPongInstance(match: Match): Promise<void> {
		const ws = new WebSocket('ws://serverpong:3000/post/match');

		ws.on('open', () => {
			ws.send(JSON.stringify({
				type: 'postMatchRequest',
				player0Id: match.player0Id,
				player1Id: match.player1Id,
			}));
			console.log("Info: New game request sent to serverPong");
		});

		ws.on('message', (event) => {
			const data = JSON.parse(event.toString());

			switch (data.type) {
				case 'postMatchResponse':
					console.log("Info: New game confirmation received from serverPong");
					this.sendMatchResponse(match);
					break;
				case 'endGame':
					match.status = Status.COMPLETED;
					console.log("Info: Game summary recieved from serverPong");
					this.postMatchEntry(match, data);
					this.cleanMatch(match);
					break;
				case 'playerDisconnected':
					match.status = Status.DISCONNECTED;
					console.log("Info: Game summary recieved from serverPong");
					this.postMatchEntry(match, data);
					this.cleanMatch(match);
					break;
			}
		});

		ws.on('close', () => {
			console.log("Info: Connection to serverPong for match " + match.matchUID + " ended");
		});
	}
}