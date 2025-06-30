import Fastify from 'fastify';
import FormBodyPlugin from '@fastify/formbody';
import * as SQLite3 from 'sqlite3'; 
import * as EndPoints from './endpoint'

let db: SQLite3.Database;
const server = Fastify({
	logger: true 
});

function connect(): void {
	let dbPath: string = "./data/backendDatabase.db"

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
			pass TEXT NOT NULL,
			two_fa BOOLEAN DEFAULT FALSE,
			login_method TEXT DEFAULT 'local' -- local, google
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
			sender_id INTEGER NOT NULL,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
			UNIQUE(user_id, friend_id)
		)`,
	
		`CREATE TABLE IF NOT EXISTS matches (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			player0_id INTEGER,
			player0_score INTEGER,
			player1_id INTEGER,
			player1_score INTEGER,
			winner_id INTEGER,
			disconnected BOOLEAN
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

	new EndPoints.getEndpoint(
		"/get/user",
		"SELECT * FROM users WHERE name = ?",
		"Failed to get user id"
	);
  
	new EndPoints.getEndpoint(
		"/get/username",
		"SELECT name FROM users WHERE id = ?",
		"Failed to get user name"
	);

	new EndPoints.getEndpoint(
		"/get/profiles",
		"SELECT * FROM profiles",
		"Failed to get profiles"
	);

	new EndPoints.getEndpoint(
		"/get/friends",
		"SELECT * FROM friends",
		"Failed to get friends"
	);

	new EndPoints.getEndpoint(
		"/get/users",
		"SELECT * FROM users",
		"Failed to get users"
	);

	new EndPoints.getEndpoint(
		"/get/pseudos",
		"SELECT pseudo FROM profiles WHERE pseudo IS NOT NULL AND user_id != ?",
		"Failed to get users"
	);

	new EndPoints.getEndpoint(
		"/get/user_id",
		`SELECT id from users WHERE name = ?`,
		"Failed to get users"
	);

	new EndPoints.getEndpoint(
		"/get/user_id_from_pseudo",
		`SELECT user_id from profiles WHERE pseudo = ?`,
		"Failed to get users"
	);


	new EndPoints.getEndpoint(
		"/get/profile",
		`SELECT * FROM profiles WHERE user_id = ?`,
		"Failed to get user"
	);

	new EndPoints.getEndpoint(
		"/get/friendships_pending",
		`SELECT 
		f.id AS id,
		CASE 	
			WHEN f.user_id = ? THEN p2.pseudo
			ELSE p1.pseudo
		END AS pseudo
		FROM friends f
		JOIN profiles p1 ON p1.user_id = f.user_id
		JOIN profiles p2 ON p2.user_id = f.friend_id
		WHERE (f.user_id = ? OR f.friend_id = ?)
  		AND f.status = 'pending'
		AND f.sender_id != ?
		`,
		"Failed to get pending friendships"
	);

	new EndPoints.getEndpoint(
		"/get/friendships_accepted",
		`SELECT 
		f.id AS id,
		CASE 	
			WHEN f.user_id = ? THEN p2.pseudo
			ELSE p1.pseudo
		END AS pseudo
		FROM friends f
		JOIN profiles p1 ON p1.user_id = f.user_id
		JOIN profiles p2 ON p2.user_id = f.friend_id
		WHERE (f.user_id = ? OR f.friend_id = ?)
  		AND f.status = 'accepted'
		`,
		"Failed to get accepted friendships"
	);
	
	new EndPoints.getEndpoint(
		"/get/friendships_blocked",
		`SELECT 
		f.id AS id,
		CASE 	
			WHEN f.user_id = ? THEN p2.pseudo
			ELSE p1.pseudo
		END AS pseudo
		FROM friends f
		JOIN profiles p1 ON p1.user_id = f.user_id
		JOIN profiles p2 ON p2.user_id = f.friend_id
		WHERE (f.user_id = ? OR f.friend_id = ?)
  		AND f.status = 'blocked'
		`,
		"Failed to get blocked friendships"
	);

	new EndPoints.postEndpoint(
		"/post/match",
		"INSERT INTO matches (player0_id, player0_score, player1_id, player1_score, winner_id, disconnected) VALUES (?, ?, ?, ?, ?, ?)",
		"Data insertion error"
	);

	new EndPoints.postEndpoint(
		"/post/profile",
		"INSERT INTO profiles (user_id) VALUES (?)",
		"Data insertion error"
	);

	new EndPoints.postEndpoint(
		"/post/user",
		"INSERT INTO users (name, pass, login_method) VALUES (?, ?, ?)",
		"Data insertion error"
	);


	new EndPoints.postEndpoint(
		"/post/friendship",
		`INSERT INTO friends (user_id, friend_id, sender_id) VALUES (?, ?, ?)`,
		"Failed to create friendship"
	);

	new EndPoints.patchEndpoint(
		"/patch/match",
		"UPDATE matches SET player0_score = ?, player1_score = ?, winner_id = ?, disconnected = ? WHERE id = ?",
		"Data insertion error"
	);

	new EndPoints.patchEndpoint(
		"/patch/user",
		"UPDATE users SET name = ? WHERE id = ?",
		"Data update error"
	);

	new EndPoints.patchEndpoint(
		"/patch/bio",
		`UPDATE profiles SET bio = ? WHERE user_id = ?`,
		"Data update error"
	);

	new EndPoints.patchEndpoint(
		"/patch/friendship",
		`UPDATE friends SET status = 'accepted' WHERE id = ?`,
		"Friendship update error"
	);

	new EndPoints.patchEndpoint(
		"/patch/friendship_block",
		`UPDATE friends SET status = 'blocked' WHERE id = ?`,
		"Friendship update error"
	);
	

	

	new EndPoints.patchEndpoint(
		"/patch/pseudo",
		`UPDATE profiles SET pseudo = ? WHERE user_id = ?`,
		"Data update error"
	);

	new EndPoints.patchEndpoint(
		"/patch/avatar",
		`UPDATE profiles SET avatar = ? WHERE user_id = ?`,
		"Data update error"
	);

	new EndPoints.deleteEndpoint(
		"/delete/user",
		"DELETE FROM users WHERE id = ?",
		"Data removal error"
	);

	new EndPoints.deleteEndpoint(
		"/delete/profile",
		"DELETE FROM profiles WHERE id = ?",
		"Data removal error"
	);

	new EndPoints.deleteEndpoint(
		"/delete/friendships",
		"DELETE FROM friends WHERE user_id = ? or friend_id = ?",
		"Data removal error"
	);

	new EndPoints.deleteEndpoint(
		"/delete/friendship",
		"DELETE FROM friends WHERE id = ?",
		"Data removal error"
	);

	EndPoints.Endpoint.enableAll(server, db);
}

async function start() {

	connect();
	setTables();
	setEndPoints();

	console.log("Enpoints registered:\n" + server.printRoutes());
	
	try {
		server.register(FormBodyPlugin);
		await server.listen({ port: 3000, host: '0.0.0.0' });
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
}

start();
