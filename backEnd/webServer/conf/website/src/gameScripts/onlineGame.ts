let gameUID!: number;
let userUID!: number;
let userSlot!: number;

let player0Name!: number;
let player0UID!: number;
let player1Name!: number;
let player1UID!: number;

let PADDLE_WIDTH!: number;
let PADDLE_HEIGHT!: number;
let BALL_RADIUS!: number;

//TODO testing, gameActive/gameStarted

export class const gameInstance = new multiplayerModule.MultiplayerGame(); {
	private playField: any = document.getElementById('playField');
	private ctx2d: any = this.playField.getContext('2d');
	private scoreElement: any = document.getElementById('score');
	private matchMakerConnector!: MatchMakerConnector;
	private serverPongConnector!: ServerPongConnector;
	
	private _gameState = {
		ball: { x: 0, y: 0 },
		paddles: [
			{ x: 0, y: 0 },
			{ x: 0, y: 0 }
		],
		score: [0, 0]
	};

	constructor (userUID: number) {
		userUID = userUID;
	}

	public start(): void {
		this.matchMakerConnector = new MatchMakerConnector(this);
	}


	public announceMatch() {
		let countdown = 3;

		const drawCurrentAnnounceState = (currentCountdownValue: any) => {
			this.ctx2d.fillStyle = '#1a1a1a';
			this.ctx2d.fillRect(0, 0, this.playField.width, this.playField.height);

			this.ctx2d.fillStyle = 'white';
			this.ctx2d.font = '28px monospace';

			this.ctx2d.textAlign = 'left';
			const player0Display = `${player0Name || 'Player 0'} (UID: ${player0UID || 'N/A'})`;
			this.ctx2d.fillText(player0Display, 70, this.playField.height / 2 - 30);

			this.ctx2d.textAlign = 'right';
			const player1Display = `${player1Name || 'Player 1'} (UID: ${player1UID || 'N/A'})`;
			this.ctx2d.fillText(player1Display, this.playField.width - 70, this.playField.height / 2 - 30);

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
		this.ctx2d.fillText(`Winner: Player ${endGameData.winnerUID}`, 
			this.playField.width/2, this.playField.height/2 + 50);
	}

	set setGameState(data: any) {
		this._gameState.ball = data.ballPos;
		this._gameState.paddles = data.paddlesPos;
		this._gameState.score = data.score;
	}
	
}

class MatchMakerConnector {
	private gameCtx: OnlineGame;
	private ws: any;

	constructor (gameCtx: OnlineGame) {
		this.gameCtx = gameCtx;
		this.connect();
		this.setupEvents();
	}

	private connect(): void {
		try {
			this.ws = new WebSocket(`wss://${window.location.hostname}:8443/matchmaker/front/post/match`);
		} catch (error) {
			console.log(`Error: connection to matchMaker failed: ${error}`)
		}
	}

	private setupEvents(): void {
		this.ws.onopen = () => {
			this.sendMatchRequest();
		};

		this.ws.onmessage = (event: any) => {
			const data = JSON.parse(event.data);
			switch(data.type) {
				case 'matchAnnounce':
					console.log("Info: Recieved match announce from matchMaker");
					this.handleAnnounceResponse(data);
					break;
			}
		};

		this.ws.onclose = () => {
			console.log('Disconected from match maker.');
		};

		this.ws.onerror = (error: any) => {
			console.error('WebSocket error:', error);
		};
	}

	private sendMatchRequest(): void {
		this.ws.send(JSON.stringify({
			type: 'matchRequest',
			userUID: userUID
		}));
		console.log("Info: Match request sent to matchMaker");
	}

	private handleAnnounceResponse(data: any) {
		gameUID = data.gameUID;
		player0UID = data.player0UID;
		player0Name = data.player0Name;
		player1UID = data.player1UID;
		player1Name = data.player1Name;

		if (player0UID == userUID)
			userSlot = 0;
		else
			userSlot = 1;

		this.gameCtx.announceMatch();
		this.ws.close();
	}
}

class ServerPongConnector {
	private ws: any;
	private gameCtx: OnlineGame;

	constructor (gameCtx: OnlineGame) {
		this.gameCtx = gameCtx;
		this.connect();
		this.setupEvents();
		this.setupControls();
	}

	private connect(): void {
		try {
			this.ws = new WebSocket(`wss://${window.location.hostname}:8443/serverpong/front/get/multi`);
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
				case 'playerDisconnected':
					this.gameCtx.drawEndGameScreen(data);
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
			let input = { type: 'input', playerSlot: userSlot, direction: 'stop' };
			if (userSlot == 0) {
				switch(event.key) {
					case 'w':
						input.direction = 'up';
						this.ws.send(JSON.stringify(input));
						break;
					case 's':
						input.direction = 'down';
						this.ws.send(JSON.stringify(input));
						break;
				}
			} else if (userSlot == 1) {
				switch(event.key) {
					case 'ArrowUp':
						input.direction = 'up';
						this.ws.send(JSON.stringify(input));
						break;
					case 'ArrowDown':
						input.direction = 'down';
						this.ws.send(JSON.stringify(input));
						break;
				}
			}
		});

		document.addEventListener('keyup', (event) => {
			let input = { type: 'input', playerSlot: userSlot, direction: 'stop' };
			
			if (userSlot == 0) {
				switch(event.key) {
					case 'w':
					case 's':
						this.ws.send(JSON.stringify(input));
						break;
				}
			} else if (userSlot == 1) {
				switch(event.key) {
					case 'ArrowUp':
					case 'ArrowDown':
						this.ws.send(JSON.stringify(input));
						break;
				}
			}
		});
	}

	private sendSetupRequest() {
		this.ws.send(JSON.stringify({
			type: 'setupRequest',
			userUID: userUID,
			userSlot: userSlot,
			gameUID: gameUID
		}));
	}

	private sendStartRequest() {
		this.ws.send(JSON.stringify({
			type: 'startRequest',
			userUID: userUID
		}));
	}

	private handleSetupResponse(data: any) {
		PADDLE_WIDTH = data.paddleWidth;
		PADDLE_HEIGHT = data.paddleHeight;
		BALL_RADIUS = data.ballRadius;
		this.gameCtx.setGameState(data);
		this.sendStartRequest();
	}
}