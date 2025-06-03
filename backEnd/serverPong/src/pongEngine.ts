import { PlayField, Ball, Paddle } from './gameObjects';
import { P1, P2,
		 PLAYFIELD_POS, PLAYFIELD_SIZE,
		 PADDLE_SPEED, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_MARGIN,
		 BALL_RADIUS, BALL_SPEED } from './serverpong';

export class Game {
	paddleMargin: number = 16;

	static list: Set<Game> = new Set<Game>();
	score: number[];
	maxScore: number;
	playField: PlayField;
	ball: Ball;
	paddle0: Paddle;
	paddle1: Paddle;

	constructor(maxScore: number) {
		this.score = [0,0];
		this.maxScore = maxScore;

		this.playField = new PlayField(PLAYFIELD_SIZE, PLAYFIELD_POS);

		this.ball = new Ball(
			this.playField.bounds.center,
			BALL_RADIUS,
			BALL_SPEED
		);

		this.paddle0 = new Paddle(
			P1,
			PADDLE_SPEED,
			{width: PADDLE_WIDTH, height: PADDLE_HEIGHT},
			{x: this.playField.bounds.left + PADDLE_MARGIN, y: this.playField.bounds.center.y}
		);

		this.paddle1 = new Paddle(
			P2,
			PADDLE_SPEED,
			{width: PADDLE_WIDTH, height: PADDLE_HEIGHT},
			{x: this.playField.bounds.right - PADDLE_MARGIN, y: this.playField.bounds.center.y}
		);

		Game.list.add(this);
	}

	public GameStart(): void {

		while (this.score[P1] < this.maxScore || this.score[P2]) {
			

			this.paddle0.transpose({x: 0, y: 0}, this.playField); //Temp values (stoped)
			this.paddle1.transpose({x: 0, y: 0}, this.playField);
			this.ball.transpose({x: 0, y: 0}, this.paddle0, this.paddle1, this.playField);

		}
		//TODO declare winner...
	}

}