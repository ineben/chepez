const Base = require(__dirname + '/_Base')
	Response = require(__dirname + '/_Response'),
	path = require('path');

let	Schema = require("../schemas/quota");
Schema = {...Schema};

class Quota extends Base{
	
	constructor(){
		super("quotas", Schema.EntitySchema);
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
		
		const user = await User.doSelectOne(lang, {_id: data.user});
		
		if(!user.success)
			return user;
		
		data.restante = data.total;
		data.created = Date.now();
		data.lastUsed = Date.now();
		data.lastReset = Date.now();
		data.validUntil = Date.now() + data.reset * 24 * 60 * 60 * 1000;
		data.lastUpdate = 0;
		data.valid = true;
		
		return this.insertOne(lang, data);
	}
	
}

module.exports = Quota;


let User = require(__dirname + "/User");
User = new User();