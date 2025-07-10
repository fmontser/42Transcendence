import { Match } from "./match";

export enum Phase {
	DRAW ,SEMIFINALS, FINALS, COMPLETED, CANCELED
}

export class Tournament {
	private maxPlayers: number;
	private players: Map<number, any>;
	private phase: Phase;
	matches:Set<Match>;
	tournamentUID: number;
	ranking: Map<number, number>;
	playersReady = 0;
	hotSeat: boolean;

	constructor(hotSeat: boolean) {
		this.tournamentUID = 0;
		this.maxPlayers = 4;
		this.players = new Map<number, any>();
		this.matches = new Set<Match>();
		this.ranking = new Map<number, number>();
		this.phase = Phase.DRAW;
		this.hotSeat = hotSeat;
	}

	private checkDupPlayer(userId: number): boolean {
		for (const p of this.players){
			if (p[0] == userId)
				return (true);
		}
		return (false);
	}

	public join(userId: number, connection: any): boolean {
		if (this.players.size >= this.maxPlayers
			|| this.checkDupPlayer(userId))
			return (false);

		this.players.set(userId, connection);
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
 			if (m.player0Id == m.winnerId) {
				finalsWinners.addPlayer(m.player0Conn, m.player0Id);
				finalsLosers.addPlayer(m.player1Conn, m.player1Id);
			}
			else {
				finalsWinners.addPlayer(m.player1Conn, m.player1Id);
				finalsLosers.addPlayer(m.player0Conn, m.player0Id);
			}
		}
		
		this.matches.clear();
		this.matches.add(finalsWinners);
		this.matches.add(finalsLosers);
		this.playersReady = 0;
		this.phase = Phase.FINALS;
		console.log(`Info: Tournament ${this.tournamentUID} finals phase has been drawn`);
	}

	public cancel(): void {
		console.log(`Info: Tournament ${this.tournamentUID} canceled`);
		this.phase = Phase.CANCELED;
		this.matches.clear();
		this.players.clear();
	}

	public endTournament(): void {
		
		const matchArray = Array.from(this.matches);

		if (matchArray[1].player0Id == matchArray[0].winnerId) {
			this.ranking.set(1, matchArray[0].player0Id);
			this.ranking.set(2, matchArray[0].player1Id);
		}
		else {
			this.ranking.set(1, matchArray[0].player1Id);
			this.ranking.set(2, matchArray[0].player0Id);
		}


		if (matchArray[1].player0Id == matchArray[1].winnerId) {
			this.ranking.set(3, matchArray[1].player0Id);
			this.ranking.set(4, matchArray[1].player1Id);
		}
		else {
			this.ranking.set(3, matchArray[1].player1Id);
			this.ranking.set(4, matchArray[1].player0Id);
		}

		this.matches.clear();
		this.players.clear();
		this.playersReady = 0;
		this.phase =  Phase.COMPLETED;
		console.log(`Info: Tournament ${this.tournamentUID} complete, ranking is:\n
		p1: ${this.ranking.get(1)}\n
		p2: ${this.ranking.get(2)}\n
		p3: ${this.ranking.get(3)}\n
		p4: ${this.ranking.get(4)}
		`);
	}

	public getPlayers(): any { return (this.players); }
	public getPhase(): any { return (this.phase) };
}