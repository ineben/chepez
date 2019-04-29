'use strict';
const { join } = require('path');
const DIST_FOLDER = join(__dirname, '..', 'panel', 'dist');
const { existsSync, createReadStream, readFileSync, readdirSync, access } = require('fs');
const fastify = require('fastify');
const path = require('path');

const app = fastify({});

app.register(require('fastify-favicon'), {path : __dirname});
app.register(require('fastify-cors'), { origin: /^https?:\/\/localhost:3000/, optionsSuccessStatus: 200 });

app.use(require('./middlewares/locale'));

app.register(require('./router/auth'), {prefix: '/api/auth'});
app.register(require('./router/docs'), {prefix: '/api/docs'});
app.register(require('./router/reps'), {prefix: '/api/reps'});
app.register(require('./router/quotas'), {prefix: '/api/quotas'});
app.register(require('./router/translator'), {prefix: '/api/translator'});
app.register(require('./router/users'), {prefix: '/api/users'});
app.register(require('./router/watson'), {prefix: '/api/watson'});

app.register(require('fastify-static'), {root: join(DIST_FOLDER), prefix: '/static/'});

app.get('/*', (req, reply) => {
	if(req.params['*'].length > 2)
		access(join(DIST_FOLDER, req.params['*']), (err) => {
			if(err){ 
				reply.sendFile('index.html');
			}
			else{
				reply.sendFile(req.params['*']);
			}
		});
	else
		reply.sendFile('index.html');
});

module.exports = {
	start(){
		app.listen(80, '0.0.0.0', (err, addr) => {
			if(err){
				console.error(err)
			}
			
			console.log(`Server listening on ${addr} on proccess ${process.pid}`)
		});
	}
};