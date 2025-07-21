import { Match } from "./match";
import { tournamentManager } from "./matchmaker";
import { Status } from "./matchManager";

export enum Phase {
	DRAW, SEMIFINALS, FINALS, COMPLETED, CANCELED
}
const MAX_PLAYERS: number = 4;

export interface Player {
	id: number;
	name: string;
	avatar: string;
	connection: any;
	card: string;
	ready: boolean;
	score: number;
}

export class Tournament {
	ranking!: [number, Player][];
	matches: Set<Match>;

	private players: Map<number, Player>;
	private previousPhase: Phase;
	private phase: Phase;

	private tournamentState = {
		type: 'statusUpdate',
		phase: Phase.DRAW,
		cards: [
			{ id: "card-3a", name: "", avatar: "", ready: false },
			{ id: "card-3b", name: "", avatar: "", ready: false },
			{ id: "card-3c", name: "", avatar: "", ready: false },
			{ id: "card-3d", name: "", avatar: "", ready: false },
			{ id: "card-2a", name: "", avatar: "", ready: false },
			{ id: "card-2b", name: "", avatar: "", ready: false },
			{ id: "card-1a", name: "", avatar: "", ready: false }
		],
		ranking: [0, 0, 0, 0]
	};

	constructor() {
		this.players = new Map<number, Player>();
		this.matches = new Set<Match>();
		this.previousPhase = Phase.DRAW;
		this.phase = Phase.DRAW;
	}

	public async join(userId: number, connection: any): Promise<void> {
		let userName: string = await this.getPlayerName(userId);
		let userAvatar: string = await this.getPlayerAvatar(userId);

		this.addPlayer({
			id: userId,
			name: userName,
			avatar: userAvatar, 
			connection: connection,
			card: "",
			ready: false,
			score: 0
		});
		await this.sendUserName(connection, userName);
		this.broadcastStatus();
		if (this.players.size == MAX_PLAYERS)
			this.changePhase(Phase.SEMIFINALS);
	}

	private async drawPairings(times: number, interval: number): Promise<void> {
		for (let t = 0; t < times; t++) {
			const cards = this.tournamentState.cards;
			const dataToShuffle = cards.slice(0, 4).map(c => ({
				name: c.name,
				avatar: c.avatar,
				ready: c.ready
			}));

			dataToShuffle.sort(() => Math.random() - 0.5);

			for (let i = 0; i < 4; i++) {
				cards[i].name = dataToShuffle[i].name;
				cards[i].avatar = dataToShuffle[i].avatar;
				cards[i].ready = dataToShuffle[i].ready;
			}

			this.broadcastStatus();
			await new Promise(resolve => setTimeout(resolve, interval));
		}
	}

	public async drawSemifinals(): Promise<void> {
		this.previousPhase = Phase.SEMIFINALS;
		await this.drawPairings(4, 500);
		await this.sendReadyRequest();
		await this.waitAllPlayersReady();

		const matchA = await tournamentManager.requestPairedMatch(this,
			[	
				this.findPlayerByName(this.tournamentState.cards[0].name).connection,
				this.findPlayerByName(this.tournamentState.cards[1].name).connection,
			],
			[
				this.findPlayerByName(this.tournamentState.cards[0].name).id,
				this.findPlayerByName(this.tournamentState.cards[1].name).id,
			]);

		const matchB =	await tournamentManager.requestPairedMatch(this,
			[
				this.findPlayerByName(this.tournamentState.cards[2].name).connection,
				this.findPlayerByName(this.tournamentState.cards[3].name).connection,
			],
			[
				this.findPlayerByName(this.tournamentState.cards[2].name).id,
				this.findPlayerByName(this.tournamentState.cards[3].name).id,
			]);

		this.matches.add(matchA);
		this.matches.add(matchB);
		console.log(`Info: Tournament semifinals phase has been drawn`);
	}

