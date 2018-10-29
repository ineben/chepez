const Lang = require('../Entities/_Lang');
const URL = require('url');
	
const middleWare = async function(req, res, next){
	const url = URL.parse(req.url, true)
	const lang = (url.query.lang || "es").toLowerCase()
	
	req.lang = await Lang.getLang(lang);
	next();
};

module.exports = middleWare;