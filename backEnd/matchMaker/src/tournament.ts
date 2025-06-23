import { Match } from "./match";

export enum Phase {
	DRAW ,SEMIFINALS, FINALS
}

export class Tournament {
	private maxPlayers: number;
	private partyUIDs: Set<number>;
	private matches: Set<Match>;
	currentPhase: Phase;

	constructor() {
		this.maxPlayers = 4;
		this.partyUIDs = new Set<number>();
		this.matches = new Set<Match>();
		this.currentPhase = Phase.DRAW;
	}

	private checkDupPlayer(playerUID: number): boolean {
		for (const p of this.partyUIDs){
			if (p == playerUID)
				return (true);
		}
		return (false);
	}

	public join(playerUID: number): boolean {
		if (this.partyUIDs.size >= this.maxPlayers
			|| this.checkDupPlayer(playerUID))
			return (false);

		this.partyUIDs.add(playerUID);
		if (this.partyUIDs.size >= this.maxPlayers)

		return (true);
	}

	private setupTournament(): void {
		//TODO @@@@@@ continuar aqui...
	}
}

export class HotSeatTournament extends Tournament {
	//TODO implementar
}