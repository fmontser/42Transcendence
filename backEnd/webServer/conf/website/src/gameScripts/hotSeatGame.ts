let gameUID!: number;
let tournamentUID!: number;

let player0Name!: string;
let player0UID!: number;
let player1Name!: string;
let player1UID!: number;

let PADDLE_WIDTH!: number;
let PADDLE_HEIGHT!: number;
let BALL_RADIUS!: number;

let user1UID!: number;
let user2UID!: number;
let user3UID!: number;
let user4UID!: number;

export class HotSeatGame {
	private playField: any = document.getElementById('playField');
	private ctx2d: any = this.playField.getContext('2d');
	private scoreElement: any = document.getElementById('score');
	private matchMakerConnector!: MatchMakerConnector;
	private serverPongConnector!: ServerPongConnector;
	public	matchCount!: number;
	
	private _gameState = {
		ball: { x: 0, y: 0 },
		paddles: [
			{ x: 0, y: 0 },
			{ x: 0, y: 0 }
		],
		score: [0, 0]
	};

	constructor (usersUIDs: number[]) {
		this.matchCount = 0;
		user1UID = usersUIDs[0];
		user2UID = usersUIDs[1];
		user3UID = usersUIDs[2];
		user4UID = usersUIDs[3];
	}

	public start(): void {
		this.matchMakerConnector = new MatchMakerConnector(this);
	}

	public announceMatch() {
		let countdown = 3;
		this.matchCount++;

		const drawCurrentAnnounceState = (currentCountdownValue: any) => {
			this.ctx2d.fillStyle = '#1a1a1a';
			this.ctx2d.fillRect(0, 0, this.playField.width, this.playField.height);

			this.ctx2d.fillStyle = 'white';
			this.ctx2d.font = '28px monospace';

			this.ctx2d.textAlign = 'left';
			this.ctx2d.fillText(player0Name, 70, this.playField.height / 2 - 30);

			this.ctx2d.textAlign = 'right';
			this.ctx2d.fillText(player1Name, this.playField.width - 70, this.playField.height / 2 - 30);

			this.ctx2d.textAlign = 'center';
			this.ctx2d.font = '36px monospace';
			this.ctx2d.fillText(`Match ID: ${gameUID || 'LOADING...'}`, this.playField.width / 2, this.playField.height / 2 - 100);

			if (currentCountdownValue > 0) {
				this.ctx2d.font = '120px monospace';
				this.ctx2d.fillStyle = 'yellow';
				this.ctx2d.fillText(currentCountdownValue.toString(), this.playField.width / 2, this.playField.height / 2 + 70);
			}
		};

		drawCurrentAnnounceState(countdown);

		const countdownInterval = setInterval(() => {
			countdown--;

			if (countdown > 0) {
				drawCurrentAnnounceState(countdown);
			} else {
				clearInterval(countdownInterval);
				this.ctx2d.fillStyle = '#1a1a1a';
				this.ctx2d.fillRect(0, 0, this.playField.width, this.playField.height);
			}
		}, 1000);

		setTimeout(() => {
			this.serverPongConnector = new ServerPongConnector(this);
		}, 3000);
	}

	//TODO FRONTEND estetica
	public drawFrame() {
		// playField
		this.ctx2d.fillStyle = '#1a1a1a';
		this.ctx2d.fillRect(0, 0, this.playField.width, this.playField.height);

		// paddles
		this.ctx2d.fillStyle = 'white';
		this._gameState.paddles.forEach(paddle => {
			this.ctx2d.fillRect(
				paddle.x,
				paddle.y,
				PADDLE_WIDTH,
				PADDLE_HEIGHT
			);
		});

		// ball
		this.ctx2d.beginPath();
		this.ctx2d.arc(this._gameState.ball.x, this._gameState.ball.y, BALL_RADIUS, 0, Math.PI * 2);
		this.ctx2d.fill();

		// score
		this.scoreElement.textContent = `${this._gameState.score[0]} - ${this._gameState.score[1]}`;
	}

