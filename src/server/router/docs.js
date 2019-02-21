'use strict';
const DocSchemas = require("../../logic/schemas/doc");
const transformer = require("../../logic/schemas/_transformer");
const {Doc} = require("../../logic/Entities");
const UserC = require("../../logic/Entities/User");
const Response = require("../../logic/Entities/_Response");
const {queryWordsPromise} = require('../../translate/wordFinder');

module.exports = async function(app, opts){
	
	app.use(require('../middlewares/autoauth'));
	
	app.route({
		method: 'GET',
		url: "/searchWord", 
		schema: {
			headers : {
				type: "object",
				additionalProperties: true,
				required: ["Authorization"],
				properties: {
					Authorization : {type: "string"}
				}
			},
			querystring : {
				type: "object",
				additionalProperties: false,
				properties : {
					lang: {
						type: "string", 
						default: "es"
					},
					word: {
						type: "string"
					}
				}
			},
			response: {
				'2xx': {...transformer.toResponseArray(DocSchemas.EntitySchema)}
			}
		}, 
		handler: async function(req, reply){
			
			if(!req.raw.user || (!UserC.isAdmin(req.raw.user) &&  !UserC.isTranslator(req.raw.user)))
				return new Response(false, req.raw.lang.invalidToken);
			
			const words = await queryWordsPromise(`palabra:${req.query.word}`);
			
			return new Response(true, words);
		}
	});
	
	app.route({
		method: 'GET',
		url: "/searchByRegion/:region", 
		schema: {
			headers : {
				type: "object",
				additionalProperties: true,
				required: ["Authorization"],
				properties: {
					Authorization : {type: "string"}
				}
			},
			querystring : {
				type: "object",
				additionalProperties: false,
				properties : {
					$lang: {
						type: "string", 
						default: "es"
					},
					bookmark : {
						type : "string"
					},
					types : {
						type : "array",
						items : {
							type : "number"
						}
					},
					$limit: {
						type: "integer", 
						default: 20
					}
				}
			},
			params: {
				type: "object",
				additionalProperties: false,
				properties : {
					region: {
						type: "number"
					}
				}
			},
			response: {
				'2xx' : {
					type: "object",
					required : ["success"],
					additionalProperties: false,
					properties: {
						success: {
							type: "boolean", 
							default: true
						}, 
						items: {
							type: "array", 
							items: {
								type: "object",
								properties: {
									id : {
										type: "string"
									},
									fields : {
										type : "object",
										additionalProperties : true,
										properties : {
											type : {
												type : "number"
											},
											base : {
												type : "string"
											}
										}
									}
								}
							}
						},
						mes : {
							type: "string"
						},
						deleteToken : {
							type: "boolean"
						},
						total: {
							type: "integer"
						},
						bookmark : {
							type: "string"
						}
					}
				}
			}
			
		}, 
		handler: async function(req, reply){
			if(!req.raw.user || (!UserC.isAdmin(req.raw.user) &&  !UserC.isTranslator(req.raw.user)))
				return new Response(false, req.raw.lang.invalidToken);
		
			const params = {
				q : `key_${req.params.region}:[0 TO Infinity]`,
				limit: req.query.$limit,
				sort: [`-key_${req.params.region}`]
			};
			
			if(req.query.types){
				params.q = `${params.q} AND type:(${req.query.types.join(' OR ')})`;
			}
			
			if(req.query.bookmark)
				params.bookmark = req.query.bookmark;
			
			return await Doc.searchIndex(req.raw.lang, "palabras", "sinonimsPerRegion", params);
		}
	});
	
	app.route({
		method: 'GET',
		url: "/search", 
		schema: {...DocSchemas.RetrieveSchema}, 
		handler: async function(req, reply){
			if(!req.raw.user || (!UserC.isAdmin(req.raw.user) &&  !UserC.isTranslator(req.raw.user)))
				return new Response(false, req.raw.lang.invalidToken);
		
			return await Doc.doSelectFull(req.raw.lang, req.query, req.query.$order, req.query.$start, req.query.$limit, req.query.$projection);
		}
	});
	
	app.route({
		method: 'GET',
		url: "/id/:id", 
		schema: {...DocSchemas.GetSchema}, 
		handler: async function(req, reply){
			
			if(!req.raw.user || (!UserC.isAdmin(req.raw.user) &&  !UserC.isTranslator(req.raw.user)))
				return new Response(false, req.raw.lang.invalidToken);
			return await Doc.doSelectOne(req.raw.lang, {_id: req.params.id});
		}
	});
	
	app.route({
		method: 'DELETE',
		url: "/id/:id", 
		schema: {...DocSchemas.RemoveSchema}, 
		handler: async function(req, reply){
			
			if(!req.raw.user || !UserC.isAdmin(req.raw.user))
				return new Response(false, req.raw.lang.invalidToken);
			
			const oldBody = await Doc.doSelectOne(req.raw.lang, {_id: req.params.id});
			if(!oldBody.success)
				return oldBody;
			
			return await Doc.doRemove(req.raw.lang, oldBody.item._id, oldBody.item._rev);
		}
	});
	
	app.route({
		method: 'PUT',
		url: "/id/:id", 
		schema: {...DocSchemas.UpdateSchema}, 
		handler: async function(req, reply){
			
			if(!req.raw.user || !UserC.isAdmin(req.raw.user))
				return new Response(false, req.raw.lang.invalidToken);
			
			const oldBody = await Doc.doSelectOne(req.raw.lang, {_id: req.params.id});
			if(!oldBody.success)
				return oldBody;
			
			return await Doc.doUpdate(req.raw.lang, oldBody.item, req.body);
		}
	});
	
	app.route({
		method: 'POST',
		url: "/", 
		schema: {...DocSchemas.InsertSchema}, 
		handler: async function(req, reply){
			
			if(!req.raw.user || !UserC.isAdmin(req.raw.user))
				return new Response(false, req.raw.lang.invalidToken);
			
			return await Doc.doInsert(req.raw.lang, req.body);
		}
	});
	
	app.route({
		method: 'POST',
		url: "/bulk", 
		schema: {...DocSchemas.InsertBulkSchema}, 
		handler: async function(req, reply){
			
			if(!req.raw.user || !UserC.isAdmin(req.raw.user))
				return new Response(false, req.raw.lang.invalidToken);
			
			return await Doc.doInsertBulk(req.raw.lang, req.body);
		}
	});
	
	//sinonimos
	
	app.route({
		method: 'DELETE',
		url: "/word/:word/:id", 
		schema: {...DocSchemas.RemoveSinonimSchema}, 
		handler: async function(req, reply){
			
			if(!req.raw.user || !UserC.isAdmin(req.raw.user))
				return new Response(false, req.raw.lang.invalidToken);
			
			const oldBody = await Doc.doSelectOne(req.raw.lang, {_id: req.params.word});
			if(!oldBody.success)
				return oldBody;
			
			return await Doc.removeSinonim(req.raw.lang, oldBody.item, req.params.id);
		}
	});
	
	app.route({
		method: 'PUT',
		url: "/word/:word/:id", 
		schema: {...DocSchemas.UpdateSinonimSchema}, 
		handler: async function(req, reply){
			
			if(!req.raw.user || (!UserC.isAdmin(req.raw.user) && !UserC.isTranslator(req.raw.user)))
				return new Response(false, req.raw.lang.invalidToken);
			
			const oldBody = await Doc.doSelectOne(req.raw.lang, {_id: req.params.word});
			if(!oldBody.success)
				return oldBody;
			
			return await Doc.updateSinonim(req.raw.lang, oldBody.item, req.params.id, req.body);
		}
	});
	
	app.route({
		method: 'POST',
		url: "/wordBulk/:word", 
		schema: {...DocSchemas.InsertBulkSinonimSchema}, 
		handler: async function(req, reply){
			
			if(!req.raw.user || (!UserC.isAdmin(req.raw.user) &&  !UserC.isTranslator(req.raw.user)))
				return new Response(false, req.raw.lang.invalidToken);
			
			const oldBody = await Doc.doSelectOne(req.raw.lang, {_id: req.params.word});
			if(!oldBody.success)
				return oldBody;
			
			return await Doc.insertBulkSinonim(req.raw.lang, oldBody.item, req.body);
		}
	});
	
	app.route({
		method: 'POST',
		url: "/word/:word", 
		schema: {...DocSchemas.InsertSinonimSchema}, 
		handler: async function(req, reply){
			
			if(!req.raw.user || (!UserC.isAdmin(req.raw.user) &&  !UserC.isTranslator(req.raw.user)))
				return new Response(false, req.raw.lang.invalidToken);
			
			const oldBody = await Doc.doSelectOne(req.raw.lang, {_id: req.params.word});
			if(!oldBody.success)
				return oldBody;
			
			return await Doc.insertSinonim(req.raw.lang, oldBody.item, req.body);
		}
	});
	
};