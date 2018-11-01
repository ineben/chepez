const Base = require(__dirname + '/_Base')
	Response = require(__dirname + '/_Response'),
	path = require('path'),
	uuid = require('uuid/v4');	
	
let	Schema = require("../schemas/doc");
Schema = {...Schema};

class Doc extends Base{
	
	constructor(){
		super("doc", Schema.EntitySchema);
	}
	
	async removeSinonim(lang, word, id){
		let update = false;
		for(const key in word.sinonimos){
			if(word.sinonimos[key]._id == id){
				update = true;
				word.sinonimos.splice(key, 1);
				break;
			}
		}
		
		if(update){
			return this.updateOne(lang, {_rev: word._rev, _id: word._id}, word);
		}else
			return new Response(false, lang.nothingToRemove);	
	}
	
	async updateSinonim(lang, word, id, sinonim){
		const data = await this.makeData(sinonim, Schema.sinonimSchema);
		
		if(Object.keys(data).length == 0)
			return new Response(false, lang.emptyBodyError);
		
		for(const key in this._schema){
			if(this._schema[key].required && !data[key]){
				return new Response(false, lang[this._schema[key].required]);
			}
		}
		
		let upsert = false;
		for(const key in word.sinonimos){
			if(word.sinonimos[key]._id == id){
				word.sinonimos[key] = {...word.sinonimos[key], ...data, _id: id};
				upsert = true;
				break;
			}
		}
		
		if(upsert){
			word.sinonimos.push({...word.sinonimos[key], ...data, _id: id});
		}
		
		return this.updateOne(lang, {_rev: word._rev, _id: word._id}, word);
	}
	
	async insertSinonim(lang, word, sinonim){
		const data = await this.makeData(sinonim, Schema.sinonimSchema);
		
		if(Object.keys(data).length == 0)
			return new Response(false, lang.emptyBodyError);
		
		for(const key in this._schema){
			if(this._schema[key].required && !data[key]){
				return new Response(false, lang[this._schema[key].required]);
			}
		}
		
		data._id = uuid();
		
		word.sinonimos.push(data);
		
		return this.updateOne(lang, {_rev: word._rev, _id: word._id}, word);
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
		
		data.created = Date.now();
		data.lastUsed = Date.now();
		data.lastUpdate = 0;
		data.sinonimos = [];
		
		return this.insertOne(lang, data);
	}
	
}

module.exports = Doc;