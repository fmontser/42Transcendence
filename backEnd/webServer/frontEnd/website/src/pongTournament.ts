import { MatchMakerConnector } from "./matchMakerConnector.js";

export class PongTournament {
	private matchMakerConnector!: MatchMakerConnector;

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
		ranking: [0,0,0,0]
	};

	constructor () {}

	public start(): void {
		this.matchMakerConnector = new MatchMakerConnector(this);
	}

	public updateState(data: any): void {
		this.tournamentState = data;
		this.updateCards();
	}

 	private updateCards(): void {
		for (const c of this.tournamentState.cards) {
			if (c.name === "")
				return;

			const card: any = document.getElementById(c.id);
			const avatar: any = card?.querySelector('.avatar');
			const name: any = card?.querySelector('.name');
			const img = avatar?.querySelector('img');

			if (name)
				name.textContent = c.name;
			if (img) {
				img.src = c.avatar;
				img.style.display = 'block';
			}
		}
	}

	public announceTournament(): void {
		console.log(`Info: Tournament announced`);
		//TODO implementar
	}

}