interface UserProfile {
	username: string;
	bio: string;
	creationDate: string;
	experience: string;
	friends: string[];
	requests: string[];
	blockedUsers: string[]
  }

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