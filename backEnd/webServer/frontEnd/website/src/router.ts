import { OnlineGame } from './gameScripts/onlineGame.js'
import { LocalGame } from './gameScripts/localGame.js'
//import { HotSeatGame } from './gameScripts/hotSeatGame.js';


interface Page {
	path: string;
	view: () => Promise<void>;
}

const routes: Page[] = [

	{
		path: "/localGame",
		view: async () => {
			try {
				let response: Response = await fetch("src/pongGame.html", {
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
						let newGame = new LocalGame("Fran-temp", "Dario-temp");
						newGame.start()
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
		path: "/onlineGame-1",
		view: async () => {
			try {
				let response: Response = await fetch("src/pongGame.html", {
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
						let newGame = new OnlineGame(1);
						newGame.start()
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
		path: "/onlineGame-2",
		view: async () => {
			try {
				let response: Response = await fetch("src/pongGame.html", {
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
						let newGame = new OnlineGame(2);
						newGame.start()
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

/* 	{
		path: "/hotSeat",
		view: async () => {
			try {
				let response: Response = await fetch("src/pongGame.html");
				if (response.ok)
				{
					let data: string = await response.text();

					console.log("html 1:", data);
					const root = document.getElementById('root');
					if (root) {
						root.innerHTML = data;
						console.log("html 2 :", data);
						let newGame = new HotSeatGame([1,2,3,4]);
						newGame.start()
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
	}, */

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
				newScript.src = '/dist/login.js';
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
		path: "/logout",
		view: async () => {
			try {
				let response: Response = await fetch(`https://${window.location.hostname}:8443/userauthentication/front/post/logout`, {
					method: 'POST',
					credentials: 'include'
				  });
				console.log(">>>>>>>>>>>>>>>>>>>");
				console.log(response);
				response = await fetch("/components/login", {
					method: 'GET',
					credentials: 'include'
				});
				let data: string = await response.text();
				const root = document.getElementById('root');
				// let cookies = document.cookie.split(';');
				// for (const c of cookies)
				// {
				// 	const [key, value] = c.trim().split('=');
				// 	console.log("key-value: ", key, value);
				// }
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