	public async drawFinals(): Promise<void> {
		this.previousPhase = Phase.FINALS;

		let winners: Set<[any, number]> = new Set<[any, number]>();
		let losers: Set<[any, number]> = new Set<[any, number]>();
		
		for (const m of this.matches) {
			if (m.winnerId === m.player0Id) {
				winners.add([m.player0Conn, m.player0Id]);
				losers.add([m.player1Conn, m.player1Id]);
			}
			else if (m.winnerId === m.player1Id) {
				winners.add([m.player1Conn, m.player1Id]);
				losers.add([m.player0Conn, m.player0Id]);
			}
		}
		
		const winnersArray = Array.from(winners);
		const losersArray = Array.from(losers);
		
		this.tournamentState.cards[2].name = "";
		this.tournamentState.cards[2].avatar = "";
		this.tournamentState.cards[3].name = "";
		this.tournamentState.cards[3].avatar = "";

		this.tournamentState.cards[0].name = this.findPlayerById(losersArray[0][1]).name;
		this.tournamentState.cards[0].avatar = this.findPlayerById(losersArray[0][1]).avatar;
		this.tournamentState.cards[1].name = this.findPlayerById(losersArray[1][1]).name;
		this.tournamentState.cards[1].avatar = this.findPlayerById(losersArray[1][1]).avatar;
		
		this.tournamentState.cards[4].name = this.findPlayerById(winnersArray[0][1]).name;
		this.tournamentState.cards[4].avatar = this.findPlayerById(winnersArray[0][1]).avatar;
		this.tournamentState.cards[5].name = this.findPlayerById(winnersArray[1][1]).name;
		this.tournamentState.cards[5].avatar = this.findPlayerById(winnersArray[1][1]).avatar;
		
		this.changePhase(Phase.FINALS);
		this.resetAllReadyStates();

		setTimeout(() => {}, 3000);

		await this.broadcastStatus();
		await this.sendReadyRequest();
		await this.waitAllPlayersReady();
		
		const matchA = await tournamentManager.requestPairedMatch(this,
			[	
				winnersArray[0][0],
				winnersArray[1][0]
			],
			[
				winnersArray[0][1],
				winnersArray[1][1]
			]);
			
		const matchB =	await tournamentManager.requestPairedMatch(this,
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
		console.log(`Info: Tournament finals phase has been drawn`);
	}



	public async endTournament(): Promise<void> {
		this.previousPhase = Phase.COMPLETED;

		for (const p of this.players){
			for (const m of this.matches){
				if (m.player0Id !== p[1].id && m.player1Id !== p[1].id)
					continue;

				if (p[1].id === m.winnerId){
					if (m.tournamentPhase === Phase.SEMIFINALS)
						p[1].score += 3;
					else if (m.tournamentPhase === Phase.FINALS)
						p[1].score += 5;
				}
				else {
					if (m.tournamentPhase === Phase.SEMIFINALS)
						p[1].score += 1;
					else if (m.tournamentPhase === Phase.FINALS)
						p[1].score += 3;
				}
			}
		}


		this.ranking = Array.from(this.players.entries());
		this.ranking.sort((a,b) => b[1].score - a[1].score);

		this.tournamentState.cards[6].name = this.ranking[0][1].name;
		this.tournamentState.cards[6].avatar = this.ranking[0][1].avatar;
		this.tournamentState.cards[4].name = this.ranking[1][1].name;
		this.tournamentState.cards[4].avatar = this.ranking[1][1].avatar;
		this.tournamentState.cards[3].name = this.ranking[2][1].name;
		this.tournamentState.cards[3].avatar = this.ranking[2][1].avatar;
	
		this.changePhase(Phase.COMPLETED);
		this.resetAllReadyStates();

		setTimeout(() => {}, 3000);

		await this.broadcastStatus();

		console.log(`Info: Tournament ended`);
	}

	public cancel(): void {
		console.log(`Info: Tournament canceled`);
		this.phase = Phase.CANCELED;
		this.matches.clear();
		this.players.clear();
	}

	public getPlayers(): Map<number, Player> { return (this.players); }

	public getPhase(): any { return (this.phase) };
	public setPhase(phase: Phase): void { this.phase = phase; }

	public getPreviousPhase(): any { return (this.previousPhase) };

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

	private findPlayerByName(name: string): Player {
		let player!: Player;
		
		for (const p of this.players) {
			if (p[1].name == name){
				player = p[1];
				break;
			}
		}
		return (player);
	}


	private findPlayerById(id: number): Player {
		let player!: Player;
		
		for (const p of this.players) {
			if (p[1].id == id){
				player = p[1];
				break;
			}
		}
		return (player);
	}

	private async sendUserName(connection: any, userName: string): Promise<void> {
		await connection.send(JSON.stringify({
			type: 'setUserName',
			userName: userName
		}));
	}

	private async broadcastStatus(): Promise<void> {
		for (const p of this.players) {
			await (p[1] as Player).connection.send(JSON.stringify(this.tournamentState));
		}
	}

	public changePhase(phase: Phase): void {
		this.phase = phase;
		this.tournamentState.phase = phase;
	}

	private async sendReadyRequest(): Promise<void> {
		for (const p of this.players) {
			await p[1].connection.send(JSON.stringify({
				type: 'readyRequest'
			}));
		}
	}

	public setPlayerReady(userId: number): void {
		for (const p of this.players) {
			if (p[1].id === userId){
				p[1].ready = true;
				for (const c of this.tournamentState.cards) {
					if (c.name == p[1].name) {
						c.ready = true;
						break;
					}
				}
				this.broadcastStatus();
				return;
			}
		}
	}

	private resetAllReadyStates(): void {
		for (const p of this.players) {
			(p[1] as Player).ready = false;
			for (const c of this.tournamentState.cards)
				c.ready = false;
			return;
		}
	}

	private async waitAllPlayersReady(): Promise<void> {
		while (true) {
			let allReady = true;
			for (const p of this.players) {
				if (!p[1].ready) {
					allReady = false;
					break;
				}
			}
			if (allReady)
				break;
			await new Promise(resolve => setTimeout(resolve, 200));
		}
	}

	public async waitAllMatchesEnd(): Promise<void> {
		while (true) {
			let allEnd = true;
			for (const m of this.matches) {
				if (m.status != Status.COMPLETED) {
					allEnd = false;
					break;
				}
			}
			if (allEnd)
				break;
			await new Promise(resolve => setTimeout(resolve, 200));
		}
	}
}