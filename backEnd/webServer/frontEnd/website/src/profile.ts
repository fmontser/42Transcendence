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
	console.log("profile is being loaded.");
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

(document.getElementById('showPseudosBtn')!).addEventListener('click', async () => {
const list = document.getElementById('pseudoList');
(list!).innerHTML = ''; // Réinitialise la liste

const response = await fetch('/usermanagement/front/get/pseudos', {
  method: 'GET',
  credentials: 'include'
});

if (!response.ok) {
  (list!).innerHTML = '<li>Erreur lors de la récupération des pseudos.</li>';
  return;
}

const pseudos = await response.json(); // attend [{ pseudo: 'alice' }, { pseudo: 'bob' }]

if (Array.isArray(pseudos) && pseudos.length > 0) {
  pseudos.forEach(({ pseudo }) => {
	const li = document.createElement('li');
	li.style.marginBottom = '10px';
	li.style.display = 'flex';
	li.style.justifyContent = 'space-between';
	li.style.alignItems = 'center';
	li.style.gap = '10px';

	const span = document.createElement('span');
	span.textContent = pseudo || 'Inconnu';
	const button = document.createElement('button');
	button.textContent = 'Add';
	button.addEventListener('click', async () => {
	  const res = await fetch(`https://${window.location.hostname}:8443/usermanagement/front/post/friendship`, {
		method: 'POST',
		credentials: 'include',
		headers: {
		  'Content-Type': 'application/json'
		},
		body: JSON.stringify({ targetPseudo: pseudo })
	  });

	  const message = document.getElementById('message');
	  if (res.ok) {
		(message!).textContent = `Requête d'amitié envoyée à ${pseudo}`;
		(message!).style.color = 'green';
	  } else {
		(message!).textContent = `Erreur lors de l'ajout de ${pseudo}`;
		(message!).style.color = 'red';
	  }
	});

	li.appendChild(span);
	li.appendChild(button);
	(list!).appendChild(li);
  });
} else {
	(list!).innerHTML = '<li>Aucun pseudo trouvé.</li>';
}

});

//Friend requests

fetchList('friend-list-blocked', 'blocked-user-template', '/usermanagement/front/get/friendships_blocked');

fetchList('friend-list-accepted', 'friend-template', '/usermanagement/front/get/friendships_accepted');

fetchList('friend-requests-list', 'friend-request-template','/usermanagement/front/get/friendships_pending');

async function fetchList(containerElement: string, templateElement: string, url: string) {
	try {
	  const response = await fetch(`https://${window.location.hostname}:8443${url}`, {
		method: 'GET',
		credentials: 'include'
	  });

	  if (!response.ok) {
		console.log("Error");
	  }
	  console.log("fetch succesful");

	  const data = await response.json(); // ex: [{ pseudo: 'eqwq', id: 2 }]
	  console.log(data)
	  data.forEach((friend: any) => {
		console.log(friend.pseudo);
		addElement(friend, containerElement, templateElement);

	});
	} catch (error) {
		console.error('Error:', error);
	}
}

function addElement(friend: any, containerElement: string, templateElement: string) {
	const requestListContainer = document.getElementById(containerElement) as HTMLDivElement | null;
	const templateRequest = document.getElementById(templateElement) as HTMLTemplateElement | null;

	if (templateRequest)
	{
		const Clone = templateRequest.content.cloneNode(true) as DocumentFragment;
		const divToUse = Clone.querySelector('#entry');
		if (divToUse)
		{
			divToUse.id = `friend-${friend.id}`;
		}

		console.log("divToUse: ", divToUse);

		const span = Clone.querySelector('span');
		console.log("span selection log: ", span);

		//friends
		if (span) {
			span.textContent = friend.pseudo;
		}
		if (containerElement == 'friend-list-accepted')
		{
			const button = Clone.querySelector('button');
			(button!).onclick = () => {
				if (divToUse)
				{
					//Clone.id = `friend-${friend.id}`;
					deleteFriendship(friend.id);
				}
			  };
		}
		//requests
		if (containerElement == 'friend-requests-list')
		{
			const button = Clone.querySelector('#accept-button') as HTMLButtonElement;
			(button!).onclick = () => {
				if (divToUse)
				{
					acceptFriendship(friend.id);
				}
			};
			
		}
		//blocked
		// if (containerElement == 'friend-list-blocked')
		// {
		// 	const button = Clone.querySelector('#accept-button');
		// 	button.onclick = acceptFriendship(friend.id);
		// }

		// Check if the span element inside the template exists
		console.log("clone append log");
		if (requestListContainer) {
			requestListContainer.appendChild(Clone);
		}
	}
}

