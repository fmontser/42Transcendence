import { Match } from "./match";

export enum Phase {
	DRAW ,SEMIFINALS, FINALS, COMPLETED
}

export class Tournament {
	private maxPlayers: number;
	private players: Map<number, any>;
	private phase: Phase;
	matches:Set<Match>;
	tournamentUID: number;
	ranking: Map<number, number>;
	playersReady = 0;

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

		finalsWinners.tournamentUID = this.tournamentUID;
		finalsLosers.tournamentUID = this.tournamentUID;

		for (const m of this.matches) {
 			if (m.player0UID == m.winnerUID) {
				finalsWinners.addPlayer(m.player0Conn, m.player0UID);
				finalsLosers.addPlayer(m.player1Conn, m.player1UID);
			}
			else {
				finalsWinners.addPlayer(m.player1Conn, m.player1UID);
				finalsLosers.addPlayer(m.player0Conn, m.player0UID);
			}
		}
		
		this.matches.clear();
		this.matches.add(finalsWinners);
		this.matches.add(finalsLosers);
		console.log(`Info: Tournament ${this.tournamentUID} finals phase has been drawn`);
	}

	public endTournament(): void {
		//TODO @@@@@@@@@@@@@@@@@@@@ implemetntar la fase final, desde el HTML hasta aqui!!!!!
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