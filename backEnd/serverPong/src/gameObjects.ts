import { P1, P2, TICK_RATE } from "./serverpong";
import { Game } from './pongEngine'

interface Pos {
	x: number;
	y: number;
}

interface Vect2D {
	x: number;
	y: number;
}

interface Rect {
	width: number;
	height: number;
}

interface Bounds {
	top: number;
	bottom: number;
	left: number;
	right: number;
	center: Pos;
}

export abstract class GameObject {
	protected static list: Set<GameObject> = new Set();
	pos: Pos;

	constructor(pos: Pos) {
		this.pos = pos;
		GameObject.list.add(this);
	}
}

export class PlayField extends GameObject {
	rect: Rect;
	bounds: Bounds;
	game: Game;
	paddle0!: Paddle;
	paddle1!: Paddle;
	ball!: Ball;

	constructor(game: Game, rect: Rect, pos: Pos) {
		super(pos);
		this.rect = rect;
		this.game = game;

		this.bounds = {
			bottom: rect.height,
			top: 0,
			left: 0,
			right: rect.width,
			center: {x: rect.width / 2, y: rect.height /2}
		};
	}

	setPaddle0(paddle0: Paddle) {
		paddle0.playField = this;
		this.paddle0 = paddle0
	};

	setPaddle1(paddle1: Paddle) {
		paddle1.playField = this;
		this.paddle1 = paddle1
	};

	setBall(ball: Ball) {
		ball.playField = this;
		this.ball = ball;
	};
}

export class Ball extends GameObject {
	radius: number;
	speed: number;
	vect: Vect2D;
	playField!: PlayField;

	constructor(pos: Pos, radius: number, speed: number) {
		super(pos);
		this.radius = radius;
		this.speed = speed;
		this.vect = {x: 0,y: 0};
	}

	launchBall(): void {
		this.pos = { ...this.playField.bounds.center };
		this.vect.x = Math.random() < 0.5 ? 1 : -1;
		this.vect.y = Math.random() < 0.5 ? 1 : -1;
	}

	private scaleVect(vect: Vect2D, distance: number): Pos {
		let newPos: Pos = this.pos;

		let vectLong: number = Math.sqrt(Math.pow(vect.x, 2) + Math.pow(vect.y, 2));
		let vectNorm: Vect2D = {x: vect.x / vectLong, y: vect.y / vectLong};
		
		newPos.x += vectNorm.x * distance;
		newPos.y += vectNorm.y * distance;
		return (newPos);
	}

	private getDistance(paddle: Paddle): number {
		let nearestPos: Pos = {x: 0, y: 0};
		let distance: number;
		let dx!: number;
		let dy!: number;

		let px = paddle.pos.x;
		let py = paddle.pos.y;
		let pw = paddle.rect.width;
		let ph = paddle.rect.height;

		let bx = this.pos.x;
		let by = this.pos.y;
		let br = this.radius;

		nearestPos.x = Math.max(px, Math.min(bx, (px + pw)));
		nearestPos.y = Math.max(py, Math.min(by, (py + ph)));

		dx = bx - nearestPos.x;
		dy = by - nearestPos.y;
		distance = Math.sqrt((Math.pow(dx, 2) + Math.pow(dy, 2)));

		return (distance);
	}

	private bounce(paddle: Paddle, distance: number): void {
		let px = paddle.pos.x;
		let py = paddle.pos.y;
		let pw = paddle.rect.width;
		let ph = paddle.rect.height;

		let bx = this.pos.x;
		let by = this.pos.y;

		let bounce:  number = Math.abs(distance - this.radius);
		let invertedVector: Vect2D = {x: this.vect.x * -1, y: this.vect.y * -1};

		this.pos = this.scaleVect(invertedVector, bounce);

		const horizontal = (bx < px || bx > (px + pw));
		const vertical = (by < py || by > (py + ph));

		if (horizontal && vertical) {
			this.vect.x *= -1;
			this.vect.y *= -1;
		}
		else if (horizontal) {
			this.vect.x *= -1;
		}
		else if (vertical) {
			this.vect.y *= -1;
}
		
	}

	public transpose(): void {

		this.pos.x += (this.speed * this.vect.x) / TICK_RATE;
		this.pos.y += (this.speed * this.vect.y) / TICK_RATE;

		//COLDET PLAYFIELD + BOUNCE cutre...
		
		if (this.pos.y + this.radius >= this.playField.bounds.bottom) {
			this.pos.y = this.playField.bounds.bottom - this.radius;
			this.vect.y *= -1;
		}
		else if (this.pos.y - this.radius <= this.playField.bounds.top) {
			this.pos.y = this.playField.bounds.top + this.radius;
			this.vect.y *= -1;
		}



		//COLDET PADDLES

		//TODO aplicar la interseccion del circulo con rectangulo
		let distance!: number;

		if (this.vect.x < 0) {
			distance = this.getDistance(this.playField.paddle0);
			if (distance <= this.radius)
				this.bounce(this.playField.paddle0, distance);
		}
		else {
			distance = this.getDistance(this.playField.paddle1);
			if (distance <= this.radius)
				this.bounce(this.playField.paddle1, distance);
		}



		//SCORE

		if ( this.pos.x + this.radius >= this.playField.bounds.right) {
			this.launchBall();
			this.playField.game.score[P1]++;
		}
		else if ( this.pos.x - this.radius <= this.playField.bounds.left){
			this.launchBall();
			this.playField.game.score[P2]++;
		}

	};

}

export class Paddle extends GameObject {
	pid: number;
	speed: number;
	rect: Rect;
	vect: Vect2D;
	bounds: Bounds;
	playField!: PlayField;

	constructor(pid: number, speed: number, rect: Rect, pos: Pos) {
		super(pos);
		this.pid = pid;
		this.speed = speed;
		this.rect = rect;
		this.vect = {x: 0,y: 0};

		this.bounds = {
			bottom: rect.height,
			top: 0,
			left: 0,
			right: rect.width,
			center: {x: rect.width / 2, y: rect.height /2}
		};
	}

	updateVector(direction: string): void {
		switch(direction){
			case 'up':
				this.vect.y = -1;
				break;
			case 'down':
				this.vect.y = 1;
				break;
			case 'stop':
				this.vect.y = 0;
				break;
		}
	}

	transpose(): void {

		this.pos.y += (this.speed * this.vect.y) / TICK_RATE;

		if (this.pos.y < 0)
			this.pos.y = 0;
		else if (this.pos.y + this.bounds.bottom > this.playField.bounds.bottom)
			this.pos.y = this.playField.bounds.bottom - this.rect.height;
	}

}