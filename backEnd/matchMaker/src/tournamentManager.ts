
import { Tournament, Phase } from "./tournament";
import { MatchManager } from "./matchManager";
import { matchManager } from "./matchmaker";
import { Match } from "./match";

export class TournamentManager {
	tournamentList: Set<Tournament>;
	matchManager!: MatchManager;
	
	constructor() {
		this.tournamentList = new Set<Tournament>();
		this.matchManager = matchManager;
		this.daemon(1000);
	}
	
	private async daemon(interval: number): Promise<void> {
		while (true) {
			for (const t of this.tournamentList) {
				if (!t) continue;

				if (t.getPhase() !== t.getPreviousPhase()) {
					if (t.getPhase() === Phase.SEMIFINALS) {
						await t.drawSemifinals();
						await t.waitAllMatchesEnd();
						t.changePhase(Phase.FINALS);
					} else if (t.getPhase() === Phase.FINALS) {
						await t.drawFinals();
						await t.waitAllMatchesEnd();
						t.changePhase(Phase.COMPLETED);
					} else if (t.getPhase() === Phase.COMPLETED) {
						await t.endTournament();
						await this.closeTournament(t);
					} else if (t.getPhase() === Phase.CANCELED) {
						await this.cancelTournamentMatches(t);
						await this.closeTournament(t);
					}
				}
			}
			await new Promise(resolve => setTimeout(resolve, interval));
		}
	}
	
	public async requestTournament(connection: any ,userId: number): Promise<Tournament | null> {
		let newTournament: Tournament | null =  this.findPendingTournament(this.tournamentList);
		
		if (newTournament == null) {
			newTournament = new Tournament();
			this.tournamentList.add(newTournament);
			console.log(`Info: New tournament is preparing...`);
		}

		if (this.findPlayerDup(userId))
			return (null);

		newTournament.join(userId, connection);
		console.log(`Info: userId: ${userId} has joined a tournament`)
		return (newTournament);
	}

	public async requestPairedMatch(tournament: Tournament, connection: any[] ,userId: number[]): Promise<Match> {
		return (this.matchManager.requestPairedMatch(tournament, connection, userId));
	}
	
	private findPlayerDup(userId: number): boolean {
		for (const t of this.tournamentList) {
			for (const p of t.getPlayers()) {
				if (userId === p[1].id)
					return (true);
			}
		}
		return (false);
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
				ranking_1: tournament.ranking[0][1].id,
				ranking_2: tournament.ranking[1][1].id,
				ranking_3: tournament.ranking[2][1].id,
				ranking_4: tournament.ranking[3][1].id,
				status: Phase.COMPLETED
			})
		});
		console.log("Info: New tournament entry request sent to database");
		const data = await response.json();
		console.log("Info: Database confirmed tournament entry");
	}

	private async closeTournament(tournament: Tournament): Promise<void> {

		await this.postTournamentEntry(tournament);

		setTimeout(() => {
			for (const p of tournament.getPlayers())
				p[1].connection.close();
		}, 1000);

		this.tournamentList.delete(tournament);
		console.log(`Info: Tournament has been closed`);
	}

	private async cancelTournamentMatches(tournament: Tournament): Promise<void> {
		for (const p of tournament.getPlayers()){
			await fetch("http://serverPong:3000/delete/match", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: p[1].id
				})
			});
			console.log("Info: Sent match cancel signal to serverPong");
		}
	}
}