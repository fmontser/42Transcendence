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

interface Circle {
	rad: number;
}

export abstract class GameObject implements Pos, Vect2D {

	protected static list: Set<GameObject> = new Set();
	vx: number;
	vy: number;
	x: number;
	y: number;

	constructor(x_pos: number, y_pos: number) {
		this.vx = 0;
		this.vy = 0;
		this.x = x_pos;
		this.y = y_pos;

		GameObject.list.add(this);
	}
}

export class PlayField extends GameObject implements Rect {
	width: number;
	height: number;

	constructor(width: number, height: number, x_pos: number, y_pos: number) {
		super(x_pos, y_pos);
		this.width = width;
		this.height = height;
	}

}