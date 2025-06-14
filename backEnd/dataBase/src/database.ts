import Fastify from 'fastify';
import FormBodyPlugin from '@fastify/formbody';
import * as SQLite3 from 'sqlite3'; 
import * as EndPoints from './endpoint'

const debugMode: boolean = false;

let db: SQLite3.Database;
const server = Fastify({
	logger: true 
});

function connect(): void {
	let dbPath: string;

	if (debugMode)
		dbPath = "../../volumes/dataBase-volume/backendDatabase.db";
	else
		dbPath = "./data/backendDatabase.db";

	db = new SQLite3.Database(dbPath, (err) => {
		if (err)
			console.error("SQLite error: Database file error - ", err.message);
	});
	console.log("Connected to 'backendDatabase'");
}

function setTables(): void {

	let tables: string[] = [
		`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT UNIQUE NOT NULL,
			pass TEXT NOT NULL
		)`,

    
		`CREATE TABLE IF NOT EXISTS profiles (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			pseudo TEXT UNIQUE DEFAULT NULL,
			bio TEXT DEFAULT '',
			date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			experience INTEGER DEFAULT 0,
			avatar TEXT DEFAULT 'default_avatar.png',
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)`,
    
		`CREATE TABLE IF NOT EXISTS friends (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			friend_id INTEGER NOT NULL,
			status TEXT DEFAULT 'pending', -- pending, accepted, blocked
			request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
			UNIQUE(user_id, friend_id)
     )`,
    
		`CREATE TABLE IF NOT EXISTS matches (
			match_id INTEGER PRIMARY KEY AUTOINCREMENT,
			player0_id INTEGER,
			player0_score INTEGER,
			player1_id INTEGER,
			player1_score INTEGER,
			winner_id INTEGER
      )`

	
		//Add tables here, comma separated.
    
	];

	tables.forEach(table => {
		db.run(table, (err) => {
		if (err)
			console.error("SQLite error: Table creation error - ", err.message);
		});
	}); 
}

function setEndPoints(): void {
	//Add endpoints here

// TODO cahnge database endpoints url -/database/front/
  
	new EndPoints.getEndpoint(
		"/get/username",
		"SELECT name FROM users WHERE id = ?",
		"Failed to get user name"
	);
	new EndPoints.getEndpoint(
		"/database/front/get/profiles",
		"SELECT * FROM profiles",
		"Failed to get profiles"
	);
	new EndPoints.getEndpoint(
		"/database/front/get/friends",
		"SELECT * FROM friends",
		"Failed to get friends"
	);

	new EndPoints.getWithParamsEndpoint(
		"/database/front/get/pseudos",
		"SELECT pseudo FROM profiles WHERE pseudo IS NOT NULL AND user_id != ?",
		"Failed to get users"
	);


	new EndPoints.getWithParamsEndpoint(
		"/database/front/get/user_id",
		`SELECT id from users WHERE name = ?`,
		"Failed to get users"
	);

	new EndPoints.getWithParamsEndpoint(
		"/database/front/get/user_id_from_pseudo",
		`SELECT user_id from profiles WHERE pseudo = ?`,
		"Failed to get users"
	);


	new EndPoints.getWithParamsEndpoint(
		"/database/front/get/profile",
		`SELECT * FROM profiles WHERE user_id = ?`,
		"Failed to get user"
	);

	new EndPoints.postEndpoint(
		"/post/match",
		"INSERT INTO matches (player0UID, player0Score, player1UID, player1Score, winnerUID) VALUES (?, 0, ?, 0, -1)",
		"Data insertion error"
	);


	new EndPoints.postEndpoint(
		"/database/front/post/profile",
		"INSERT INTO profiles (user_id) VALUES (?)",
		"Data insertion error"
	);

	new EndPoints.postEndpoint(
		"/database/front/post/friendship",
		`INSERT INTO friends (user_id, friend_id) VALUES (?, ?)`,
		"Failed to create friendship"
	);

	new EndPoints.patchEndpoint(
		"/database/front/patch/user",
		"UPDATE users SET name = ? WHERE id = ?",
		"Data update error"
	);

	new EndPoints.patchEndpoint(
		"/database/front/patch/bio",
		`UPDATE profiles SET bio = ? WHERE user_id = ?`,
		"Data update error"
	);

	new EndPoints.patchEndpoint(
		"/database/front/patch/pseudo",
		`UPDATE profiles SET pseudo = ? WHERE user_id = ?`,
		"Data update error"
	);

	new EndPoints.patchEndpoint(
		"/database/front/patch/avatar",
		`UPDATE profiles SET avatar = ? WHERE user_id = ?`,
		"Data update error"
	);

	new EndPoints.deleteEndpoint(
		"/database/front/delete/user",
		"DELETE FROM users WHERE id = ?",
		"Data removal error"
	);

	new EndPoints.deleteEndpoint(
		"/database/front/delete/profile",
		"DELETE FROM profiles WHERE id = ?",
		"Data removal error"
	);

	new EndPoints.deleteEndpoint(
		"/database/front/delete/friendships",
		"DELETE FROM friends WHERE user_id = ? or friend_id = ?",
		"Data removal error"
	);

	EndPoints.Endpoint.enableAll(server, db);
}

async function start() {

	connect();
	setTables();
	setEndPoints();
	
	try {
		server.register(FormBodyPlugin);
		await server.listen({ port: 3000, host: '0.0.0.0' });
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
}

start();
