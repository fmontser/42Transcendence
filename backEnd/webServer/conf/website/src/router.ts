import OnlineGame from './gameScripts/onlineGame'

interface Page {
	path: string;
	view: () => Promise<void>;
}

const routes: Page[] = [
		{
		path: "/multiplayer1",
		view: async () => {
			try {
				let response: Response = await fetch("src/multiplayer.html");
				if (response.ok)
				{
					let data: string = await response.text();
					//TODO FIX!
					console.log("html 1:", data);
					const root = document.getElementById('root');
					if (root) {
						root.innerHTML = data;
						console.log("html 2 :", data);
						//const multiplayerModule = await import('src/gameScripts/onlineGame.ts');
						const gameInstance = new OnlineGame(1);
						gameInstance.start();
					} else {
						console.error('Root element not found');
					}
					//import()
					// 
					//creo objeto(id en el constructor);
				}
				else {
					console.log("Fetch failed.");
				}
				//import("");
			}
			catch (error: unknown)
			{
				if (error instanceof Error)
				{
					console.error("Error:", error.message);
				}
				else
				{
					console.error("Unknown error.");
				}
			}
		}
	},

	{
		path: "/multiplayer2",
		view: async () => {
			try {
				let response: Response = await fetch("src/multiplayer.html");
				if (response.ok)
				{
					let data: string = await response.text();
					console.log("html 1:", data);
					const root = document.getElementById('root');
					if (root) {
						root.innerHTML = data;
						//TODO FIX!
						console.log("html 2 :", data);
						//const multiplayerModule = await import('src/gameScripts/onlineGame.ts');
						const gameInstance = new OnlineGame(2);
						gameInstance.start();
					} else {
						console.error('Root element not found');
					}
					// 
					//creo objeto(id en el constructor);
				}
				else {
					console.log("Fetch failed.");
				}
				//import("");
			}
			catch (error: unknown)
			{
				if (error instanceof Error)
				{
					console.error("Error:", error.message);
				}
				else
				{
					console.error("Unknown error.");
				}
			}
		}
	},

	{
		path: "/",
		view: async () => {
			try {
				let response: Response = await fetch("src/home.html");
				if (response.ok)
				{
					let data: string = await response.text();
					console.log("html 1:", data);
					const root = document.getElementById('root');
					if (root) {
						root.innerHTML = data;
						console.log("html 2 :", data);
					} else {
						console.error('Root element not found');
					}
				}
				else {
					console.log("Fetch failed.");
				}
				//import("");
			}
			catch (error: unknown)
			{
				if (error instanceof Error)
				{
					console.error("Error:", error.message);
				}
				else
				{
					console.error("Unknown error.");
				}
			}
		}
	},
	{
		path: "/login",
		view: async () => {
			try {
				let response: Response = await fetch("src/logIn.html");
				let data: string = await response.text();
				const root = document.getElementById('root');
				if (root) {
					root.innerHTML = data;
				} else {
					console.error('Root element not found');
				}
				//import("");
			}
			catch (error: unknown)
			{
				if (error instanceof Error)
				{
					console.error("Error:", error.message);
				}
				else
				{
					console.error("Unknown error.");
				}
			}
		}
	},
	{
		path: "/signin",
		view: async () => {
			try {
				let response: Response = await fetch("src/signIn.html");
				let data: string = await response.text();
				const root = document.getElementById('root');
				if (root) {
					root.innerHTML = data;
				} else {
					console.error('Root element not found');
				}
				//import("");
			}
			catch (error: unknown)
			{
				if (error instanceof Error)
				{
					console.error("Error:", error.message);
				}
				else
				{
					console.error("Unknown error.");
				}
			}
		}
	}
]


const router = async () => {
	const path = location.pathname;
	const match = routes.find(route => route.path == path);
	if (match)
	{
		console.log("match");
		await match.view();
		console.log("finished");
	}
	else {

		document.querySelector('#root')!.innerHTML = '<h1>404 - Page Not Found</h1>';
	}
}

document.addEventListener('click', e => {
	const target = e.target as HTMLElement;
	if (target.matches('.nav-link')) {
		e.preventDefault();
		const href = target.getAttribute('href')!;

		history.pushState(null, '', href);

		router();
	}
});

window.addEventListener('popstate', router);

document.addEventListener('DOMContentLoaded', router);
