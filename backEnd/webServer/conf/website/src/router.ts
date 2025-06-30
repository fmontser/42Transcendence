// interface Route {
// 	path: string;
// 	view: () => Promise<void>;
// }

// const routes: Routes[] = [
// 	{
// 		path: '/', //home path
// 		view: async() => {
// 			console.log("Home page...");
// 			const [html, script] = await Promise.all([
// 				fetch('../src/pages/home.html').then(res => res.text()),
// 			]);

// 			document.querySelector('#root')!.innerHTML = html;
// 			import()
// 			//script.init();
// 		},
// 	},

// 	{
// 		path: '/login', //login path
// 		view: async() => {
// 			console.log("Log in...");
// 			const [html, script] = await Promise.all([
// 				fetch('../src/pages/logIn.html').then(res => res.text());
// 			]);
// 		},
// 	},
// ]

// const router = async () => {
// 	const path = location.pathname;
// 	const match = routes.find(routes => router.path === path);

// 	if (match) {
// 		await match.view();
// 	}
// 	else {
// 		document.querySelector('#root')!.innerHTML = '<h1>404 - Page Not Found</h1>';
// 	}
// };

// document.addEventListener('click', e => {
// 	const target = e.target as HTMLElement;
// 	if (target.matches('.nav-link')) {
// 		e.preventDefault();
// 		const href = target.getAttribute('href')!;

// 		history.pushState(null, '', href);

// 		router();
// 	}
// });

// window.addEventListener('popstate', router);

// document.addEventListener('DOMContentLoaded', router);


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
					console.log("html 1:", data);
					const root = document.getElementById('root');
					if (root) {
						root.innerHTML = data;
						console.log("html 2 :", data);
						const multiplayerModule = await import('src/gameScripts/onlineGame.ts');
						const gameInstance = new multiplayerModule.gameInstance(1);
						multiplayerModule.start();
					} else {
						console.error('Root element not found');
					}
					import()
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
						console.log("html 2 :", data);
						const multiplayerModule = await import('src/gameScripts/onlineGame.ts');
						const gameInstance = new multiplayerModule.gameInstance(2);
						multiplayerModule.start();
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
