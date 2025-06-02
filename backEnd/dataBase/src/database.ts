import Fastify from 'fastify';
import formBodyPlugin from '@fastify/formbody';
import * as SQLite3 from 'sqlite3'; 

let db: SQLite3.Database;
const debugMode: boolean = false;
const server = Fastify({
	logger: true 
});

function connect(): void {
	let dbPath: string;

	if (debugMode)
		dbPath = "../../volumes/dataBase-volume/backendDatabase.db";
	else
		dbPath = "./data/backendDatabase.db";

	//TODO comprobar la creacion en volumen docker en los PC de 42!!!

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
	];

	tables.forEach(table => {
		db.run(table, (cb) => {
		if (cb)
			console.error("SQLite error: Table creation error - ", cb.message);
		});
	}); 
}

function setEndPoints(): void {

	server.get("/database/front/get/users", async (request, reply) => {
		const sql = "SELECT * FROM users";
		try {
			const rows = await new Promise<any[]>((resolve, reject) => {
				db.all(sql, [], (cb, rows) => {
					if (cb)
						reject(cb);
					else
						resolve(rows);
				});
			});
			reply.send(rows);
		} catch (error) {
			server.log.error("DataBase: Failed to get users - ", error);
			reply.status(500).send({ error: "Internal server error: Failed to get users" });
		}
	});

	server.post("/database/front/post/user", async (request, reply) => {
		const sql = "INSERT INTO users (name, pass) VALUES (?, ?)";

		interface rbody {
			name: string;
			pass: string;
		};

		if (!request.body || typeof request.body !== 'object') {
			server.log.error("DataBase: Endpoint request is malformed!");
			return reply.status(400).send({ error: "Endpoint request is malformed!" });
		}
		const requestBody = request.body as rbody;

		try {
			db.run(sql, [requestBody.name, requestBody.pass], (cb) => {
			if (cb)
				console.error("SQLite error: Data insertion error - ", cb.message);
			});
		} catch (error) {
			server.log.error("DataBase: Failed to register user - :", error);
			reply.status(500).send({ error: "Internal server error: Failed to register user" });
		}
	});
}

async function start() {

	connect();
	setTables();
	setEndPoints();
	
	try {
		server.register(formBodyPlugin);
		await server.listen({ port: 3000, host: '0.0.0.0' });
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
}

start();
