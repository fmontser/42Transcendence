import path from 'node:path';
//import { fileURLToPath } from 'url';
import { promises as fs } from 'node:fs';

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

export abstract class Endpoint {

	protected static list: Set<Endpoint> = new Set();
	protected path: string;
	protected errorMsg: string;

	constructor(path: string, errorMsg: string	) {
		this.path = path;
		this.errorMsg = errorMsg;
		Endpoint.list.add(this);
	}
	protected abstract add(server: any): void;

	public static enableAll(server: any): void {
		for (const endpoint of Endpoint.list)
			endpoint.add(server);
	}
}

const pages: Array<string> = ["login", "signin", "profile", "home", "localGame", "onlineGame-1", "onlineGame-2"];


export class AccessComponentEndpoint extends Endpoint {
	add(server: any): void {
		server.get(this.path, async (request: any, reply: any) => {
			//console.log(`AccessComponent endpoint: ${this.path} called`);
			const requestedFile = request.params.name;
			console.log(request.cookies)
			let cred = 0
			try {
				let hola = await fetch("http://userManagement:3000/get/profile_session", {
					method: 'GET',
					credentials: 'include'
				});
				if (hola.ok)
					cred = 1;
			} catch (error: unknown){
				if (error instanceof Error)
					{
						console.error("Error:", error.message);
					}
					else
						console.log("there's an error.");
			}
			if (cred) //Has credentials fet
			{
				console.log('User has credentials.');
				console.log('File:', requestedFile);
				if (pages.includes(requestedFile))
				{
					const filePath = path.join('website/dist/components', `${requestedFile}.html`);
					console.log("The file path:", filePath)
					try {
						const data = await fs.readFile(filePath, 'utf-8');
						//console.log('File found:', data);
						reply.send(data);
					}
					catch (error: unknown)
					{
						if (error instanceof Error)
						{
							console.error("Error:", error.message);
						}
						else
							console.log("there's an error.");
					}
					//const response = await fetch('../website/dist/components/'.concat(requestedFile).concat('.html'), {
					//	method: 'GET'});
					//const data = await response.json();
				}
				else
				{
					console.log('File not found.');
					reply.status(404).send({ error: `404 Not Found` });
					return;
				}
			}
			else //Doesn't have credentials
			{
				console.log('User doesnt have credentials.');
				console.log('File:', requestedFile);
				if (pages.includes(requestedFile))
				{
					const filePath = path.join('website/dist/components', `${requestedFile}.html`);
					console.log("The file path:", filePath)
					try {
						const data = await fs.readFile(filePath, 'utf-8');
						//console.log('File found:', data);
						reply.send(data);
					}
					catch (error: unknown)
					{
						if (error instanceof Error)
						{
							console.error("Error:", error.message);
						}
						else
							console.log("there's an error.");
					}
					//const response = await fetch('../website/dist/components/'.concat(requestedFile).concat('.html'), {
					//	method: 'GET'});
					//const data = await response.json();
				}
				else
				{
					console.log('File not found.');
					reply.status(404).send({ error: `404 Not Found` });
					return;
				}
			}

		});
	}
}
