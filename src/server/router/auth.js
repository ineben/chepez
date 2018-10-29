'use strict';


const UserSchemas = require("../schemas/user");
const {User} = require("../Entities");
const UserC = require("../Entities/User");
const Response = require("../Entities/_Response");

module.exports = async function(app, opts){
	
	app.route({
		method: 'POST',
		url: "/login", 
		schema: {
			querystring : {
				type: "object",
				additionalProperties: false,
				properties : {
					lang: {
						type: "string", 
						default: "es"
					}
				}
			},
			body: {
				type: "object",
				additionalProperties: false,
				required: ["email", "password"],
				properties : {
					email: {
						type: "string"
					},
					password: {
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
						expires : {
							type: "integer"
						},
						token : {
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
			
			const user = await User.selectOne(req.lang, {email: req.body.email.toLowerCase()});
			
			if(!user.success)
				return new Response(false, req.raw.lang.authWrongEmailOrPassword);
			
			if(await UserC.compareHashPass(req.raw.lang, user.item.password, req.body.password)){
				const token = await UserC.getJWT({_id : user.item._id}, 15);
				const response = new Response(true);
				response.token = token;
				response.expires = parseInt((Date.now() / 1000) + 15 * 24 * 60 * 60);
				return response;
			}else
				return new Response(false, req.raw.lang.authWrongEmailOrPassword);
			
		}
	});
	
};