let player0Name!: string;	//TODO pasar temporal alias
let player1Name!: string;	//TODO pasar temporal alias

let PADDLE_WIDTH!: number;
let PADDLE_HEIGHT!: number;
let BALL_RADIUS!: number;

export class LocalGame {
	private playField: any = document.getElementById('playField');
	private ctx2d: any = this.playField.getContext('2d');
	private scoreElement: any = document.getElementById('score');
	private serverPongConnector!: ServerPongConnector;

	private _gameState = {
		ball: { x: 0, y: 0 },
		paddles: [
			{ x: 0, y: 0 },
			{ x: 0, y: 0 }
		],
		score: [0, 0]
	};

	constructor (p0Name: string, p1Name: string) {
		player0Name = p0Name;
		player1Name = p1Name;
	}

	public start():  void {
		this.serverPongConnector = new ServerPongConnector(this);
	} 

	//TODO FRONTEND estetica
	public drawGame(): void {
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

		// vall
		this.ctx2d.beginPath();
		this.ctx2d.arc(this._gameState.ball.x, this._gameState.ball.y, BALL_RADIUS, 0, Math.PI * 2);
		this.ctx2d.fill();

		// score
		this.scoreElement.textContent = `${this._gameState.score[0]} - ${this._gameState.score[1]}`;
	}

	public drawEndGameScreen(endGameData: any) {
		// canvas
		this.ctx2d.fillStyle = '#1a1a1a';
		this.ctx2d.fillRect(0, 0, this.playField.width, this.playField.height);

		// results
		this.ctx2d.fillStyle = 'white';
		this.ctx2d.font = '48px monospace';
		this.ctx2d.textAlign = 'center';
		
		// title
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

class ServerPongConnector {
	private ws: any;
	private gameCtx: LocalGame;

	constructor (gameCtx: LocalGame) {
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
					this.gameCtx.drawGame();
					break;
				case 'endGame':
					this.gameCtx.drawEndGameScreen(data);
					break;
			}
		};

		this.ws.onclose = () => {
			console.log('Desconectado del servidor');
		};

		this.ws.onerror = (error: any) => {
			console.error('Error en WebSocket:', error);
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
			type: 'startRequest'
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