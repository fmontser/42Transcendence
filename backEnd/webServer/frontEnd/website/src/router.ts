import { PongGame } from './pongGame.js';
import { PongTournament } from './pongTournament.js';

console.log('SPA loaded');
history.pushState(null, '', window.location.href);

interface Page {
	path: string;
	view: () => Promise<void>;
}

const routes: Page[] = [

	{
		path: "/game",
		view: async () => {
			try {
				let response: Response = await fetch("/components/game", {
					method: 'GET',
					credentials: 'include'
				});
				if (response.ok)
				{
					let data: string = await response.text();
					console.log("html:", data);
					const root = document.getElementById('root');
					if (root) {
						root.innerHTML = data;
						let newGame = new PongGame();
						newGame.start()
					} else {
						console.error('Root element not found');
					}
				}
				else {
					console.log("Fetch failed.");
				}
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
		path: "/gameFrame",
		view: async () => {
			try {
				let response: Response = await fetch("/components/game", {
					method: 'GET',
					credentials: 'include'
				});
				if (response.ok)
				{
					let data: string = await response.text();
					console.log("html:", data);
					const gameFrame = document.getElementById('gameFrame');
					if (gameFrame) {
						gameFrame.innerHTML = data;
					} else {
						console.error('gameFrame element not found');
					}
				}
				else {
					console.log("Fetch failed.");
				}
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
		path: "/tournament",
		view: async () => {
			try {
				let response: Response = await fetch("/components/tournament", {
					method: 'GET',
					credentials: 'include'
				});
				if (response.ok)
				{
					let data: string = await response.text();
					console.log("html:", data);
					const root = document.getElementById('root');
					if (root) {
						root.innerHTML = data;
						let newTournament = new PongTournament();
						newTournament.start()
					} else {
						console.error('Root element not found');
					}
				}
				else {
					console.log("Fetch failed.");
				}
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
				let response: Response = await fetch("/components/home", {
					method: 'GET',
					credentials: 'include'
				});
				console.log("/home request sent.");
				if (response.ok)
				{
					let data: string = await response.text();
					console.log("html:", data);
					const root = document.getElementById('root');
					if (root) {
						root.innerHTML = data;
					} else {
						console.error('Root element not found');
					}
				}
				else {
					window.location.href="/login";
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
				let response: Response = await fetch("/access/login", {
					method: 'GET',
					credentials: 'include'
				});
				let data: string = await response.text();
				const root = document.getElementById('root');
				if (root) {
					root.innerHTML = data;
				const newScript = document.createElement('script');
				newScript.src = './dist/login.js';
				newScript.type = 'module';
				newScript.async = true;
				document.body.appendChild(newScript);
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
				let response: Response = await fetch("/access/signin", {
					method: 'GET',
					credentials: 'include'
				});
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
		path: "/profile",
		view: async () => {
			try {
				let response: Response = await fetch("/components/profile", {
					method: 'GET',
					credentials: 'include'
				});
				let data: string = await response.text();
				const root = document.getElementById('root');
				let cookies = document.cookie.split(';');
				for (const c of cookies)
				{
					const [key, value] = c.trim().split('=');
					console.log("key-value: ", key, value);
				}
				if (root) {
					root.innerHTML = data;
					const newScript = document.createElement('script');
					newScript.src = './dist/profile.js';
					newScript.async = true;
					document.body.appendChild(newScript);
				} else {
					console.error('Root element not found');
				}
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
		path: "/logout",
		view: async () => {
			try
			{
				let response: Response = await fetch(`https://${window.location.hostname}:8443/userauthentication/front/post/logout`, {
					method: 'POST',
					credentials: 'include'
				});
				window.location.href="/login";
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

export const router = async () => {
	const path = location.pathname;
	const match = routes.find(route => route.path == path);
	if (match)
	{
		console.log("match");
		await match.view();
		console.log("finished");
	}
	else {

		document.querySelector('#root')!.innerHTML = '<h1>404 - Page Not Found (dynamic)</h1>';
	}
}

document.addEventListener('DOMContentLoaded', () => {
document.addEventListener('click', e => {
	console.log(">>>>>>>>>>>>> click listener called");
	const target = e.target as HTMLElement;
	if (target.matches('.nav-link')) {
		console.log(">>>>>>>>>>>>> nav-link found");
		e.preventDefault();
		const href = target.getAttribute('data-path')!;

		history.pushState(null, '', href);

		router();
	}
});
});

document.addEventListener('DOMContentLoaded', () => {
document.addEventListener('submit', e => {
	const target = e.target as HTMLElement;
	if (target.matches('.nav-link')) {
		e.preventDefault();
		const href = target.getAttribute('href')!;

		history.pushState(null, '', href);

		router();
	}
});
});

window.addEventListener('popstate', router);

document.addEventListener('DOMContentLoaded', router);
