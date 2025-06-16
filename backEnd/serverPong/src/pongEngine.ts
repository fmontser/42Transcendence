import { PlayField } from './playField';
import { Ball } from './ball';
import { Paddle } from './paddle';

import { P1, P2, TICK_INTERVAL,
		 PLAYFIELD_POS, PLAYFIELD_SIZE,
		 PADDLE_SPEED, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_MARGIN,
		 BALL_RADIUS, BALL_SPEED,
		 MAX_SCORE } from './serverpong';
import { clearInterval } from 'timers';

enum Status {
	PENDING, ONGOING, COMPLETED
}

export class Player {
	connection: any;
	playerSlot: number;
	playerUID: number;
	public isReady: boolean;

	constructor(connection: any, playerUID: number, playerSlot: number) {
		this.connection = connection;
		this.playerUID = playerUID;
		this.playerSlot = playerSlot;
		this.isReady = false;
	}
}

export class MultiGameManager {
	private multiGameList: Set<MultiGame>;

	constructor() {
		this.multiGameList = new Set<MultiGame>();
	}

	public createGame(gameUID: number): MultiGame {
		let newGame: MultiGame = new MultiGame(gameUID);
		this.multiGameList.add(newGame);
		return (newGame);
	}

	public joinGame(gameUID: number, player: Player): MultiGame {
		let newGame: MultiGame  = this.findGame(gameUID);
		newGame.addPlayer(player);
		return (newGame);
	}

	private findGame(gameUID: number): MultiGame {
		let found!: MultiGame;
		
		for(const game of this.multiGameList) {
			if (game.getUID() == gameUID)
				found = game;
		}
		return (found);
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
	protected status!: Status;
	protected winnerUID!: number;
	protected endType!: string;

	constructor(gameUID: number) {
		this.gameUID = gameUID;
		this.score = [0,0];
		this.players = [];
		this.maxScore = MAX_SCORE;
		this.status = Status.PENDING;
		

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

	public addPlayer(player: Player): void {
		this.players.push(player);
	}

	public getUID(): number { return this.gameUID; }

	public abstract gameStart(connection: any): void;
	public abstract gameEnd(connection: any): void;
}

/* //TODO refactor local game
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
} */

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

	public async waitPlayers(): Promise<void> {
		console.log('Info: Waiting players...');
		await new Promise(resolve => {
			const interval = setInterval(() => {
				if (this.playersReady()) {
					clearInterval(interval);
					resolve(true);
				}
			}, 500);
		});
	}
	
	public gameSetup(connection: any, player: Player): void {
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

	public async gameStart(): Promise<void> {


		await this.waitPlayers();

		//TODO check this...
		if (this.status != Status.PENDING)
			return;
		else
			this.status = Status.ONGOING;


		console.log("Info: Game " + this.gameUID + " has started!");
		
		this.playField.ball.launchBall();

		this.gameLoop = setInterval(() => {

			this.playField.paddle0.transpose();
			this.playField.paddle1.transpose();
			this.playField.ball.transpose();
			this.playField.ball.checkScore();

			if (this.score[P1] >= this.maxScore || this.score[P2] >= this.maxScore) {
				clearInterval(this.gameLoop);
				this.gameEnd(null);
				return;
			}

			this.broadcastSend(JSON.stringify({
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

	public async launchEndDaemon(connection: any): Promise<void> {

		console.log('Info: Setup game end daemon...');
		await new Promise(resolve => {
			const interval = setInterval(() => {
				if (this.status == Status.COMPLETED) {
					clearInterval(interval);
					resolve(true);
				}
			}, 300);
		});
		connection.send(JSON.stringify({
			type: this.endType,
			gameUID: this.gameUID,
			player1UID: this.players[P1].playerUID,
			player2UID: this.players[P2].playerUID,
			winnerUID: this.winnerUID,
			score: this.score
		}))

	}

	//TODO documentar
	//TODO refactor TEMA players[] esta mal!! hazlo por slot!
	public gameEnd(disconnectedPlayer: Player | null): void {

		if (disconnectedPlayer != null) {
			this.winnerUID = this.players[P1].playerUID != disconnectedPlayer.playerUID ? this.players[P1].playerUID : this.players[P2].playerUID;
			this.endType = 'playerDisconnected';
		} else {
			this.winnerUID = this.score[P1] > this.score[P2] ? this.players[P1].playerUID : this.players[P2].playerUID;
			this.endType = 'endGame';
		}

		console.log("Sent message: End game summary");

		this.broadcastSend(JSON.stringify({
			type: this.endType,
			gameUID: this.gameUID,
			player1UID: this.players[P1].playerUID,
			player2UID: this.players[P2].playerUID,
			winnerUID: this.winnerUID,
			score: this.score
		}));

		this.status = Status.COMPLETED;

		//TODO @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ continuar aqui...

		//TODO probar los ultimos cambios!!!!!
		//TODO elminar el juego? cerrar conexion??
		//TODO this.broadcastClose();
		
		//TODO cerrar la conexion con matcmaker???
	}

	private broadcastSend(json: string): void {
		for (const player of this.players){
			player.connection.send(json);
		}
	}

	private broadcastClose(): void {
		for (const player of this.players){
			player.connection.close();
		}
	}
}