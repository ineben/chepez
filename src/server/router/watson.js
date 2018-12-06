'use strict';

const Response = require("../../logic/Entities/_Response");
const watson = require("../../watson");

module.exports = async function(app, opts){
	
	app.route({
		method: 'POST',
		url: "/", 
		schema: {
			body : {
				type: "object",
				additionalProperties: false,
				required: ["text"],
				properties : {
					text: {
						type: "string"
					},
					session: {
						type: "string"
					}
				}
			},
			response: {
				'2xx' : {
					type: "object",
					additionalProperties: false,
					required : ["success"],
					properties: {
						success: { 
							type: "boolean"
						}, 
						item : {
							type: "string"
						}, 
						session : {
							type: "string"
						},
						mes : {
							type: "string"
						}
					}
				}
			}
		}, 
		handler: async function(req, reply){
			
			let session;
			
			if(req.body.session)
				session = req.body.session;
			else{
				const session_id = await watson.createSession();
				
				if(!session_id.success)
					return new Response(false, req.raw.lang.watsonSessionIdError);
			
				session = session_id.item;
			}
			
			const output = await watson.message(
				req.body.text, 
				session
			);
			
			const r = new Response(true, output.item);
			r.session = session;
			return r;
			
		}
	});
	
};