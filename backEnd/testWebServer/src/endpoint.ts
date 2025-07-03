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

//example
export class LogOutEndpoint extends Endpoint {
	add(server: any): void {
		server.post(this.path, async (request: any, reply: any) => {
			console.log(`LogOutEndpoint: ${this.path} called`);

			// Efface le cookie en le remplaçant par un vide et maxAge 0
			reply
				.clearCookie('token', {
					httpOnly: true,
					secure: true, // à garder pour production
					sameSite: 'lax',
					path: '/',
					maxAge: 0 // Efface le cookie immédiatement
				})
				.send({ success: true, message: 'Logged out successfully' });
		});
	}
}