import { Match } from "./match";
import { matchManager } from "./matchmaker";

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

		interval *= 0.8;
		if (interval < 100)
			return;
		setTimeout(() => this.drawPairings(interval), interval);
	}

	public drawSemifinals(): void {
		
		this.drawPairings(1000);


		//TODO @@@@@@@@@@@@@@@ CONTINUAR AQUIIII!!!!    solicitar matches!!
		//TODO @@@@@@@@@@@@@@@ CONTINUAR AQUIIII!!!!    solicitar matches!!
		
		//matchManager.requestPairedMatch([],[]);


/* 		let semiA: Match = new Match();
		let semiB: Match = new Match();
		let i: number = 0;

		for (const p of this.players) {
			if (i % 2 == 0)
				semiA.addPlayer(p[1], p[0]);
			else
				semiB.addPlayer(p[1], p[0]);
			i++;
		}

		this.matches.add(semiA);
		this.matches.add(semiB); */

		console.log(`Info: Tournament semifinals phase has been drawn`);
	}

	public drawFinals(): void {
		let finalsWinners: Match = new Match();
		let finalsLosers: Match = new Match();

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