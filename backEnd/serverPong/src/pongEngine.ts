import { PlayField } from './playField';
import { Ball } from './ball';
import { Paddle } from './paddle';

import { P1, P2, TICK_INTERVAL,
		 PLAYFIELD_POS, PLAYFIELD_SIZE,
		 PADDLE_SPEED, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_MARGIN,
		 BALL_RADIUS, BALL_SPEED,
		 MAX_SCORE } from './serverpong';

export class Game {
	gameUID: number;
	score: number[];
	playersUID: number [];
	maxScore: number;
	playField: PlayField;
	private gameLoop!: NodeJS.Timeout;

	constructor(gameUID: number) {
		this.gameUID = gameUID;
		this.score = [0,0];
		this.maxScore = MAX_SCORE;
		this.playersUID = [0,0];

		this.playField = new PlayField(this, PLAYFIELD_SIZE, PLAYFIELD_POS);

		this.playField.setPaddle0(new Paddle(
			P1,
			PADDLE_SPEED,
			{width: PADDLE_WIDTH, height: PADDLE_HEIGHT},
			{x: this.playField.bounds.left + PADDLE_MARGIN, y: this.playField.bounds.center.y - PADDLE_HEIGHT/2},
		));

		this.playField.setPaddle1(new Paddle(
			P2,
			PADDLE_SPEED,
			{width: PADDLE_WIDTH, height: PADDLE_HEIGHT},
			{x: this.playField.bounds.right - PADDLE_MARGIN - PADDLE_WIDTH, y: this.playField.bounds.center.y - PADDLE_HEIGHT/2},
		));

		this.playField.setBall(new Ball(
			this.playField.bounds.center,
			BALL_RADIUS,
			BALL_SPEED,
		));
	}

	public GameStart(connection: any, player1UID: number, player2UID: number): void {
		this.playField.ball.launchBall();
		this.playersUID[P1] = player1UID;
		this.playersUID[P2] = player2UID;

		this.gameLoop = setInterval(() => {

			this.playField.paddle0.transpose();
			this.playField.paddle1.transpose();
			this.playField.ball.transpose();
			this.playField.ball.checkScore();

			if (this.score[P1] >= this.maxScore || this.score[P2] >= this.maxScore) {
				clearInterval(this.gameLoop);
				this.GameEnd(connection);
				return;
			}

			connection.send(JSON.stringify({
				type: 'update',
				ball: this.playField.ball.pos,
				paddles: [
					this.playField.paddle0.pos,
					this.playField.paddle1.pos
				],
				score: this.score
			}));

		}, TICK_INTERVAL);
	}

	public GameEnd(connection: any): void {
		let winnerUID: number = this.score[P1] > this.score[P2] ? this.playersUID[P1] : this.playersUID[P2];

		connection.send(JSON.stringify({
			type: 'endGame',
			gameUID: this.gameUID,
			player1UID: this.playersUID[P1],
			player2UID: this.playersUID[P2],
			winnerUID: winnerUID,
			score: this.score
		}));

		connection.close();
	}
}