const deleteFriendship = async (ID: number) => {
	console.log("Friendship removed");
	try {
	  const postResponse = await fetch(`https://${window.location.hostname}:8443/usermanagement/front/delete/delete_friendship`, {
		method: 'DELETE',
		credentials: 'include',
		headers: {
		  'Content-Type': 'application/json'
		},
		body: JSON.stringify({ id: ID })
	  });
	  if (!postResponse.ok) {
		throw new Error('Erreur lors du delete');
	  }

	  const element = document.getElementById(`friend-${ID}`) as HTMLDivElement;
	  (element).remove()
	
	} catch (error: any) {
	  alert('yo Erreur : ' + error.message);
	}
  };

const acceptFriendship = async (ID: number) => {
	console.log("Friendship accepted");
	try {
		console.log("the id:", ID);
		const postResponse = await fetch(`https://${window.location.hostname}:8443/usermanagement/front/patch/accept_friendship`, {
		method: 'PATCH',
		credentials: 'include',
		headers: {
		  'Content-Type': 'application/json'
		},
		body: JSON.stringify({ id: ID })
	});
	if (!postResponse.ok) {
		throw new Error('Erreur lors de l\'acceptation');
	}
	const element = document.getElementById(`friend-${ID}`) as HTMLDivElement;
	(element).remove();
	

	} catch (error: any) {
	  alert('yo Erreur : ' + error.message);
	}
  };

// requests.forEach(request => {
// 	addRequest(request);
// });


//Friends
// const friends: string[] = [];

// const friendListContainer = document.getElementById('friend-list-accepted') as HTMLDivElement | null;
// const template = document.getElementById('friend-template') as HTMLTemplateElement | null;

// function addFriendToList(name: string) {
// 	if (template)
// 	{
// 		const friendClone = template.content.cloneNode(true) as DocumentFragment;

// 		const span = friendClone.querySelector('span');

// 		// Check if the span element inside the template exists
// 		if (span) {
// 			span.textContent = name;
// 		}

// 		if (friendListContainer) {
// 			friendListContainer.appendChild(friendClone);
// 		}
// 	}
// }

// friends.forEach(friend => {
// 	addFriendToList(friend);
// });


//Blocked Users
// const blockedUsers: string[] = ['Mathis'];

// const blockedListContainer = document.getElementById('friend-list-blocked') as HTMLDivElement | null;
// const templateBlocked = document.getElementById('blocked-user-template') as HTMLTemplateElement | null;

// function addBlockToList(name: string) {
// 	if (templateBlocked)
// 	{
// 		const Clone = templateBlocked.content.cloneNode(true) as DocumentFragment;

// 		const span = Clone.querySelector('span');

// 		// Check if the span element inside the template exists
// 		if (span) {
// 			span.textContent = name;
// 		}

// 		if (blockedListContainer) {
// 			blockedListContainer.appendChild(Clone);
// 		}
// 	}
// }

// blockedUsers.forEach(user => {
// 	addBlockToList(user);
// });

// Modify AVATAR
const sendAvatarBtn = document.getElementById('sendAvatarBtn');
if (sendAvatarBtn) {
	sendAvatarBtn.addEventListener('click', async () => {
		const input = document.getElementById('inputAvatar') as HTMLInputElement;
		if (!input.files || input.files.length === 0) {
			alert('Please select an image to upload.');
			return;
		}

		const formData = new FormData();
		formData.append('image', input.files[0]);

		try {
			const reply = await fetch(`https://${window.location.hostname}:8443/usermanagement/front/patch/modify_avatar`, {
				method: 'PATCH',
				credentials: 'include',
				body: formData,
			});

			//TODO dario, manejar la respuesta de archivo invalido en el frontend (manejar el codigo 422, mostrar mensaje ....)
			if (reply.status == 422)
			{
				//TODO archivo invalido  imagenes de 100x100 jpg max 30000 bytes (30kb)
				console.log("Invalid file format. 100x100 jpg max 30kb")
			}

		} catch (error) {
			console.error('Error uploading avatar:', error);
		}
	});
}

const deleteAvatarBtn = document.getElementById('deleteAvatarBtn');
if (deleteAvatarBtn) {
	deleteAvatarBtn.addEventListener('click', async () => {

		try {
			const reply = await fetch(`https://${window.location.hostname}:8443/usermanagement/front/delete/delete_avatar`, {
				method: 'DELETE',
				credentials: 'include',
			});

		} catch (error) {
			console.error('Error deleting avatar:', error);
		}
	});
}
<<<<<<< HEAD
=======



async function deleteAccount() {
	if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
	  const response = await fetch(`https://${window.location.hostname}:8443/usermanagement/front/delete/user`, {
		method: 'DELETE',
		credentials: 'include'
	  });

	  if (response.ok) {
		alert('Votre compte a été supprimé avec succès.');
		window.location.href = '/login';
	  } else {
		alert('Erreur lors de la suppression du compte.');
	  }
	}
  }

  export {};
>>>>>>> 37b195c (profile changed.)
