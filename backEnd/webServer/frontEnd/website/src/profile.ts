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

//console.log(profile);
// const response = await fetch(`https://userManagement:3000/usermanagement/front/get/profile_session`, {
// 	method: 'GET',
// 	credentials: 'include',
// });
// if (!response.ok) {
// 	console.log("something went wrong with profile_session fetch.");
// 	window.location.href = "/login";
// 	return;
// }
// const sessionData = await response.json();

//Friend requests
const requests: string[] = ['Alice', 'Bob', 'Charlie'];

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

requests.forEach(request => {
	addRequest(request);
});


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
