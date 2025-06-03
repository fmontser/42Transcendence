interface Pos {
	x: number;
	y: number;
}

interface Vect2D {
	vx: number;
	vy: number;
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
	vect: Vect2D;

	constructor(pos: Pos, radius: number) {
		super(pos);
		this.radius = radius;
		this.vect = {vx: 0,vy: 0};
	}

}

export class Paddle extends GameObject {
	pid: number;
	rect: Rect;
	bounds: Bounds;
	vect: Vect2D;


	constructor(pid: number, rect: Rect, pos: Pos) {
		super(pos);
		this.pid = pid;
		this.rect = rect;

		this.bounds = {
			bottom: rect.height,
			top: 0,
			left: 0,
			right: rect.width,
			center: {x: rect.width / 2, y: rect.height /2}
		};

		this.vect = {vx: 0,vy: 0};
	}
}