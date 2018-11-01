const Base = require('./_Base')
	Response = require('./_Response'),
	bcrypt = require('bcrypt');
	jwt = require('jsonwebtoken'),
	SECRET = "UALA401278000",
	Hashids = require("hashids"),
    hashids = new Hashids(SECRET),
	SALT_WORK_FACTOR = 10,
	uuid = require('uuid/v4');

let	Schema = require("../schemas/user");
Schema = {...Schema};

class User extends Base{
	
	constructor(){
		super("users", Schema.EntitySchema);
	}
	
	static getSalt(lang){
		return new Promise((resolve, reject) => {
			bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
				if(err) {
					console.log(err);
					return reject(new Response(false, lang.userEncryptPass));
				}
				return resolve(salt); 
			});	
		});
	}
	
	static hashPass(lang, salt, pass){
		return new Promise((resolve, reject) => {
			bcrypt.hash(pass, salt, (err, hash) => {
				if(err) {
					console.log(err);
					return reject(new Response(false, lang.userEncryptPass));
				}
				return resolve(hash);
			});
		});
	}
	
	static compareHashPass(lang, hash, pass){
		return new Promise((resolve, reject) => {
			bcrypt.compare(pass, hash, (err, isMatch) => {
				if(err) {
					setTimeout(() => {
						resolve(new Response(false, lang.userComparePassHash));
					}, Math.floor(Math.random() * (3001 - 500)) + 500);
				}else
					resolve(isMatch);
			});
		});
	}
	
	static getJWT(data, days = 1){
		return new Promise( (resolve, reject) => {		
			jwt.sign(data, SECRET, {expiresIn: parseInt((Date.now() / 1000) + days * 24 * 60 * 60) }, (err, token) => {
				if(err)
					reject(new Response(false, err));
				else 
					resolve(token);
			});
		});
	}
	
	static isAdmin(user){
		if(user === undefined) return false;
		return user.priv == 1;	
	}

	async process(lang, item){
		delete item.password;
		delete item.bitacora;
		return item;
	}
	
	async checkHash(jwtoken){
		if(jwtoken){
			return new Promise( async (resolve, reject) => {				
				jwt.verify(jwtoken, SECRET, async (err, decoded) => {
					if(err){
						return reject(new Response(false, err));
					}
					if(decoded.exp * 1000 < Date.now())
						return reject(new Response(false, "expired token"));
					
					if(!decoded._id)
						return reject(new Response(false));
					
					const user = await this.selectOne({}, {_id: decoded._id});
					
					if(!user.success)
						return reject(new Response(false));
					
					if(!user.item.valid)
						return reject(new Response(false));
					
					if(decoded.iat * 1000 < user.item.issuedAfter)
						return reject(new Response(false, "please renew"));
					resolve(user);
				});
			});
		}else
			resolve(new Response(false));
	}	
	
	async doUpdate(lang, oldBody, body){
		let data = await this.makeData(body);
		
		if(Object.keys(data).length == 0)
			return new Response(false, lang.emptyBodyError);
		
		if(data.email){
			let emailItem = await this.doSelectOne(lang, { "_id_ne" : oldBody._id, email : data.email});
			if(emailItem.success){
				throw new Response(false, lang.userEmailAlreadyRegistered);
			}
		}
		
		let jtw = false;
		
		if(data.password){
			const salt = await User.getSalt(lang);
			data.password = await User.hashPass(lang, salt, data.password);
			data.issuedAfter = Date.now();
			jtw = await User.getJWT({_id : oldBody._id}, 15);
		}
		
		let updateResult = await this.updateOne(lang, oldBody, data);
		
		if(jtw){
			updateResult.token = jtw;
			updateResult.expires = parseInt((Date.now() / 1000) + 15 * 24 * 60 * 60);
		}
			
		return updateResult;
	}
	
	async doInsert(lang, body){
		const data = await this.makeData(body);
		
		if(Object.keys(data).length == 0)
			return new Response(false, lang.emptyBodyError);
		
		for(const key in this._schema){
			if(this._schema[key].required && !data[key]){
				return new Response(false, lang[this._schema[key].required]);
			}
		}
		data.status = 1;
		
		data.created = Date.now();
		data.lastOnline = Date.now();
		data.validateToken = hashids.encode(Date.now());
		data.valid = true;
		
		const emailItem = await this.selectOne(lang, {email : data.email});
		if(emailItem.success)
			return new Response(false, lang.userEmailAlreadyRegistered);
		
		const salt = await User.getSalt(lang);
		data.password = await User.hashPass(lang, salt, data.password);
		
		return this.insertOne(lang, data);
	}
	
}

module.exports = User;