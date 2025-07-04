import Fastify from 'fastify';

const server = Fastify({
	logger: true 
});

async function start() {
//TODO @@@@@@ mirar https://www.youtube.com/watch?v=1WUoITRINf0
	let test = 1;

	test++;
	console.log(test);

	try {
		await server.listen({ port: 3000, host: '0.0.0.0' });
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
}

start();
