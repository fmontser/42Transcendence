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
}

export class Ball extends GameObject {
	radius: number;
	speed: number;
	vect: Vect2D;

	constructor(pos: Pos, radius: number, speed: number) {
		super(pos);
		this.radius = radius;
		this.speed = speed;
		this.vect = {x: 0,y: 0};
	}

	public transpose(vect: Vect2D, paddle0: Paddle, paddle1: Paddle, playField: PlayField) {

		//TODO COLDET
		//TODO BOUNCE
		this.pos.x += (this.speed * vect.x) / TICK_RATE;
		this.pos.y += (this.speed * vect.y) / TICK_RATE;
	};
	

}

export class Paddle extends GameObject {
	pid: number;
	speed: number;
	rect: Rect;
	bounds: Bounds;
	vect: Vect2D;

	constructor(pid: number, speed: number, rect: Rect, pos: Pos, ) {
		super(pos);
		this.pid = pid;
		this.speed = speed;
		this.rect = rect;


		this.bounds = {
			bottom: rect.height,
			top: 0,
			left: 0,
			right: rect.width,
			center: {x: rect.width / 2, y: rect.height /2}
		};

		this.vect = {x: 0,y: 0};
	}

	transpose(vect: Vect2D, playField: PlayField): void {
		let newPos: Pos = this.pos;

		newPos.y += (this.speed * vect.y) / TICK_RATE;

		if (newPos.y >= playField.bounds.bottom)
			this.pos.y = playField.bounds.bottom - this.bounds.center.y;
		else if (newPos.y <= playField.bounds.top)
			this.pos.y = playField.bounds.top + this.bounds.center.y;
		else
			this.pos.y = newPos.y;
	
	}
}