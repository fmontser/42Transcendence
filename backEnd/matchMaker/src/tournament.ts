import { Match } from "./match";

export enum Phase {
	DRAW ,SEMIFINALS, FINALS, COMPLETED
}

export class Tournament {
	tournamentUID: number;
	private maxPlayers: number;
	private players: Map<number, any>;
	matches: Map<Phase, Match>;
	private phase: Phase;
	ranking: Map<number, number>;

	constructor() {
		this.tournamentUID = 0;
		this.maxPlayers = 4;
		this.players = new Map<number, any>();
		this.matches = new Map<Phase, Match>();
		this.ranking = new Map<number, number>([[1,0],[2,0],[3,0],[4,0]]);
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

		this.matches.set(Phase.SEMIFINALS, semiA);
		this.matches.set(Phase.SEMIFINALS, semiB);
	}

	private drawFinals(): void {
		//TODO implementar
	}

	public getPhase(): any {
		return (this.phase);
	}
}



export class HotSeatTournament extends Tournament {
	//TODO implementar
}