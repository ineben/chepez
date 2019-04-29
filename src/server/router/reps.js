'use strict';
const RepSchemas = require("../../logic/schemas/rep");
const transformer = require("../../logic/schemas/_transformer");
const {Rep} = require("../../logic/Entities");
const UserC = require("../../logic/Entities/User");
const Response = require("../../logic/Entities/_Response");
const {queryWordsPromise} = require('../../guara/translate/wordFinder');

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
					$lang: {
						type: "string", 
						default: "es"
					},
					bookmark : {
						type : "string"
					},
					types : {
						type : "number"
					},
					$limit: {
						type: "integer", 
						default: 20
					}
				}
			},
			response: {
				'2xx': {...transformer.toResponseArray(RepSchemas.EntitySchema)}
			}
		}, 
		handler: async function(req, reply){
			if(!req.raw.user || (!UserC.isAdmin(req.raw.user) &&  !UserC.isTranslator(req.raw.user)))
				return new Response(false, req.raw.lang.invalidToken);
		
			const params = {
				q : `*:*`,
				limit: req.query.$limit,
				include_docs: true
			};
			
			if(req.query.word){
				params.q = `word:${req.query.word}*`;
			}
			
			if(req.query.bookmark)
				params.bookmark = req.query.bookmark;
			
			const r = await Rep.searchIndex(req.raw.lang, "replace", "palabra", params);
			const items = [];
			for(const row of r.items){
				items.push(row.doc);
			}
			r.items = items;
			
			
			
			return r;
		}
	});
	
	app.route({
		method: 'GET',
		url: "/search", 
		schema: {...RepSchemas.RetrieveSchema}, 
		handler: async function(req, reply){
			if(!req.raw.user || (!UserC.isAdmin(req.raw.user) &&  !UserC.isTranslator(req.raw.user)))
				return new Response(false, req.raw.lang.invalidToken);
		
			return await Rep.doSelectFull(req.raw.lang, req.query, req.query.$order, req.query.$start, req.query.$limit, req.query.$projection);
		}
	});
	
	app.route({
		method: 'GET',
		url: "/id/:id", 
		schema: {...RepSchemas.GetSchema}, 
		handler: async function(req, reply){
			
			if(!req.raw.user || (!UserC.isAdmin(req.raw.user) &&  !UserC.isTranslator(req.raw.user)))
				return new Response(false, req.raw.lang.invalidToken);
			return await Rep.doSelectOne(req.raw.lang, {_id: req.params.id});
		}
	});
	
	app.route({
		method: 'DELETE',
		url: "/id/:id", 
		schema: {...RepSchemas.RemoveSchema}, 
		handler: async function(req, reply){
			
			if(!req.raw.user || !UserC.isAdmin(req.raw.user))
				return new Response(false, req.raw.lang.invalidToken);
			
			const oldBody = await Rep.doSelectOne(req.raw.lang, {_id: req.params.id});
			if(!oldBody.success)
				return oldBody;
			
			return await Rep.doRemove(req.raw.lang, oldBody.item._id, oldBody.item._rev);
		}
	});
	
	app.route({
		method: 'PUT',
		url: "/id/:id", 
		schema: {...RepSchemas.UpdateSchema}, 
		handler: async function(req, reply){
			
			if(!req.raw.user || !UserC.isAdmin(req.raw.user))
				return new Response(false, req.raw.lang.invalidToken);
			
			const oldBody = await Rep.doSelectOne(req.raw.lang, {_id: req.params.id});
			if(!oldBody.success)
				return oldBody;
			
			return await Rep.doUpdate(req.raw.lang, oldBody.item, req.body);
		}
	});
	
	app.route({
		method: 'POST',
		url: "/", 
		schema: {...RepSchemas.InsertSchema}, 
		handler: async function(req, reply){
			
			if(!req.raw.user || !UserC.isAdmin(req.raw.user))
				return new Response(false, req.raw.lang.invalidToken);
			
			return await Rep.doInsert(req.raw.lang, req.body);
		}
	});
	
	app.route({
		method: 'POST',
		url: "/bulk", 
		schema: {...RepSchemas.InsertBulkSchema}, 
		handler: async function(req, reply){
			
			if(!req.raw.user || !UserC.isAdmin(req.raw.user))
				return new Response(false, req.raw.lang.invalidToken);
			
			return await Rep.doInsertBulk(req.raw.lang, req.body);
		}
	});

};