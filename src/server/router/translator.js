'use strict';

const {Quota} = require("../../logic/Entities");
const Response = require("../../logic/Entities/_Response");
const translate = require("../../translate");

module.exports = async function(app, opts){
	
	app.route({
		method: 'GET',
		url: "/:token", 
		schema: {
			querystring : {
				type: "object",
				additionalProperties: false,
				required: ["phrase"],
				properties : {
					phrase: {
						type: "string"
					},
					toRegion: {
						type: "integer",
						default: 1
					},
					toGrade: {
						type: "integer",
						default: 0
					},
					inclusive: {
						type: "boolean",
						default: false
					}
				}
			},
			params : {
				type: "object",
				additionalProperties: false,
				required: ["token"],
				properties : {
					token: {
						type: "string", 
						pattern: "^[0-9a-zA-Z-]{1,}$"
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
						phrase : {
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
			
			const token = await Quota.doSelectOne(req.raw.lang, req.params.token);
			
			if(!token.success)
				return new Response(false, req.raw.lang.tokenNotFound);
			
			if(token.item.restante == 0)
				return new Response(false, req.raw.lang.translatorNoCredits);
			
			if(token.item.validUntil < Date.now())
				return new Response(false, req.raw.lang.translatorExpired);
			
			try{
				const output = await translate(req.query.phrase, req.query.toRegion, req.query.toGrade, null, req.query.inclusive);
				
				const update = await Quota.updateOne(req.raw.lang, token.item, {lastUsed: Date.now(), restante: token.item.restante-1});
				const r = new Response(true);
				
				r.phrase = output;
				return r;
			}catch(e){
				console.log(e);
				return new Response(false, req.raw.lang.translatorError);
			}
			
		}
	});
	
};