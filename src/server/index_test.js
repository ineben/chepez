/*const Cloudant = require('@cloudant/cloudant');

const cloudant = Cloudant(
	{
		account: "f7c359be-1f39-4c2f-82a0-3020878141a4-bluemix", 
		password: "2fa3033a07b8795be43cda64bd4576875ab9dd0e5a5be66cb57306bb0c3b5c17"
	}
);

cloudant.db.list(function(err, allDbs){
	const db = cloudant.db.use('guara');
	
	db.search('palabras', 'palabra', {include_docs:true, q:'palabra:joven OR palabra:mesa'}, (er, result) => {
		if (er) {
			throw er;
		}
		console.log(result.rows);
	});
});*/


const {User, Quota} = require("./Entities");

/*User.doInsert({}, {
	password: "09101992",
	email: "gabomartz@gmail.com",
	priv: 1,
})*/

Quota.doSelectOne({}, {
	_id : '307333f5-5c59-4b79-a19f-81b5337186066'
})
.then((reponse) => {
	console.log("then", reponse);
}).catch((err) => {
	console.log("err", err);
});