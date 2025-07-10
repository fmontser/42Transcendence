import { PlayField } from './playField';
import { Ball } from './ball';
import { Paddle } from './paddle';

import { P1, P2, TICK_INTERVAL,
		 PLAYFIELD_POS, PLAYFIELD_SIZE,
		 PADDLE_SPEED, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_MARGIN,
		 BALL_RADIUS, BALL_SPEED,
		 MAX_SCORE, 
		 standardGameManager} from './serverpong';

import { clearInterval } from 'timers';

enum Status {
	PENDING, ONGOING, COMPLETED, DISCONNECTED
}

export class Player {
	connection!: any;
	userId!: number;
	public isReady: boolean;

	constructor(connection: any) {
		this.connection = connection;
		this.isReady = false;
	}
}

export class StandardGameManager {
	private StandardGameList: Set<StandardGame>;

	constructor() {
		this.StandardGameList = new Set<StandardGame>();
	}

	public createGame(player0Id: number, player1Id: number): StandardGame {
		let newGame: StandardGame = new StandardGame(player0Id, player1Id);
		this.StandardGameList.add(newGame);
		return (newGame);
	}

	public joinGame(player: Player): StandardGame {
		let newGame: StandardGame  = this.findGame(player);
		newGame.addPlayer(player);
		return (newGame);
	}

	private findGame(player: Player): StandardGame {
		let pongGame!: StandardGame;

		for(const game of this.StandardGameList) {
			if (game.player0Id == player.userId || game.player1Id == player.userId)
				pongGame = game;
		}
		return (pongGame);
	}

	public deleteGame(game: StandardGame): void {
		this.StandardGameList.delete(game);
	}

}

export abstract class PongGame {
	public score: number[];
	public player0Id!: number;
	public player1Id!: number;
	public playField: PlayField;
	protected players!: Player[];
	protected maxScore: number;
	protected gameLoop!: NodeJS.Timeout;
	protected status!: Status;
	protected winnerId!: number;
	protected endType!: string;

	constructor(player0Id: number, player1Id: number) {

		this.score = [0,0];
		this.players = [];
		this.maxScore = MAX_SCORE;
		this.status = Status.PENDING;
		this.player0Id = player0Id;
		this.player1Id = player1Id;

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

	public abstract gameStart(connection: any): void;
	public abstract gameEnd(playerDisconected:  Player | null): void;
}

export class StandardGame extends PongGame {
	
	constructor(player0Id: number, player1Id: number) {
		super(player0Id, player1Id);
	}

	public addPlayer(player: Player): void {
		this.players.push(player);
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
	
	public gameSetup(player: Player): void {
		player.connection.send(JSON.stringify({
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

		if (this.status != Status.PENDING)
			return;
		else
			this.status = Status.ONGOING;

		console.log(`Info: Game has started!: [ id: ${this.player0Id} vs id: ${this.player1Id}]`);
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
				ballPos: this.playField.ball.pos,
				paddlesPos: [
					this.playField.paddle0.pos,
					this.playField.paddle1.pos
				],
				score: this.score
			}));
			
		}, TICK_INTERVAL);
	}

	public async activateMatchDaemon(connection: any): Promise<void> {

		console.log('Info: Setup game end daemon...');
		await new Promise(resolve => {
			const interval = setInterval(() => {
				if (this.status == Status.COMPLETED || this.status == Status.DISCONNECTED) {
					clearInterval(interval);
					resolve(true);
				}
			}, 300);
		});

		connection.send(JSON.stringify({
			type: this.endType,
			winnerId: this.winnerId,
			score: this.score
		}))
		console.log("Info: Sent game summary to matchMaker");
	}

	public gameEnd(disconnectedPlayer: Player | null): void {

		if (this.status == Status.COMPLETED)
			return;
		if (disconnectedPlayer != null) {
			this.winnerId = this.players[P1].userId == disconnectedPlayer.userId ? this.players[P1].userId : this.players[P2].userId;
			this.endType = 'playerDisconnected';
			this.status = Status.DISCONNECTED;
		} else {
			this.winnerId = this.score[P1] > this.score[P2] ? this.players[P1].userId : this.players[P2].userId;
			this.endType = 'endGame';
			this.status = Status.COMPLETED;
		}

		this.broadcastSend(JSON.stringify({
			type: this.endType,
			winnerId: this.winnerId,
			score: this.score
		}));
		console.log("Info: Sent game summary to players");

		standardGameManager.deleteGame(this);
		this.broadcastClose();
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