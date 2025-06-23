import { Match } from "./match";

export enum Phase {
	DRAW ,SEMIFINALS, FINALS, COMPLETED
}

export class Tournament {
	tournamentUID: number;
	private maxPlayers: number;
	private players: Map<number, any>;
	matches:Set<Match>;
	private phase: Phase;
	ranking: Map<number, number>;

	constructor() {
		this.tournamentUID = 0;
		this.maxPlayers = 4;
		this.players = new Map<number, any>();
		this.matches = new Set<Match>();
		this.ranking = new Map<number, number>();
		this.phase = Phase.DRAW;

	}

	private checkDupPlayer(playerUID: number): boolean {
		for (const p of this.players){
			if (p[0] == playerUID)
				return (true);
		}
		return (false);
	}

	public join(playerUID: number, connection: any): boolean {
		if (this.players.size >= this.maxPlayers
			|| this.checkDupPlayer(playerUID))
			return (false);

		this.players.set(playerUID, connection);
		if (this.players.size >= this.maxPlayers)
			this.phase = Phase.SEMIFINALS;
		return (true);
	}

	public drawSemifinals(): void {
		this.players = new Map([...this.players].sort(() => Math.random() - 0.5));

		let semiA: Match = new Match();
		let semiB: Match = new Match();
		let i: number = 0;

		semiA.tournamentUID = this.tournamentUID;
		semiB.tournamentUID = this.tournamentUID;

		for (const p of this.players){
			if (i % 2 == 0)
				semiA.addPlayer(p[1], p[0]);
			else
				semiB.addPlayer(p[1], p[0]);
			i++;
		}

		this.matches.add(semiA);
		this.matches.add(semiB);
		console.log(`Info: Tournament ${this.tournamentUID} semifinals phase has been drawn`);
	}

	public drawFinals(): void {
		let finalsWinners: Match = new Match();
		let finalsLosers: Match = new Match();

		for (const m of this.matches) {
			if (m.player0UID == m.winnerUID) {
				finalsWinners.addPlayer(this.players.get(m.player0UID)[1], this.players.get(m.player0UID)[0]);
				finalsLosers.addPlayer(this.players.get(m.player1UID)[1], this.players.get(m.player1UID)[0]);
			}
			else {
				finalsWinners.addPlayer(this.players.get(m.player1UID)[1], this.players.get(m.player1UID)[0]);
				finalsLosers.addPlayer(this.players.get(m.player0UID)[1], this.players.get(m.player0UID)[0]);
			}
		}

		this.matches.clear();
		//TODO continuar aqui @@@@@@@@@@@@@@@@@@@@
		//this.matches.add




		console.log(`Info: Tournament ${this.tournamentUID} finals phase has been drawn`);
	}

	public endTournament(): void {
		//TODO implementar
		console.log(`Info: Tournament ${this.tournamentUID} has been completed`);
	}

	public getPhase(): any {
		return (this.phase);
	}
}



export class HotSeatTournament extends Tournament {
	//TODO implementar
}