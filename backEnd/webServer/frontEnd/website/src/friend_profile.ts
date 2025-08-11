// import { getFriendIDProfile } from './profile.js'
import {createWebSocket} from './websocket.js';

export async function init(friendId: string | null = null): Promise<void> {
	if (friendId) {
		const params = new URLSearchParams(window.location.search);
		params.set('friendId', friendId);
		window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
	}
	else {
		return;//TODO send to 404
	}

	const id = friendId;
	const sessionResponse = await fetch(`https://${window.location.hostname}:8443/usermanagement/front/get/friend_profile?id=${id}`, {
		method: 'GET',
		credentials: 'include'
	});

	if (!sessionResponse.ok) {
		console.error("Failed to retrieve friend profile");
		return;//TODO send to 404
	}

	const profile = (await sessionResponse.json())[0];

	(document.getElementById('pseudo')!).textContent = profile.pseudo || 'Inconnu';
	(document.getElementById('bio')!).textContent = profile.bio || 'Inconnu';
	(document.getElementById('creationDate')!).textContent = profile.date_creation || 'Inconnue';
	(document.getElementById('experience')!).textContent = profile.experience || '0';
	(document.getElementById('avatar-box')! as HTMLImageElement).src = profile.avatar;
	const matchsResponse = await fetch(`https://${window.location.hostname}:8443/usermanagement/front/get/friend_matchlist?id=${id}`, {
		method: 'GET',
		credentials: 'include'
	});

	if (matchsResponse.ok) {
		const matchsContainer = document.getElementById('matchs-list') as HTMLDivElement | null;
		const matchsData = await matchsResponse.json();
	  
		if (matchsData && matchsData.length > 0 && matchsContainer) {
			matchsContainer.innerHTML = ''; // Clear previous matches
		
			const matchTemplate = document.getElementById('match-template') as HTMLTemplateElement;

			matchsData.forEach((match: any) => {
				const isWin = match.winner_pseudo === match.user_pseudo;

				const clone = matchTemplate.content.cloneNode(true) as HTMLElement;

				const matchElement = clone.querySelector('div')!;
				matchElement.classList.add(isWin ? 'bg-green-700' : 'bg-red-700');

				clone.querySelector('.enemy-pseudo')!.textContent = match.enemy_pseudo;
				clone.querySelector('.score-text')!.textContent = `${match.user_score} : ${match.enemy_score}`;

				const badge = clone.querySelector('.result-badge')!;
				badge.textContent = isWin ? 'WIN' : 'LOOSE';
				if (isWin) {
					badge.classList.add('bg-green-500', 'text-green-900');
				} else {
					badge.classList.add('bg-red-500', 'text-red-900');
				}
				  
				matchsContainer!.prepend(clone);
			});

		  
		} else {
		  if (matchsContainer)
			matchsContainer.innerHTML = `<p class="text-gray-400 text-center">No matches found.</p>`;
		}
	  }

}

