import { Status } from "./matchManager";

export class Match {
	status: Status;
	matchUID!: number;
	tournamentUID: number;
	player0UID: number;
	player0Name!: string;
	player0Conn!: any;
	player1UID: number;
	player1Name!: string;
	player1Conn!: any;
	score: number[] = [0,0];
	winnerUID!: number;

	constructor (){
		this.status = Status.PENDING;
		this.tournamentUID = 0;
		this.player0UID = 0;
		this.player1UID = 0;
	}

	public async addPlayer(connection: any, playerUID: number) {
		if (this.player0UID == 0) {
			this.player0UID = playerUID;
			this.player0Conn = connection;
			this.player0Name = await this.getPlayerName(this.player0UID);
		} else if (this.player1UID == 0) {
			this.player1UID = playerUID;
			this.player1Conn = connection;
			this.player1Name = await this.getPlayerName(this.player1UID);
		}
	}

	public checkMatchPlayers(): boolean {
		if (this.player0UID != 0 && this.player1UID != 0) {
			return (true);
		}
		return (false);
	}

	private async getPlayerName(playerUID: number): Promise<string> {
		const response = await fetch(`http://dataBase:3000/get/username?id=${playerUID}`);
		const data = await response.json();
		return (data[0].name);
	}
}