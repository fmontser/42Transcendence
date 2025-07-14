import { Match } from "./match";
import { matchManager } from "./matchmaker";
import { Status } from "./matchManager";

export enum Phase {
	DRAW, SEMIFINALS, FINALS, COMPLETED, CANCELED
}
const MAX_PLAYERS: number = 4;

interface Player {
	id: number;
	name: string;
	avatar: string;
	connection: any;
	card: string;
	ready: boolean;
}

export class Tournament {

	ranking: Map<number, Player>;
	matches: Set<Match>;

	private players: Map<number, Player>;
	private phase: Phase;

	private tournamentState = {
		type: 'statusUpdate',
		phase: 0,
		cards: [
			{ id: "card-3a", name: "", avatar: "" },
			{ id: "card-3b", name: "", avatar: "" },
			{ id: "card-3c", name: "", avatar: "" },
			{ id: "card-3d", name: "", avatar: "" },
			{ id: "card-2a", name: "", avatar: "" },
			{ id: "card-2b", name: "", avatar: "" },
			{ id: "card-1a", name: "", avatar: "" }
		],
		ranking: [0, 0, 0, 0]
	};

	constructor() {

		this.players = new Map<number, Player>();
		this.ranking = new Map<number, Player>();
		this.matches = new Set<Match>();
		this.phase = Phase.DRAW;
	}

	public async join(userId: number, connection: any): Promise<void> {
		this.addPlayer({
			id: userId,
			name: await this.getPlayerName(userId),
			avatar: await this.getPlayerAvatar(userId),
			connection: connection,
			card: "",
			ready: false
		});
		this.broadcastStatus();
		if (this.players.size == MAX_PLAYERS) {
			this.changePhase(Phase.SEMIFINALS);
			this.broadcastTournamentResponse();
		}
	}

	private drawPairings(interval: number): void {
		//TODO @@@@@@@@ comprobar que los emparejamentos coinciden con el front END
		interval *= 0.6;
		if (interval < 100)
			return;
		const entries = Array.from(this.players.entries());
		for (let i = entries.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[entries[i], entries[j]] = [entries[j], entries[i]];
		}
		this.players = new Map(entries);

		let i = 0;
		for (const [id, player] of this.players) {
			this.tournamentState.cards[i].name = player.name;
			this.tournamentState.cards[i].avatar = player.avatar;
			i++;
		}
		this.broadcastStatus();
		setTimeout(() => this.drawPairings(interval), interval);
	}

	public async drawSemifinals(): Promise<void> {
		
		this.drawPairings(1000);

		const playersArray = Array.from(this.players.entries());

		const matchA = await matchManager.requestPairedMatch(this,
			[	
				playersArray[0][1].connection,
				playersArray[1][1].connection
			],
			[
				playersArray[0][1].id,
				playersArray[1][1].id
			]);

		const matchB =	await matchManager.requestPairedMatch(this,
			[
				playersArray[2][1].connection,
				playersArray[3][1].connection
			],
			[
				playersArray[2][1].id,
				playersArray[3][1].id
			]);

		this.matches.add(matchA);
		this.matches.add(matchB);
		console.log(`Info: Tournament semifinals phase has been drawn`);
	}

	public async drawFinals(): Promise<void> {
		let winners: Set<[any, number]> = new Set<[any, number]>();
		let losers: Set<[any, number]> = new Set<[any, number]>();


		for (const m of this.matches) {
			if (m.status !== Status.COMPLETED)
				return;
			if (m.winnerId === m.player0Id) {
				winners.add([m.player0Conn, m.player0Id]);
				losers.add([m.player1Conn, m.player1Id]);
			}
			else if (m.winnerId === m.player1Id) {
				winners.add([m.player1Conn, m.player1Id]);
				losers.add([m.player0Conn, m.player0Id]);
			}
		}

		//TODO @@@@@@@@@@ en este punto deberia actualizarse la web para mostrar los nuevos emparejameintos...

		const winnersArray = Array.from(winners);
		const losersArray = Array.from(losers);

		const matchA = await matchManager.requestPairedMatch(this,
			[	
				winnersArray[0][0],
				winnersArray[1][0]
			],
			[
				winnersArray[0][1],
				winnersArray[1][1]
			]);

		const matchB =	await matchManager.requestPairedMatch(this,
			[	
				losersArray[0][0],
				losersArray[1][0]
			],
			[
				losersArray[0][1],
				losersArray[1][1]
			]);

		this.matches.add(matchA);
		this.matches.add(matchB);
		this.resetAllReadyStates();
		this.phase = Phase.FINALS;
		console.log(`Info: Tournament finals phase has been drawn`);
	}

	public cancel(): void {
		console.log(`Info: Tournament canceled`);
		this.phase = Phase.CANCELED;
		this.matches.clear();
		this.players.clear();
	}

	public endTournament(): void {

		for (const m of this.matches) {
			if (m.status !== Status.COMPLETED)
				return;
		}
		
		//TODO finalizar el torneo...
		console.log(`DEBUG: >>>>>>>>>>>>>> END TOURNAMENT CALLED!!!!!`)
		/* 		const matchArray = Array.from(this.matches);
		
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
				this.resetAllReadyStates();
				this.phase =  Phase.COMPLETED;
				console.log(`Info: Tournament complete, ranking is:\n
				p1: ${this.ranking.get(1)}\n
				p2: ${this.ranking.get(2)}\n
				p3: ${this.ranking.get(3)}\n
				p4: ${this.ranking.get(4)}
				`); */
	}

	public getPlayers(): any { return (this.players); }
	public getPhase(): any { return (this.phase) };

	private async getPlayerName(userId: number): Promise<string> {
		const response = await fetch(`http://dataBase:3000/get/username?id=${userId}`);
		const data = await response.json();
		return (data[0].name);
	}

	private async getPlayerAvatar(userId: number): Promise<string> {
		const response = await fetch(`http://dataBase:3000/get/avatar?id=${userId}`);
		const data = await response.json();
		return (data[0].avatar);
	}

	private addPlayer(player: Player): void {
		for (const c of this.tournamentState.cards) {
			if (c.name === "") {
				c.name = player.name;
				c.avatar = player.avatar;
				player.card = c.id;
				this.players.set(player.id, player);
				return;
			}
		}
	}

	private async broadcastStatus(): Promise<void> {
		for (const p of this.players) {
			await (p[1] as Player).connection.send(JSON.stringify(this.tournamentState));
		}
	}

	private async broadcastTournamentResponse(): Promise<void> {
		this.broadcastStatus();
		for (const p of this.players) {
			await (p[1] as Player).connection.send(JSON.stringify({
				type: 'tournamentResponse'
			}));
		}
		//TODO borrar solo es para test
		this.drawSemifinals();
	}

	private changePhase(phase: Phase): void {
		this.phase = phase;
		this.tournamentState.phase = phase;
	}

	private resetAllReadyStates(): void {
		for (const p of this.players) {
			(p[1] as Player).ready = false;
		}
	}
}