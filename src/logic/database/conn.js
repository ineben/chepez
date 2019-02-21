'use strict';
const Cloudant = require('@cloudant/cloudant');
const cloudant = Cloudant(
	{
		account: "f7c359be-1f39-4c2f-82a0-3020878141a4-bluemix", 
		password: "2fa3033a07b8795be43cda64bd4576875ab9dd0e5a5be66cb57306bb0c3b5c17"
	}
);
const db = cloudant.db.use('guara');


module.exports = function(){
	return db;
};