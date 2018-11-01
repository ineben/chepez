const {User} = require('../../logic/Entities'),
	Response = require('../../logic/Entities/_Response');

const autoauth = async function(req, res, next){
	let jwtoken;
	
	if(req.headers.authorization)
		jwtoken = req.headers.authorization;
	
	req.user = false;
	if(jwtoken){
		try{
			const user = await User.checkHash(jwtoken);
			if(user.success){
				req.user = user.item;
			}else{
				const r = new Response(false);
				r.deleteToken = true;
				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify(r));
				return;
			}
		}catch(e){
			const r = new Response(false);
			r.deleteToken = true;
			res.setHeader("Content-Type", "application/json");
			res.end(JSON.stringify(r));
			return;
		}
	}
	
	next();
};

module.exports = autoauth;