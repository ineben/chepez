'use strict';

const QuotaSchemas = require("../../logic/schemas/quota");
const {Quota} = require("../../logic/Entities");
const UserC = require("../../logic/Entities/User");
const Response = require("../../logic/Entities/_Response");

module.exports = async function(app, opts){
	
	app.use(require('../middlewares/autoauth'));
	
	app.route({
		method: 'GET',
		url: "/search", 
		schema: {...QuotaSchemas.RetrieveSchema}, 
		handler: async function(req, reply){
			if(!req.raw.user || !UserC.isAdmin(req.raw.user))
				return new Response(false, req.raw.lang.invalidToken);
		
			return await Quota.doSelectFull(req.raw.lang, req.query.query, req.query.order, req.query.skip, req.query.limit, req.query.projection);
		}
	});
	
	app.route({
		method: 'GET',
		url: "/id/:id", 
		schema: {...QuotaSchemas.GetSchema}, 
		handler: async function(req, reply){
			
			if(!req.raw.user || !UserC.isAdmin(req.raw.user))
				return new Response(false, req.raw.lang.invalidToken);
			
			return await Quota.doSelectOneFull(req.raw.lang, req.params.id);
		}
	});
	
	app.route({
		method: 'DELETE',
		url: "/id/:id", 
		schema: {...QuotaSchemas.RemoveSchema}, 
		handler: async function(req, reply){
			
			if(!req.raw.user || !UserC.isAdmin(req.raw.user))
				return new Response(false, req.raw.lang.invalidToken);
			
			const oldBody = await Quota.doSelectOne(req.raw.lang, req.params.id);
			if(!oldBody.success)
				return oldBody;
			
			return await Quota.doRemove(req.raw.lang, oldBody.item._id, oldBody.item._rev);
		}
	});
	
	app.route({
		method: 'PUT',
		url: "/id/:id", 
		schema: {...QuotaSchemas.UpdateSchema}, 
		handler: async function(req, reply){
			
			if(!req.raw.user || !UserC.isAdmin(req.raw.user))
				return new Response(false, req.raw.lang.invalidToken);
			
			const oldBody = await Quota.doSelectOne(req.raw.lang, req.params.id);
			if(!oldBody.success)
				return oldBody;
			
			return await Quota.doUpdate(req.raw.lang, oldBody.item, req.body);
		}
	});
	
	app.route({
		method: 'POST',
		url: "/", 
		schema: {...QuotaSchemas.InsertSchema}, 
		handler: async function(req, reply){
			
			if(!req.raw.user || !UserC.isAdmin(req.raw.user))
				return new Response(false, req.raw.lang.invalidToken);
			
			return await Quota.doInsert(req.raw.lang, req.body);
		}
	});
	
};