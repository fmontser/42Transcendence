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

	//TODO check 42 PC docker-bind-volumes!! (rootless)

	db = new SQLite3.Database(dbPath, (cb) => {
		if (cb)
			console.error("SQLite error: Database file error - ", cb.message);
	});
	console.log("Connected to 'backendDatabase'");
}

function setTables(): void {

	let tables: string[] = [`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT UNIQUE NOT NULL,
			pass TEXT NOT NULL
		)`

		//Add tables here, comma separated.
	];

	tables.forEach(table => {
		db.run(table, (cb) => {
		if (cb)
			console.error("SQLite error: Table creation error - ", cb.message);
		});
	}); 
}

function setEndPoints(): void {
	//Add endpoints here

	//GET Sample
	new EndPoints.getEndpoint(
		"/database/front/get/users",
		"SELECT * FROM users",
		"Failed to get users"
	);

	//POST Sample
	new EndPoints.postEndpoint(
		"/database/front/post/user",
		"INSERT INTO users (name, pass) VALUES (?, ?)",
		"Data insertion error"
	);

	//PUT SAMPLE
	new EndPoints.putEndpoint(
		"/database/front/put/user",
		"UPDATE users SET name = ?, pass = ? WHERE id = ?",
		"Data update error"
	);

	//PATCH SAMPLE
	new EndPoints.patchEndpoint(
		"/database/front/patch/user",
		"UPDATE users SET name = ? WHERE id = ?",
		"Data update error"
	);

	//DELETE SAMPLE
	new EndPoints.deleteEndpoint(
		"/database/front/delete/user",
		"DELETE FROM users WHERE id = ?",
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

	//TODO borrar curl endpoint tests
	/* 
		curl -X GET https://localhost:8443/database/front/get/users --insecure

		curl -X POST https://localhost:8443/database/front/post/user   -H "Content-Type: application/json"   -d '{"name":"Fran","pass":"1234"}' --insecure

		curl -X PUT https://localhost:8443/database/front/put/user   -H "Content-Type: application/json"   -d '{"name":"boom","pass":"5678","id":"1"}' --insecure

		curl -X PATCH https://localhost:8443/database/front/patch/user   -H "Content-Type: application/json"   -d '{,"name":"Lemming","id":"1"}' --insecure
	
		curl -X DELETE https://localhost:8443/database/front/delete/user   -H "Content-Type: application/json"   -d '{"id":"1"}' --insecure
	*/