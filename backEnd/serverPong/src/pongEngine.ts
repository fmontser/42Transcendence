import { PlayField } from './playField';
import { Ball } from './ball';
import { Paddle } from './paddle';

import { P1, P2, TICK_INTERVAL,
		 PLAYFIELD_POS, PLAYFIELD_SIZE,
		 PADDLE_SPEED, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_MARGIN,
		 BALL_RADIUS, BALL_SPEED,
		 MAX_SCORE } from './serverpong';
import { clearInterval } from 'timers';


export class Player {
	connection: any;
	playerSlot!: number;
	playerUID: number;
	public isReady: boolean;

	constructor(connection: any, playerUID: number) {
		this.connection = connection;
		this.playerUID = playerUID;
		this.isReady = false;
	}
}

export class MultiGameManager {
	private multiGameList: Set<MultiGame>;

	constructor() {
		this.multiGameList = new Set<MultiGame>();
	}

	public joinGame(gameUID: number, player: Player): MultiGame {
		let newGame: MultiGame | null = this.findGame(gameUID);
		if (newGame == null)
			newGame = new MultiGame(gameUID);
		this.multiGameList.add(newGame);
		newGame.addPlayer(player);
		return (newGame);
	}

	private findGame(gameUID: number): MultiGame | null {
		for(const game of this.multiGameList) {
			if (game.getUID() == gameUID)
				return (game);
		}
		return (null);
	}

	private deleteGame(game: MultiGame): void {
		//TODO delete game , informar a matchmaker??
	}

}

export abstract class Game {
	protected gameUID: number;
	public score: number[];
	protected players!: Player[];
	protected maxScore: number;
	public playField: PlayField;
	protected gameLoop!: NodeJS.Timeout;

	constructor(gameUID: number) {
		this.gameUID = gameUID;
		this.score = [0,0];
		this.maxScore = MAX_SCORE;
		this.players = [new Player(null, 0), new Player(null, 0)];

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

	public addPlayer(newPlayer: Player): void {
		for (let i = 0; i < 2; i++){
			if (this.players[i].connection == null){
				this.players[i] = newPlayer;
				this.players[i].playerSlot = i;
				return;
			}
		}
	}

	public getUID(): number { return this.gameUID; }

	public abstract gameStart(connection: any): void;
	public abstract gameEnd(connection: any): void;
}


export class LocalGame extends Game {

	constructor(gameUID: number) {
		super(gameUID);
	}

	public gameSetup(connection: any): void {
		console.log("Sent message: Game configuration");

		connection.send(JSON.stringify({
			type: 'setupResponse',
			ballPos: { x: this.playField.ball.pos.x, y: this.playField.ball.pos.y },
			ballRadius: this.playField.ball.radius,
			paddlesPos: [
				{ x: this.playField.paddle0.pos.x, y: this.playField.paddle0.pos.y },
				{ x: this.playField.paddle1.pos.x, y: this.playField.paddle1.pos.y }
			],
			paddleHeight: this.playField.paddle0.rect.height,
			paddleWidth: this.playField.paddle0.rect.width,
			score: [0, 0]
		}));
	}

	public gameStart(connection: any): void {
		this.playField.ball.launchBall();

		this.gameLoop = setInterval(() => {

			this.playField.paddle0.transpose();
			this.playField.paddle1.transpose();
			this.playField.ball.transpose();
			this.playField.ball.checkScore();

			if (this.score[P1] >= this.maxScore || this.score[P2] >= this.maxScore) {
				clearInterval(this.gameLoop);
				this.gameEnd(connection);
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

	public gameEnd(connection: any): void {
		let winnerUID: number = this.score[P1] > this.score[P2] ? this.players[P1].playerUID : this.players[P2].playerUID;
		console.log("Sent message: End game summary. winner: " + winnerUID);

		connection.send(JSON.stringify({
			type: 'endGame',
			gameUID: this.gameUID,
			player1UID: this.players[P1].playerUID,
			player2UID: this.players[P2].playerUID,
			winnerUID: winnerUID,
			score: this.score
		}));

		connection.close();
	}
}

export class MultiGame extends Game {
	
	constructor(gameUID: number) {
		super(gameUID);
	}

	private playersReady(): boolean {
		for (let player of this.players) {
			if (player.isReady == false)
				return (false);
		}
		return (true);
	}

	public async waitPlayers() {
		console.log('Info: Waiting players...');
		await new Promise(resolve => {
			const interval = setInterval(() => {
				if (this.playersReady()) {
					clearInterval(interval);
					resolve(true);
				}
			}, 1000);
		});
	}
	
	public gameSetup(connection: any, player: Player): void {
		console.log("Sent message: Game configuration");

		connection.send(JSON.stringify({
			type: 'setupResponse',
			playerSlot: player.playerSlot,
			ballPos: { x: this.playField.ball.pos.x, y: this.playField.ball.pos.y },
			ballRadius: this.playField.ball.radius,
			paddlesPos: [
				{ x: this.playField.paddle0.pos.x, y: this.playField.paddle0.pos.y },
				{ x: this.playField.paddle1.pos.x, y: this.playField.paddle1.pos.y }
			],
			paddleHeight: this.playField.paddle0.rect.height,
			paddleWidth: this.playField.paddle0.rect.width,
			score: [0, 0]
		}));
	}

	//TODO refactor a multiplayer
	public async gameStart(connection: any): Promise<void> {

		await this.waitPlayers();
		this.playField.ball.launchBall();

		this.gameLoop = setInterval(() => {

			this.playField.paddle0.transpose();
			this.playField.paddle1.transpose();
			this.playField.ball.transpose();
			this.playField.ball.checkScore();

			if (this.score[P1] >= this.maxScore || this.score[P2] >= this.maxScore) {
				clearInterval(this.gameLoop);
				this.gameEnd(connection);
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

	//TODO refactor a multiplayer
	public gameEnd(connection: any): void {
		let winnerUID: number = this.score[P1] > this.score[P2] ? this.players[P1].playerUID : this.players[P2].playerUID;
		console.log("Sent message: End game summary");

		connection.send(JSON.stringify({
			type: 'endGame',
			gameUID: this.gameUID,
			player1UID: this.players[P1].playerUID,
			player2UID: this.players[P2].playerUID,
			winnerUID: winnerUID,
			score: this.score
		}));

		connection.close();
	}
}