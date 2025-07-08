import { PongGame, PlayerPosition } from "./pongGame.js";

export class ServerPongConnector {
	private ws: any;
	private gameCtx: PongGame;

	constructor (gameCtx: PongGame) {
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
			let input = { type: 'input', playerSlot: this.gameCtx.userSlot, direction: 'stop' };
			if (this.gameCtx.userSlot == PlayerPosition.LEFT) {
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
			} else if (this.gameCtx.userSlot == PlayerPosition.RIGHT) {
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
			let input = { type: 'input', playerSlot: this.gameCtx.userSlot, direction: 'stop' };
			
			if (this.gameCtx.userSlot == PlayerPosition.LEFT) {
				switch(event.key) {
					case 'w':
					case 's':
						this.ws.send(JSON.stringify(input));
						break;
				}
			} else if (this.gameCtx.userSlot == PlayerPosition.RIGHT) {
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
			userSlot: this.gameCtx.userSlot,
		}));
	}

	private sendStartRequest() {
		this.ws.send(JSON.stringify({
			type: 'startRequest'
		}));
	}

	private handleSetupResponse(data: any) {
		this.gameCtx.PADDLE_WIDTH = data.paddleWidth;
		this.gameCtx.PADDLE_HEIGHT = data.paddleHeight;
		this.gameCtx.BALL_RADIUS = data.ballRadius;
		this.gameCtx.setGameState(data);
		this.sendStartRequest();
	}
}