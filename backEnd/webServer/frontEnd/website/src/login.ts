import { router } from './router.js';

console.log("login script loaded");

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
  
			if (response.ok) 
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