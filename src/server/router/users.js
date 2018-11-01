'use strict';

const UserSchemas = require("../../logic/schemas/user");
const {User} = require("../../logic/Entities");
const UserC = require("../../logic/Entities/User");
const Response = require("../../logic/Entities/_Response");

module.exports = async function(app, opts){
	
	app.use(require('../middlewares/autoauth'));
	
	app.route({
		method: 'GET',
		url: "/search", 
		schema: {...UserSchemas.RetrieveSchema}, 
		handler: async function(req, reply){
			if(!req.raw.user || !UserC.isAdmin(req.raw.user))
				return new Response(false, req.raw.lang.invalidToken);
		
			return await User.doSelectFull(req.raw.lang, req.query.query, req.query.order, req.query.skip, req.query.limit, req.query.projection);
		}
	});
	
	app.route({
		method: 'GET',
		url: "/id/:id", 
		schema: {...UserSchemas.GetSchema}, 
		handler: async function(req, reply){
			
			if(!req.raw.user || !UserC.isAdmin(req.raw.user))
				return new Response(false, req.raw.lang.invalidToken);
			
			return await User.doSelectOneFull(req.raw.lang, req.params.id);
		}
	});
	
	app.route({
		method: 'DELETE',
		url: "/id/:id", 
		schema: {...UserSchemas.RemoveSchema}, 
		handler: async function(req, reply){
			
			if(!req.raw.user || !UserC.isAdmin(req.raw.user))
				return new Response(false, req.raw.lang.invalidToken);
			
			const oldBody = await User.doSelectOne(req.raw.lang, req.params.id);
			if(!oldBody.success)
				return oldBody;
			
			return await User.doRemove(req.raw.lang, oldBody.item._id, oldBody.item._rev);
		}
	});
	
	app.route({
		method: 'PUT',
		url: "/id/:id", 
		schema: {...UserSchemas.UpdateSchema}, 
		handler: async function(req, reply){
			
			if(!req.raw.user || !UserC.isAdmin(req.raw.user))
				return new Response(false, req.raw.lang.invalidToken);
			
			const oldBody = await User.doSelectOne(req.raw.lang, req.params.id);
			if(!oldBody.success)
				return oldBody;
			
			return await User.doUpdate(req.raw.lang, oldBody.item, req.body);
		}
	});
	
	app.route({
		method: 'GET',
		url: "/", 
		schema: {...UserSchemas.GetSchema}, 
		handler: async function(req, reply){
			
			if(!req.raw.user)
				return new Response(false, req.raw.lang.invalidToken);
			
			return await User.doSelectOneFull(req.raw.lang, req.raw.user._id);
		}
	});
	
	app.route({
		method: 'PUT',
		url: "/", 
		schema: {...UserSchemas.UpdateSelfSchema}, 
		handler: async function(req, reply){
			
			if(!req.raw.user)
				return new Response(false, req.raw.lang.invalidToken);
			
			return await User.doUpdate(req.raw.lang, req.raw.user, req.body);
		}
	});
	
	app.route({
		method: 'POST',
		url: "/", 
		schema: {...UserSchemas.InsertSchema}, 
		handler: async function(req, reply){
			
			if(!req.raw.user || !UserC.isAdmin(req.raw.user))
				return new Response(false, req.raw.lang.invalidToken);
			
			return await User.doInsert(req.raw.lang, req.body);
		}
	});
	
};