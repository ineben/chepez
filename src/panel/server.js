const { join } = require('path');
const DIST_FOLDER = join(__dirname, 'dist');
const { createReadStream, readFileSync } = require('fs');


const fastify = require('fastify');
const app = fastify();


app.register(require('fastify-compress'), {threshold: 2048});

app.register(require('fastify-http-proxy'), {
	upstream: 'http://localhost:8082',
	prefix: '/api'
});
app.register(require('fastify-static'), {root: DIST_FOLDER, prefix: '/*'});

module.exports = {
	start(){
		app.listen(8081, '0.0.0.0', (err, addr) => {
			if(err){
				console.error(err)
			}
			
			console.log(`Panel listening on ${addr} on proccess ${process.pid}`)
		});
	}
};