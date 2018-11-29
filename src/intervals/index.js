const Cloudant = require('@cloudant/cloudant');
const {Quota} = require("../logic/Entities")

const cloudant = Cloudant(
	{
		account: "f7c359be-1f39-4c2f-82a0-3020878141a4-bluemix", 
		password: "2fa3033a07b8795be43cda64bd4576875ab9dd0e5a5be66cb57306bb0c3b5c17"
	}
);

const db = cloudant.db.use('guara');

const reseterCallback = function(err, dbResponse){
	console.log(dbResponse);
	if(err){
		console.log(err);
		return;
	}
	
	const promises = [];
	for(const item of dbResponse.rows){
		promises.push(Quota.updateOne({}, item.doc, {
			lastReset: Date.now(), 
			validUntil: Date.now() + item.doc.reset * 24 * 60 * 60 * 1000,
			restante: item.doc.total
		}));
	}
	
	Promise.all(promises)
	.then((result) => {
		
	})
	.catch((e) => {console.log(e);});
	
};

const reseter = function(){
	db.search('quotaExpirations', 'expirations', {
		include_docs:true, 
		q: "expired:false"
	}, reseterCallback);
};

reseter();


setInterval(reseter, 5 * 60 * 1000);