

enum Status {
	PENDING, ONGOING, COMPLETED
}

export class MatchManager {
	matchList: Set<Match>;

	constructor() {
		this.matchList = new Set<Match>();
	}

	public joinMatch(playerUID: number) {;
		let newMatch: Match | null = this.findPendingMatch();
		if (newMatch == null) {
			newMatch = new Match();
			this.matchList.add(newMatch);
		}
		newMatch.addPlayer(playerUID);
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



	//TODO post/update results on database
}


export class Match {
	status: Status;

	matchUID!: number;

	player0UID!: number;
	player0Name!: string;

	player1UID!: number;
	player1Name!: string;

	score: number[] = [0,0];

	constructor (){
		this.status = Status.PENDING;
		this.matchUID = this.postMatchEntry();
	}

	public addPlayer(playerUID: number) {
		if (this.player0UID == undefined) {
			this.player0UID = playerUID;
			this.player0Name = this.getPlayerName(playerUID);
		} else if (this.player1UID == undefined) {
			this.player1UID = playerUID;
			this.player1Name = this.getPlayerName(playerUID);
		}
	}
	
	private postMatchEntry(): number {
		let matchUID!: number;
			//TODO post/select match database!
		return (this.matchUID);
	}

	private getPlayerName(playerUID: number): string {

		let name!: string;
			//TODO request player name to database!

		return (name);
	}
}