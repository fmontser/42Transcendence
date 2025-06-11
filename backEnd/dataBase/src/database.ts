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
		
		// TODO borrar user test table
		`
		CREATE TABLE IF NOT EXISTS users (
			userUID INTEGER PRIMARY KEY AUTOINCREMENT,
			userName TEXT UNIQUE NOT NULL,
			pass TEXT NOT NULL
		)`,

		// Matches table
		`
		CREATE TABLE IF NOT EXISTS matches (
			matchUID INTEGER PRIMARY KEY AUTOINCREMENT,
			player0UID INTEGER,
			player0Score INTEGER,
			player1UID INTEGER,
			player1Score INTEGER,
			winnerUID INTEGER
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
		"/get/username",
		"SELECT userName FROM users WHERE userUID = ?",
		"Failed to get user name"
	);

	new EndPoints.postEndpoint(
		"/post/match",
		"INSERT INTO matches (player0UID, player0Score, player1UID, player1Score, winnerUID) VALUES (?, 0, ?, 0, -1)",
		"Data insertion error"
	);

	EndPoints.Endpoint.enableAll(server, db);
}

async function start() {

	connect();
	setTables();
	setEndPoints();

	//TODO borrar fake data
	const fakeData: string = "INSERT INTO users (userName, pass) VALUES (?, ?)"
	db.run(fakeData, {userName: "Pingu", pass: "1234"}, (err: any) => {});
	db.run(fakeData, {userName: "Pongu", pass: "4321"}, (err: any) => {});
	
	try {
		server.register(FormBodyPlugin);
		await server.listen({ port: 3000, host: '0.0.0.0' });
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
}

start();

	//TODO borrar curl endpoint tests
	/* 
		curl -X GET https://localhost:8443/database/front/get/users --insecure

		curl -X POST https://localhost:8443/database/front/post/user   -H "Content-Type: application/json"   -d '{"name":"Fran","pass":"1234"}' --insecure

		curl -X PUT https://localhost:8443/database/front/put/user   -H "Content-Type: application/json"   -d '{"name":"boom","pass":"5678","id":"1"}' --insecure

		curl -X PATCH https://localhost:8443/database/front/patch/user   -H "Content-Type: application/json"   -d '{,"name":"Lemming","id":"1"}' --insecure
	
		curl -X DELETE https://localhost:8443/database/front/delete/user   -H "Content-Type: application/json"   -d '{"id":"1"}' --insecure
	*/