	//TODO FRONTEND estetica
	public drawEndGameScreen(endGameData: any) {

		// canvas
		this.ctx2d.fillStyle = '#1a1a1a';
		this.ctx2d.fillRect(0, 0, this.playField.width, this.playField.height);

		// results
		this.ctx2d.fillStyle = 'white';
		this.ctx2d.font = '48px monospace';
		this.ctx2d.textAlign = 'center';
		
		// title
		if (endGameData.type == 'playerDisconnected')
			this.ctx2d.fillText('RAGE QUIT!', this.playField.width/2, this.playField.height/3);
		else
			this.ctx2d.fillText('Game Over!', this.playField.width/2, this.playField.height/3);
	
		// score
		this.ctx2d.font = '36px monospace';
		this.ctx2d.fillText(`Final Score: ${endGameData.score[0]} - ${endGameData.score[1]}`, 
			this.playField.width/2, this.playField.height/2);
		
		// winner
		let winnerName: string = endGameData.score[0] > endGameData.score[1] ? player0Name : player1Name;
		this.ctx2d.fillText(`Winner: ${winnerName}`, this.playField.width/2, this.playField.height/2 + 50);
	}

	public  drawTornamentRanking(data: any) {
		this.ctx2d.fillStyle = '#1a1a1a';
		this.ctx2d.fillRect(0, 0, this.playField.width, this.playField.height);

		this.ctx2d.fillStyle = 'white';
		this.ctx2d.font = '48px monospace';
		this.ctx2d.textAlign = 'center';
		this.ctx2d.fillText('TOURNAMENT RANKING', this.playField.width / 2, this.playField.height / 3);

		this.ctx2d.font = '36px monospace';
		this.ctx2d.fillText(`1st: UID ${data.p1}`, this.playField.width / 2, this.playField.height / 2 - 40);
		this.ctx2d.fillText(`2nd: UID ${data.p2}`, this.playField.width / 2, this.playField.height / 2 + 10);
		this.ctx2d.fillText(`3rd: UID ${data.p3}`, this.playField.width / 2, this.playField.height / 2 + 60);
		this.ctx2d.fillText(`4th: UID ${data.p4}`, this.playField.width / 2, this.playField.height / 2 + 110);
	}

	public setGameState(data: any) {
		this._gameState.ball = data.ballPos;
		this._gameState.paddles = data.paddlesPos;
		this._gameState.score = data.score;
	}

	public getMatchMakerConnector(): any { return this.matchMakerConnector};
}

class MatchMakerConnector {
	private gameCtx: HotSeatGame;
	private ws: any;

	constructor (gameCtx: HotSeatGame) {
		this.gameCtx = gameCtx;
		this.connect();
		this.setupEvents();
	}

	private connect(): void {
		try {
			this.ws = new WebSocket(`wss://${window.location.hostname}:8443/matchmaker/front/post/hotseat`);
		} catch (error) {
			console.log(`Error: connection to matchMaker failed: ${error}`)
		}
	}

	private setupEvents(): void {

		this.ws.onopen = () => {
			this.sendTournamentRequest();
		};

		this.ws.onmessage = (event: any) => {
			const data = JSON.parse(event.data);
			switch(data.type) {
				case 'matchAnnounce':
					console.log("Info: Recieved match announce from matchMaker");
					this.handleAnnounceResponse(data);
					break;
				case 'tournamentRanking':
					console.log("Info: Recieved tournament ranking from matchMaker");
					this.gameCtx.drawTornamentRanking(data);
					break;
			}
		};

		window.onbeforeunload = () => {
			this.ws.send(JSON.stringify({
				type: 'canceled',
				tournamentUID: tournamentUID
			}));

			this.ws.send(JSON.stringify({
				type: 'canceled'
			}));
		};

		this.ws.onclose = () => {
			console.log('Disconected from match maker.')
		};

		this.ws.onerror = (error: any) => {
			console.error('WebSocket error:', error);
		};
	}

