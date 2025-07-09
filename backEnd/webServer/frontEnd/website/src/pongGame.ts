import { MatchMakerConnector } from "./matchMakerConnector.js";
import { ServerPongConnector } from "./serverPongConnector.js";

export class PongGame {
	private playField: any = document.getElementById('playField');
	private ctx2d: any = this.playField.getContext('2d');
	private scoreElement: any = document.getElementById('score');
	private matchMakerConnector!: MatchMakerConnector;
	private serverPongConnector!: ServerPongConnector;

	public leftPlayerName!: string;
	public rightPlayerName!: string;

	public PADDLE_WIDTH!: number;
	public PADDLE_HEIGHT!: number;
	public BALL_RADIUS!: number;
	
	private _gameState = {
		ball: { x: 0, y: 0 },
		paddles: [
			{ x: 0, y: 0 },
			{ x: 0, y: 0 }
		],
		score: [0, 0]
	};

	constructor () {}

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
			this.ctx2d.fillText(this.leftPlayerName, 70, this.playField.height / 2 - 30);

			this.ctx2d.textAlign = 'right';
			this.ctx2d.fillText(this.rightPlayerName, this.playField.width - 70, this.playField.height / 2 - 30);

			this.ctx2d.textAlign = 'center';
			this.ctx2d.font = '36px monospace';
			this.ctx2d.fillText(`Match ID: ${'LOADING...'}`, this.playField.width / 2, this.playField.height / 2 - 100);

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
				this.PADDLE_WIDTH,
				this.PADDLE_HEIGHT
			);
		});

		// ball
		this.ctx2d.beginPath();
		this.ctx2d.arc(this._gameState.ball.x, this._gameState.ball.y, this.BALL_RADIUS, 0, Math.PI * 2);
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
		let winnerName: string = endGameData.score[0] > endGameData.score[1] ? this.leftPlayerName : this.rightPlayerName;
		this.ctx2d.fillText(`Winner: ${winnerName}`, this.playField.width/2, this.playField.height/2 + 50);
	}

	public setGameState(data: any) {
		this._gameState.ball = data.ballPos;
		this._gameState.paddles = data.paddlesPos;
		this._gameState.score = data.score;
	}
}