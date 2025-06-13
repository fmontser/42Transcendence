export abstract class Endpoint {

	protected static list: Set<Endpoint> = new Set();
	protected path: string;
	protected sql: string;
	protected errorMsg: string;

	constructor(path: string, sql: string, errorMsg: string	) {
		this.path = path;
		this.sql = sql;
		this.errorMsg = errorMsg;
		Endpoint.list.add(this);
	}
	
	protected abstract add(server: any, db: any): void;

	public static enableAll(server: any, db: any): void {
		for (const endpoint of Endpoint.list)
			endpoint.add(server, db);
	}

	protected async pull(server: any, db: any, reply: any, params: any[] = []) {
		try {
			const rows = await new Promise<any[]>((resolve, reject) => {
			db.all(this.sql, params, (err: any, rows: any) => {
				if (err)
				reject(err);
				else
				resolve(rows);
			});
			});
			reply.send(rows);
		} catch (error) {
			server.log.error(`DataBase: ${this.errorMsg} - `, error);
			reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
		}
		}


	protected async push(server: any, db: any, request: any, reply: any) {
		try {
			if (!request.body || typeof request.body !== 'object')
				throw new Error("Endpoint request is malformed!");

			db.run(this.sql, Object.values(request.body), (cb: any) => {
				if (cb)
					console.error(`SQLite error: ${this.errorMsg} - `, cb.message);
			});
		} catch (error) {
			server.log.error(`DataBase: ${this.errorMsg} - :`, error);
			reply.status(500).send({ error: `Internal server error: ${this.errorMsg}` });
		}
	}
}

export class getEndpoint extends Endpoint {
	add(server: any, db: any): void {
		server.get(this.path, async (request: any, reply: any) => {
			return await this.pull(server, db, reply);
		});
	}
}

export class getWithParamsEndpoint extends Endpoint {
	add(server: any, db: any): void {
		server.get(this.path, async (request: any, reply: any) => {
			if (!request.query || Object.keys(request.query).length === 0) {
				reply.status(400).send({ error: 'Query parameters are required' });
				return;
			}
			const params = Object.values(request.query);
			return await this.pull(server, db, reply, params);
		});
	}
}

export class postEndpoint extends Endpoint {
	add(server: any, db: any): void {
		server.post(this.path, async (request: any, reply: any) => {
			this.push(server, db, request, reply);
		});
	}
}

export class putEndpoint extends Endpoint {
	add(server: any, db: any): void {
		server.put(this.path, async (request: any, reply: any) => {
			this.push(server, db, request, reply);
		});
	}
}

export class patchEndpoint extends Endpoint {
	add(server: any, db: any): void {
		server.patch(this.path, async (request: any, reply: any) => {
			console.log({request});
			this.push(server, db, request, reply);
		});
	}
}

export class deleteEndpoint extends Endpoint {
	add(server: any, db: any): void {
		server.delete(this.path, async (request: any, reply: any) => {
			this.push(server, db, request, reply);
		});
	}
}