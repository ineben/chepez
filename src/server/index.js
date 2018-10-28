'use strict';
//const fs = require('fs');
//const config = require('config').get("Costumer");
const fastify = require('fastify');
const path = require('path');

const app = fastify({
	http2: true,
	https: {
		allowHTTP1: true, // fallback support for HTTP1
		key: fs.readFileSync(path.join(__dirname, 'cert', 'ssl.key')),
		cert: fs.readFileSync(path.join(__dirname, 'cert', 'ssl.cert'))
	}
});

//app.register(require('fastify-ws'));
//app.register(require('fastify-sse'));
app.register(require('fastify-favicon'), {path : __dirname});
app.register(require('fastify-cors'), { origin: "*", optionsSuccessStatus: 200 });
app.register(require('fastify-compress'));

app.get("/", async (req, reply) => {
	reply.code(200).send({hi: `Hello from ${process.pid}`});
});


module.exports = () => {
	app.listen(config.get("server.port"), (err, addr) => {
		if(err){
			console.error(err)
		}
		
		console.log(`server listening on ${addr} on proccess ${process.pid}`)
	});
};