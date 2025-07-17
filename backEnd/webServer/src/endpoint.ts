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

const pages: Array<string> = ["login", "signin", "profile", "home", "game", "gameFrame", "tournament"];

export class AccessProfileEndpoint {
	add(server: any): void {
		server.get(this.path, async (request: any, reply: any) => {
			// const response = await fetch();
			// if (response.ok)
			// 	data = await response()
			//console.log('File found:', data);

			reply.send(data);
		});
	}
}

export class AccessLoginEndpoint extends Endpoint {
	add(server: any): void {
		server.get(this.path, async (request: any, reply: any) => {
			const filePath = path.join('website/dist/components', `login.html`);
			console.log("The file path:", filePath)
			const data = await fs.readFile(filePath, 'utf-8');
			//console.log('File found:', data);
			reply.header('Content-Disposition', 'filename="login.html"');
			reply.type('text/html; charset=utf-8');
			reply.send(data);
		});
	}
}

export class AccessSigninEndpoint extends Endpoint {
	add(server: any): void {
		server.get(this.path, async (request: any, reply: any) => {
			const filePath = path.join('website/dist/components', `signin.html`);
			console.log("The file path:", filePath)
			const data = await fs.readFile(filePath, 'utf-8');
			//console.log('File found:', data);
			reply.type('text/html; charset=utf-8')
			reply.send(data);
		});
	}
}

// A simple function to parse a cookie header string into an object
function parseCookies(cookieHeader: string | undefined): { [key: string]: string } {
    const cookies: { [key: string]: string } = {};

    if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
            const parts = cookie.match(/(.*?)=(.*)$/)
            if (parts) {
                const key = parts[1].trim();
                const value = (parts[2] || '').trim();
                cookies[key] = value;
            }
        });
    }

    return cookies;
}

function isAuthentified: Boolean (request: any)
{
	const cookies = parseCookies(request.headers.cookie);
	const token: string | undefined = cookies.token;
	let cred = 0
	try
	{
		console.log("The token:");
		console.log(token);
		let response = await fetch(`http://userAuthentication:3000/userauthentication/front/get/profile_session_with_token?token=${token}`, {
			method: 'GET',
		});
		let data = await response.json();
		if (response.ok)
		{
			console.log(data.id)
			cred = 1;
		}
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
	return (cred);
}

export class AccessComponentEndpoint extends Endpoint {
	add(server: any): void {
		server.get(this.path, async (request: any, reply: any) => {
			//console.log(`AccessComponent endpoint: ${this.path} called`);
			const requestedFile = request.params.name;
			console.log("raw cookie:");
			console.log(request.headers.cookie);
			const cookies = parseCookies(request.headers.cookie);
			const token: string | undefined = cookies.token;
			let cred = 0
			try {
				console.log("The token:");
				console.log(token);
				let response = await fetch(`http://userAuthentication:3000/userauthentication/front/get/profile_session_with_token?token=${token}`, {
					method: 'GET',
				});
				let data = await response.json();
				if (response.ok)
				{
					console.log(data.id)
					cred = 1;
				}
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
						reply.type('text/html; charset=utf-8')
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
				if (requestedFile == "login" || requestedFile == "signin")
				{
					const filePath = path.join('website/dist/components', `${requestedFile}.html`);
					console.log("The file path:", filePath)
					try {
						const data = await fs.readFile(filePath, 'utf-8');
						//console.log('File found:', data);
						reply.type('text/html; charset=utf-8')
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
