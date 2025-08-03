import { router } from './router.js';

const signinForm: HTMLFormElement = document.getElementById('signin-form') as HTMLFormElement;
if (signinForm)
{
	console.log("script called");
	signinForm.addEventListener('submit', async (event: SubmitEvent) => {
		const target = event.target as HTMLElement;
		const href = target.getAttribute('data-path')!;
		console.log("target", target, "ref", href)

		event.preventDefault();
		const formData = new FormData(signinForm);
		const formProps = Object.fromEntries(formData) as { name: string, pass: string };
		console.log("Username:", formProps.name);
		console.log("Passwowrd:", formProps.pass);
		try 
		{
			const response = await fetch("/userauthentication/front/post/create", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body:	JSON.stringify(formProps),
			});
			
			if (response.ok) 
			{
				const loginResponse = await fetch("/userauthentication/front/post/login", {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body:	JSON.stringify(formProps),
				});
	  
				if (loginResponse.ok) 
				{
					console.log("loginResponse ok");
					if (target.matches('.spa-form')) {
						console.log(">>>>>>>>>>>>> nav-link found");
						history.pushState(null, '', href);
						router();
					}
				}
			} 
		  	else 
			{
				console.error('Signin failed:', response.status, response.statusText);
			}
		}
		catch (error)
		{
		  console.error('An error occurred during the sigin request:', error);
		}
	});
	}
else
{
	console.error('The form with ID "login-form" was not found.'); // Add for debugging
}