import { getFriendIDProfile } from './profile.js'

export function init()
{
	const id: string = getFriendIDProfile();
	(document.getElementById("test")! as HTMLElement).textContent = id;

	console.log("Friend id:", id);
}

