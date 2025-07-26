import { request } from "http";

interface UserProfile {
	username: string;
	bio: string;
	creationDate: string;
	experience: string;
	friends: string[];
	requests: string[];
	blockedUsers: string[]
}

async function getProfile(): Promise<Response>
{

	const response = await fetch(`https://${window.location.hostname}:8443/usermanagement/front/get/profile_session`, {
		method: 'GET',
		credentials: 'include',
	});
	if (!response.ok)
	{
		console.log("Erroooor!");
	}
	let session = await response.json();
	const id = session.name;
	console.log("Profile:", session);

	const profileResponse = await fetch(`https://${window.location.hostname}:8443/usermanagement/front/get/profile?id=${id}`, {
		method: 'GET',
		credentials: 'include'
	});

	return(profileResponse);
}

//let profile: any = getProfile();
getProfile().then(async profileResponse => {
	if (profileResponse.ok) {
		const profile = (await profileResponse.json())[0];
		console.log(profile.bio);
	console.log("hola", profile.pseudo);
	}
});


async function loadProfile() {
	const sessionResponse = await fetch(`https://${window.location.hostname}:8443/usermanagement/front/get/profile_session`, {
	  method: 'GET',
	  credentials: 'include'
	});

	if (!sessionResponse.ok) {
	  window.location.href = 'login.html';
	  return;
	}

	const sessionData = await sessionResponse.json();
	let id = sessionData.name;

	const profileResponse = await fetch(`https://${window.location.hostname}:8443/usermanagement/front/get/profile?id=${id}`, {
	  method: 'GET',
	  credentials: 'include'
	});

	if (profileResponse.ok) {
	  const profile = (await profileResponse.json())[0];
	  (document.getElementById('pseudo')!).textContent = profile.pseudo || 'Inconnu';
	  (document.getElementById('pseudoInput')! as HTMLTextAreaElement).value = profile.pseudo || '';
	  (document.getElementById('bio')!).textContent = profile.bio || 'Inconnu';
	  (document.getElementById('bioInput')! as HTMLTextAreaElement).value = profile.bio || '';
	  (document.getElementById('creationDate')!).textContent = profile.date_creation || 'Inconnue';
	  (document.getElementById('experience')!).textContent = profile.experience || '0';
	} else {
	  console.error('Erreur lors du chargement du profil');
	}
  }

loadProfile();

(document.getElementById('editBioBtn')!).addEventListener('click', () => {
	(document.getElementById('bio')!).style.display = 'none';
	(document.getElementById('bioInput')!).style.display = 'inline';
	(document.getElementById('editBioBtn')!).style.display = 'none';
	(document.getElementById('saveBioBtn')!).style.display = 'inline';
});

(document.getElementById('saveBioBtn')!).addEventListener('click', async () => {
	const newBio: string = (document.getElementById('bioInput')! as HTMLTextAreaElement).value;

	const response = await fetch(`https://${window.location.hostname}:8443/usermanagement/front/put/modify_bio`, {
	  method: 'PATCH',
	  credentials: 'include',
	  headers: { 'Content-Type': 'application/json' },
	  body: JSON.stringify({ bio: newBio })
});

if (response.ok) {
	(document.getElementById('bio')!).textContent = newBio;
	(document.getElementById('message')!).textContent = 'Bio mise à jour.';
  } else {
	(document.getElementById('message')!).textContent = 'Erreur lors de la mise à jour de la bio.';
  }

  (document.getElementById('bio')!).style.display = 'inline';
  (document.getElementById('bioInput')!).style.display = 'none';
  (document.getElementById('editBioBtn')!).style.display = 'inline';
  (document.getElementById('saveBioBtn')!).style.display = 'none';
});

//pseudo
(document.getElementById('editPseudoBtn')!).addEventListener('click', () => {
	(document.getElementById('pseudo')!).style.display = 'none';
	(document.getElementById('pseudoInput')!).style.display = 'inline';
	(document.getElementById('editPseudoBtn')!).style.display = 'none';
	(document.getElementById('savePseudoBtn')!).style.display = 'inline';
  });

(document.getElementById('savePseudoBtn')!).addEventListener('click', async () => {
	const newPseudo = (document.getElementById('pseudoInput')! as HTMLTextAreaElement).value;

	const response = await fetch(`https://${window.location.hostname}:8443/usermanagement/front/put/modify_pseudo`, {
	  method: 'PATCH',
	  credentials: 'include',
	  headers: { 'Content-Type': 'application/json' },
	  body: JSON.stringify({ pseudo: newPseudo })
	});

	if (response.ok) {
	  (document.getElementById('pseudo')!).textContent = newPseudo;
	  (document.getElementById('message')!).textContent = 'Pseudo mis à jour.';
	} else {
	  (document.getElementById('message')!).textContent = 'Erreur lors de la mise à jour du pseudo.';
	}

	(document.getElementById('pseudo')!).style.display = 'inline';
	(document.getElementById('pseudoInput')!).style.display = 'none';
	(document.getElementById('editPseudoBtn')!).style.display = 'inline';
	(document.getElementById('savePseudoBtn')!).style.display = 'none';
  });


//Friend requests

async function fetchPendingFriends() {

	  const response = await fetch(`https://${window.location.hostname}:8443/usermanagement/front/get/friendships_pending`, {
		method: 'GET',
		credentials: 'include'
	  });

	  if (!response.ok) {
		console.log("no se");
	  }
	  const requests: any = await response.json();
	  console.log(requests);
	  requests.forEach((request: any) => {
		addRequest(request.pseudo);
	});

}

fetchPendingFriends();
//const requests: string[] = ['Alice', 'Bob', 'Charlie'];

const requestListContainer = document.getElementById('friend-requests-list') as HTMLDivElement | null;
const templateRequest = document.getElementById('friend-request-template') as HTMLTemplateElement | null;

function addRequest(name: string) {
	if (templateRequest)
	{
		const Clone = templateRequest.content.cloneNode(true) as DocumentFragment;

		const span = Clone.querySelector('span');

		// Check if the span element inside the template exists
		if (span) {
			span.textContent = name;
		}

		if (requestListContainer) {
			requestListContainer.appendChild(Clone);
		}
	}
}


//Friends
const friends: string[] = [];

const friendListContainer = document.getElementById('friend-list-accepted') as HTMLDivElement | null;
const template = document.getElementById('friend-template') as HTMLTemplateElement | null;

function addFriendToList(name: string) {
	if (template)
	{
		const friendClone = template.content.cloneNode(true) as DocumentFragment;

		const span = friendClone.querySelector('span');

		// Check if the span element inside the template exists
		if (span) {
			span.textContent = name;
		}

		if (friendListContainer) {
			friendListContainer.appendChild(friendClone);
		}
	}
}

friends.forEach(friend => {
	addFriendToList(friend);
});


//Blocked Users
const blockedUsers: string[] = ['Mathis'];

const blockedListContainer = document.getElementById('friend-list-blocked') as HTMLDivElement | null;
const templateBlocked = document.getElementById('blocked-user-template') as HTMLTemplateElement | null;

function addBlockToList(name: string) {
	if (templateBlocked)
	{
		const Clone = templateBlocked.content.cloneNode(true) as DocumentFragment;

		const span = Clone.querySelector('span');

		// Check if the span element inside the template exists
		if (span) {
			span.textContent = name;
		}

		if (blockedListContainer) {
			blockedListContainer.appendChild(Clone);
		}
	}
}

blockedUsers.forEach(user => {
	addBlockToList(user);
});
