import { router } from './router.js';

console.log("login script loaded");

let tempTokenFor2FA: string | null = null;

const loginForm: HTMLFormElement = document.getElementById('login-form') as HTMLFormElement;
if (loginForm)
{
	loginForm.addEventListener('submit', async (event: SubmitEvent) => {
		const target = event.target as HTMLElement;
		const href = target.getAttribute('data-path')!;
		console.log("target", target, "ref", href)

		event.preventDefault();
		const formData = new FormData(loginForm);
		const formProps = Object.fromEntries(formData) as { name: string, pass: string };
		console.log("Username:", formProps.name);
		console.log("Passwowrd:", formProps.pass);
		try 
		{
			const response = await fetch("/userauthentication/front/post/login", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body:	JSON.stringify(formProps),
			});

			const data = await response.json();

			if (response.ok && data.twofaRequired){
				tempTokenFor2FA = data.token;
				(document.getElementById('loginForm')!).style.display = 'none';
				(document.getElementById('twoFASection')!).style.display = 'block';
			}
			else if (response.ok) 
			{
				console.log("response ok");
				if (target.matches('.spa-form')) {
					console.log(">>>>>>>>>>>>> nav-link found");
					history.pushState(null, '', href);
					router();
				}
			} 
		  	else 
			{
				console.error('Login failed:', response.status, response.statusText);
			}
		}
		catch (error)
		{
		  console.error('An error occurred during the login request:', error);
		}
	});
	}
else
{
	console.error('The form with ID "login-form" was not found.'); // Add for debugging
}

const verify2FABtn = document.getElementById('verify2FABtn');

if (verify2FABtn){
	verify2FABtn.addEventListener('click', async function () {
		const code = (document.getElementById('twoFACode')! as HTMLInputElement).value.trim();

		if (!code || code.length !== 6) {
			(document.getElementById('twoFAError')! as HTMLParagraphElement).textContent = "Enter a 6 digit code.";
			return;
		}

		const response = await fetch(`https://${window.location.hostname}:8443/userauthentication/front/post/2fa/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({
				tempToken: tempTokenFor2FA,
				google_token: code
			})
		});

		const data = await response.json();

		if (response.ok && data.success) {
			console.log("response ok");
		} else {
			(document.getElementById('twoFAError')! as HTMLParagraphElement).textContent = data.error || "Wrong code, please try again.";
		}
	});
}