	private sendTournamentRequest() {
		this.ws.send(JSON.stringify({
			type: 'hotSeatTournamentRequest',
			user1UID: user1UID,
			user2UID: user2UID,
			user3UID: user3UID,
			user4UID: user4UID
		}));
		console.log("Info: Hot seat tournament request sent to matchMaker");
	}

	private handleAnnounceResponse(data: any) {

		gameUID = data.gameUID;
		tournamentUID = data.tournamentUID;
		player0UID = data.player0UID;
		player0Name = data.player0Name;
		player1UID = data.player1UID;
		player1Name = data.player1Name;

		this.gameCtx.announceMatch();
	}

	public getWebSocket(): any { return this.ws };
}

class ServerPongConnector {
	private ws: any;
	private gameCtx: HotSeatGame;

	constructor (gameCtx: HotSeatGame) {
		this.gameCtx = gameCtx;
		this.connect();
		this.setupEvents();
		this.setupControls();
	}

	private connect(): void {
		try {
			this.ws = new WebSocket(`wss://${window.location.hostname}:8443/serverpong/front/get/pong`);
		} catch (error) {
			console.log(`Error: connection to serverPong failed: ${error}`);
		}
	}

	private setupEvents(): void {

		this.ws.onopen = () => {
			console.log('Conectado al servidor');
			this.sendSetupRequest();
		};

		this.ws.onmessage = (event: any) => {
			const data = JSON.parse(event.data);
			switch(data.type) {
				case 'setupResponse':
					this.handleSetupResponse(data);
					break;
				case 'update':
					this.gameCtx.setGameState(data);
					this.gameCtx.drawFrame();
					break;
				case 'endGame':
					this.gameCtx.drawEndGameScreen(data);
					this.ws.close();
					setTimeout(() => {
						this.reportTournament();
					}, 3000);
					break;
			}
		};

		this.ws.onclose = () => {
			console.log('Disconected from pong server.');
		};

		this.ws.onerror = (error: any) => {
			console.error('WebSocket error:', error);
		};
	}

	private setupControls() {
		document.addEventListener('keydown', (event) => {
			let input = { type: 'input', playerSlot: 0, direction: 'stop' };
				switch(event.key) {
				case 'w':
					input.direction = 'up';
					input.playerSlot = 0;
					break;
				case 's':
					input.direction = 'down';
					input.playerSlot = 0;
					break;
				case 'ArrowUp':
					input.direction = 'up';
					input.playerSlot = 1;
					break;
				case 'ArrowDown':
					input.direction = 'down';
					input.playerSlot = 1;
					break;
				}
				if (this.ws.readyState === WebSocket.OPEN)
					this.ws.send(JSON.stringify(input));
			});

		document.addEventListener('keyup', (event) => {
			let input = { type: 'input', playerSlot: 0, direction: 'stop' };
				switch(event.key) {
					case 'w':
					case 's':
						input.playerSlot = 0;
						break;
					case 'ArrowUp':
					case 'ArrowDown':
						input.playerSlot = 1;
						break;
				}
				if (this.ws.readyState === WebSocket.OPEN)
					this.ws.send(JSON.stringify(input));
			});
	}
	
	private sendSetupRequest() {
		this.ws.send(JSON.stringify({
			type: 'setupRequest'
		}));
	}

	private sendStartRequest() {
		this.ws.send(JSON.stringify({
			type: 'startRequest',
			player1UID: player0UID,
			player2UID: player1UID
		}));
	}

	private reportTournament() {
		if (this.gameCtx.matchCount % 2 == 0){
			console.log("Info: Hot seat Tournament phase request sent to matchMaker");
			this.gameCtx.getMatchMakerConnector().getWebSocket().send(JSON.stringify({
				type: 'hotSeatTournamentPhaseEnd',
				tournamentUID: tournamentUID
			}));
		}
	}

	private handleSetupResponse(data: any) {
		PADDLE_WIDTH = data.paddleWidth;
		PADDLE_HEIGHT = data.paddleHeight;
		BALL_RADIUS = data.ballRadius;
		this.gameCtx.setGameState(data);
		this.sendStartRequest();
	}
}