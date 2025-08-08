import { PongGame } from './pongGame.js';
import { PongTournament } from './pongTournament.js';
import {createWebSocket, closeWebSocket} from './websocket.js';

console.log('SPA loaded');
history.pushState(null, '', window.location.href);
//customPushState(null, '', window.location.href);

interface Page {
	path: string;
	view: () => Promise<void>;
}

async function methodNotAllowed()
{
	const response: Response = await fetch("/components/405", {
		method: 'GET'
	});
	let data: string = await response.text();
	document.querySelector('#root')!.innerHTML = data;
}

const routes: Page[] = [

	{
		path: "/localgame",
		view: async () => {
			try {
				let response: Response = await fetch("/components/localgame", {
					method: 'GET',
					credentials: 'include'
				});
				if (response.ok)
				{
					let data: string = await response.text();
					//console.log("html:", data);
					const root = document.getElementById('root');
					if (root) {
						root.innerHTML = data;
					} else {
						console.error('Root element not found');
					}
					import(`./localGame.js`)
					.then((module) => {		
						module.showStartScreen();
					});
				}
				else {
					await methodNotAllowed();
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
					//console.log("html:", data);
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
					await methodNotAllowed();
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
					//console.log("html:", data);
					const gameFrame = document.getElementById('gameFrame');
					if (gameFrame) {
						gameFrame.innerHTML = data;
					} else {
						console.error('gameFrame element not found');
					}
				}
				else {
					await methodNotAllowed();
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
					//console.log("html:", data);
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
					await methodNotAllowed();
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
				//console.log("/home request sent.");
				if (response.ok)
				{
					let data: string = await response.text();
					//console.log("html:", data);
					const root = document.getElementById('root');
					if (root) {
						root.innerHTML = data;
					} else {
						console.error('Root element not found');
					}
					import(`./home.js`)
					.then((module) => {		
						module.init();
					});
				}
				else {
					history.pushState(null, '', "/login");
					router();
					return;
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

				const existingScript = document.querySelector("script[src*='/dist/login.js']");
				//console.log(existingScript);
				if (existingScript) {
					//console.log('Found and removed existing script:', existingScript);
					existingScript.remove();
				}

				const newScript = document.createElement('script');
				newScript.src = `./dist/login.js?cb=${Date.now()}`;
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
				if (response.ok)
				{
					let data: string = await response.text();
					const root = document.getElementById('root');
					if (root) {
						root.innerHTML = data;
					import(`./signin.js`)
						.then((module) => {		
							module.init();
						});
					}
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
		path: "/profile",
		view: async () => {
			try {
				let response: Response = await fetch("/components/profile", {
					method: 'GET',
					credentials: 'include'
				});
				if (response.ok)
				{
					let data: string = await response.text();
					const root = document.getElementById('root');
					if (root) {
						root.innerHTML = data;
						import(`./profile.js`)
						.then((module) => {		
							module.loadProfile();
						});

					} else {
						console.error('Root element not found');
					}
				}
				else
				{
					await methodNotAllowed();
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
		path: "/friend_profile",
		view: async () => {
			try {
				let response: Response = await fetch("/components/friend_profile", {
					method: 'GET',
					credentials: 'include'
				});
				if (response.ok)
				{
					let data: string = await response.text();
					const root = document.getElementById('root');
					if (root) {
						root.innerHTML = data;
					import(`./friend_profile.js`)
						.then((module) => {		
							module.init();
						});
					}
				}
				else
				{
					await methodNotAllowed();
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
				closeWebSocket();

				//window.location.href="/login";
				//console.log("go login");
				history.pushState(null, '', "/login");
				//console.log("before router");
				router();
				//console.log("After router");
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
		console.log("match: ", match);
		await match.view();
		console.log("finished");
	}
	else {
		const response: Response = await fetch("/components/404", {
			method: 'GET'
		});
		let data: string = await response.text();
		document.querySelector('#root')!.innerHTML = data;
	}
}

document.addEventListener('DOMContentLoaded', () => {
document.addEventListener('click', e => {
	//console.log(">>>>>>>>>>>>> click listener called");
	const target = e.target as HTMLElement;
	if (target.matches('.nav-link')) {
		//console.log(">>>>>>>>>>>>> nav-link found");
		e.preventDefault();
		const href = target.getAttribute('data-path')!;

		history.pushState(null, '', href);
		console.log("href: ", href);
		//customPushState(null, '', href);
		
		router();
	}
});
});

window.addEventListener('popstate', router);

document.addEventListener('DOMContentLoaded', router);

export function customPushState(state: any, title: string, url: string) {
	history.pushState(state, title, url);
	
	// Save custom history stack to sessionStorage
	let stack = JSON.parse(sessionStorage.getItem('myHistoryStack') || '[]');
	stack.push({ state, title, url });
	sessionStorage.setItem('myHistoryStack', JSON.stringify(stack));
	console.log("custom push state called");
}

// window.addEventListener('load', () => {
// 	// const stack = JSON.parse(sessionStorage.getItem('myHistoryStack') || '[]');
// 	// console.log("page has been reloaded");
// 	// // Optionally replay the history to simulate back/forward
// 	// if (stack.length > 0) {

// 	// // for (let item of stack) {
// 	// //   history.pushState(item.state, item.title || '', item.url);
// 	// //   console.log("previous routes: ", item.url, item.state, item.title);
// 	// // }
// 	// //history.replaceState(null, '', window.location.href);
// 	// const first = stack[0];
// 	// console.log("stack length: ", stack.length);
// 	// //history.replaceState(first.state, first.title || '', first.url);
// 	// for (let i = 0; i < stack.length - 1; i++) {
// 	// 	const item = stack[i];
// 	// 	console.log("state: ", item.state, item.title, item.url);
// 	// 	history.pushState(item.state, item.title || '', item.url);
// 	//   }
// 	//   history.replaceState(first.state, first.title || '', first.url);
// 	//   //history.pushState(stack[0].state, stack[0].title || '', stack[0].url);
// 	// }
// 	router();
//   });