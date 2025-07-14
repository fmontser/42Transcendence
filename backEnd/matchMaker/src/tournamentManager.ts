import { Match } from "./match";
import { tournamentManager } from "./matchmaker";
import { Tournament, Phase } from "./tournament";
import WebSocket from 'ws';


export enum Status {
	PENDING, ONGOING, COMPLETED, DISCONNECTED
}

export class TournamentManager {
	tournamentList: Set<Tournament>;
	
	constructor() {
		this.tournamentList = new Set<Tournament>();
	}
	
	public async requestTournament(connection: any ,userId: number): Promise<void> {
		let newTournament: Tournament | null =  this.findPendingTournament(this.tournamentList);
		
		if (newTournament == null) {
			newTournament = new Tournament();
			this.tournamentList.add(newTournament);
			console.log(`Info: New tournament is preparing...`);
		}
		newTournament.join(userId, connection);
		console.log(`Info: userId: ${userId} has joined a tournament`)
	}
	
	private findPendingTournament(tournamentList: Set<Tournament>): Tournament | null {
		for(const tournament of tournamentList) {
			if (tournament.getPhase() == Phase.DRAW) {
				return (tournament); 
			}
		}
		return (null);
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
		//TODO solo esperar una respuesta positiva...id descartados...
/* 		const data = await response.json();
		console.log("Info: tournamentUID recieved from database: " + data.id); */
	}

	public async phaseTournament(tournamentUID: number, userId: number): Promise<void> {
/* 		let currentTournament: Tournament | null = this.findTournament(tournamentUID, this.tournamentList);
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
		} */
	}

	private findTournament(tournamentUID: number, tournamentList: Set<Tournament>): Tournament | null {
/* 		for(const tournament of tournamentList) {
			if (tournament.tournamentUID == tournamentUID) {
				return (tournament); 
			}
		}*/
		return (null);
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
		}
		console.log(`Info: Tournament ranking sent to players`);
	}

	private closeTournament(tournament: Tournament): void {
		setTimeout(() => {
			for (const player of tournament.getPlayers())
				player[1].close();
		}, 1000);
		this.tournamentList.delete(tournament);
		console.log(`Info: Tournament has been closed`);
	}
}