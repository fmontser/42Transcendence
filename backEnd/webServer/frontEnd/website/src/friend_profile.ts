import { getFriendIDProfile } from './profile.js'

export async function init()
{
	const id: string = getFriendIDProfile();

	if (!id) {
		console.error("No friend ID found");
		return;
	}


	

	const sessionResponse = await fetch(`https://${window.location.hostname}:8443/usermanagement/front/get/friend_profile?id=${id}`, {
		method: 'GET',
		credentials: 'include'
	});

	if (!sessionResponse.ok) {
		console.error("Failed to retrieve friend profile");
		return;
	}

	const profile = (await sessionResponse.json())[0];

	(document.getElementById('pseudo')!).textContent = profile.pseudo || 'Inconnu';
	(document.getElementById('bio')!).textContent = profile.bio || 'Inconnu';
	(document.getElementById('creationDate')!).textContent = profile.date_creation || 'Inconnue';
	(document.getElementById('experience')!).textContent = profile.experience || '0';
	(document.getElementById('avatar-box')! as HTMLImageElement).src = profile.avatar;
	

}

