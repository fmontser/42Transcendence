import { Match } from "./match";
import { Tournament, Phase } from "./tournament";
import WebSocket from 'ws';


export enum Status {
	PENDING, ONGOING, COMPLETED, DISCONNECTED
}

export class MatchManager {
	matchList: Set<Match>;
	tournamentList: Set<Tournament>;

	constructor() {
		this.matchList = new Set<Match>();
		this.tournamentList = new Set<Tournament>();
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
				player0_id: match.player0UID,
				player0_score: gameOverData.score[0],
				player1_id: match.player1UID,
				player1_score: gameOverData.score[1],
				winner_id: gameOverData.winnerUID,
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
		let userSlot: number = 0;

		userMap.set(match.player0Name, match.player0Conn);
		userMap.set(match.player1Name, match.player1Conn);

		for (const [name, connection] of userMap){
			connection.send(JSON.stringify({
				type: 'matchResponse',
				userSlot: userSlot,
				player0UID: match.player0UID,
				player0Name: match.player0Name,
				player1UID: match.player1UID,
				player1Name: match.player1Name
			}));
			console.log(`Info: Announce sent to user ${name}`);
			userSlot++;
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
				gameUID: match.matchUID
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
					this.postMatchEntry(match, data);
					this.cleanMatch(match);
					break;
				case 'playerDisconnected':
					match.status = Status.DISCONNECTED;
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



	/* public async requestTournament(connection: any ,userId: number): Promise<void> {
		let newTournament: Tournament | null =  this.findPendingTournament(this.tournamentList);

		if (newTournament == null) {
			newTournament = new Tournament(false);
			this.tournamentList.add(newTournament);
			console.log(`Info: New tournament is preparing...`);
		}
		console.log(`Info: Player ${userId} is attemping to join...`);
		if (!newTournament.join(userId, connection)) {
			this.rejectPlayerTournament(userId, connection);
			return;
		}
		console.log(`Info: userId: ${userId} has joined a tournament`)
		if (newTournament.getPhase() == Phase.SEMIFINALS){
			await this.postTournamentEntry(newTournament);
			newTournament.drawSemifinals();

			for(const match of newTournament.matches){
				await this.postMatchEntry(match);
				this.requestNewPongInstance(match);
			}
		}
	}


	private async postTournamentEntry(tournament: Tournament): Promise<void> {
		const response = await fetch("http://dataBase:3000/post/tournament", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				ranking_1: 0,
				ranking_2: 0,
				ranking_3: 0,
				ranking_4: 0,
				status: Phase.DRAW
			})
		});
		console.log("Info: New tournament entry request sent to database");
		const data = await response.json();
		tournament.tournamentUID = data.id;
		console.log("Info: tournamentUID recieved from database: " + data.id);
	}

	public async phaseTournament(tournamentUID: number, userId: number): Promise<void> {
		let currentTournament: Tournament | null = this.findTournament(tournamentUID, this.tournamentList);
		if (currentTournament != null) {
			currentTournament.playersReady++;
			console.log(`Info: Player ${userId} is ready to play next phase: playersReady ${currentTournament.playersReady}`);

			if (currentTournament.playersReady < 4)
				return;
			if (currentTournament.getPhase() == Phase.SEMIFINALS){
				currentTournament.drawFinals();
				for(const match of currentTournament.matches){
					await this.postMatchEntry(match);
					this.requestNewPongInstance(match);
				}
			}
			else if (currentTournament.getPhase() == Phase.FINALS) {
				currentTournament.endTournament();
				//TODO quitar ya no se va a hacer patch, solo se postean los resultados finales.
				//await this.patchTournamentEntry(currentTournament);
				this.sendTournamentRanking(currentTournament);
				this.closeTournament(currentTournament);
			}
		}
	}

	private findTournament(tournamentUID: number, tournamentList: Set<Tournament>): Tournament | null {
		for(const tournament of tournamentList) {
			if (tournament.tournamentUID == tournamentUID) {
				return (tournament); 
			}
		}
		return (null);
	}

	private findPendingTournament(tournamentList: Set<Tournament>): Tournament | null {
		for(const tournament of tournamentList) {
			if (tournament.getPhase() == Phase.DRAW) {
				return (tournament); 
			}
		}
		return (null);
	}

	private rejectPlayerTournament(userId: number, connection: any): void {
			connection.send(JSON.stringify({
				type: 'postTournamentReject'
			}));
			console.log(`Info: Player ${userId} has been rejected (full or duplicated)`);
	}

	private sendTournamentRanking(tournament: Tournament): void {
		for (const player of tournament.getPlayers()){
			player[1].send(JSON.stringify({
				type: 'tournamentRanking',
				p1: tournament.ranking.get(1),
				p2: tournament.ranking.get(2),
				p3: tournament.ranking.get(3),
				p4: tournament.ranking.get(4)
			}));
			if (tournament.hotSeat)
				break;
		}
		console.log(`Info: Tournament id ${tournament.tournamentUID} ranking sent to players`);
	}

	private closeTournament(tournament: Tournament): void {
		setTimeout(() => {
			for (const player of tournament.getPlayers())
				player[1].close();
		}, 1000);
		this.tournamentList.delete(tournament);
		console.log(`Info: Tournament id ${tournament.tournamentUID} has been closed`);
	} */
	