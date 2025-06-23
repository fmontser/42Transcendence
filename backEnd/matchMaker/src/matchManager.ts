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

	public async requestTournament(connection: any ,playerUID: number): Promise<void> {
		let newTournament: Tournament | null =  this.findPendingTournament();

		if (newTournament == null) {
			newTournament = new Tournament();
			this.tournamentList.add(newTournament);
			console.log(`Info: New tournament is preparing...`);
		}
		console.log(`Info: Player ${playerUID} is attemping to join...`);
		if (!newTournament.join(playerUID, connection)) {
			this.rejectPlayerTournament(playerUID, connection);
			return; //TODO esta bien no retornar la promesa?? resolve?
		}
		console.log(`Info: PlayerUID: ${playerUID} has joined a tournament`)
		if (newTournament.getPhase() == Phase.SEMIFINALS){
			await this.postTournamentEntry(newTournament);
			newTournament.drawSemifinals();

			for(const match of newTournament.matches){
				await this.postMatchEntry(match);
				this.requestNewPongInstance(match);
			}

			//TODO y ahora que? como esperar los resultados y pasar a las finales...
		}
	}

	public async requestHotSeatTournament(connection: any ,playerUID: number): Promise<void> {
		//TODO implementar
	}

	private rejectPlayerTournament(playerUID: number, connection: any): void {
			connection.send(JSON.stringify({
				type: 'postTournamentReject'
			}));
			console.log(`Info: Player ${playerUID} has been rejected (full or duplicated)`);
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

	private findPendingTournament(): Tournament | null {
		for(const tournament of this.tournamentList) {
			if (tournament.getPhase() == Phase.DRAW) {
				return (tournament); 
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
				tournament_id: match.tournamentUID,
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
				id: match.matchUID
			})
		});
		console.log("Info: match patch request sent to database");
		await response.json();
		console.log("Info: Succesfully patched MatchUID: " + match.matchUID);
	};
	
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

	private async patchTournamentEntry(tournament: Tournament): Promise<void> {
			const response = await fetch("http://dataBase:3000/patch/tournament", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({

				ranking_1: tournament.ranking.get(1),
				ranking_2: tournament.ranking.get(2),
				ranking_3: tournament.ranking.get(3),
				ranking_4: tournament.ranking.get(4),
				status: tournament.getPhase(),
				id: tournament.tournamentUID,
			})
		});
		console.log("Info: tournament patch request sent to database");
		await response.json();
		console.log("Info: Succesfully patched TournamentUID: " + tournament.tournamentUID);
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