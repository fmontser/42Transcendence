import { TICK_RATE } from "./serverpong";

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
	paddle0!: Paddle;
	paddle1!: Paddle;
	ball!: Ball;

	constructor(rect: Rect, pos: Pos) {
		super(pos);
		this.rect = rect;

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

	public transpose() {

		//TODO COLDET
		//TODO BOUNCE
		this.pos.x += (this.speed * this.vect.x) / TICK_RATE;
		this.pos.y += (this.speed * this.vect.y) / TICK_RATE;
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

	updateVector(direction: string) {
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