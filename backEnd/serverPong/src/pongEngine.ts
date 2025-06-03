import * as GameObjects from './gameObjects';
import { PlayField } from './gameObjects';
import { Ball } from './gameObjects';
import { Paddle } from './gameObjects';

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

		this.playField = new PlayField({width: 1280, height: 720}, {x: 0, y: 0});

		this.ball = new Ball(
			{x: this.playField.rect.width / 2, y: this.playField.rect.height / 2},
			this.playField.rect.width / 10
		);

		this.paddle0 = new Paddle(
			0,
			{width: 64, height: 256},
			{x: this.playField.pos.x + this.paddleMargin, y: this.playField.rect.height / 2}
		);

		this.paddle1 = new Paddle(
			1,
			{width: 64, height: 256},
			{x: this.playField.rect.width - this.paddleMargin, y: this.playField.rect.height / 2}
		);

		Game.list.add(this);
	}


}