const Base = require(__dirname + '/_Base')
	Response = require(__dirname + '/_Response'),
	path = require('path'),
	uuid = require('uuid/v4');	
	
let	Schema = require("../schemas/doc");
Schema = {...Schema};

const searchKeys = ["palabra", "female", "neutral", "plural", "pluralNeutral", "pluralFemale"];

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
		
		if(!upsert){
			word.sinonimos.push({...data, _id: id});
		}
		
		return this.updateOne(lang, {_rev: word._rev, _id: word._id}, word);
	}
	
	wordExists(set, dictionary){
		
		for(let key in searchKeys){
			if(set[key] != undefined){
				for(const word of dictionary){
					if(word.region != set.region) continue;
					
					for(let kkey in searchKeys){
						if(word[kkey] != undefined && set[key] == word[kkey]){
							console.log(word[kkey], set[key]);
							return true;
						}
					}
				}
			}
		}
		return false;
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
		
		if(this.wordExists(data, word.sinonimos))
			return new Response(true, word);
		
		word.sinonimos.push(data);
		
		return this.updateOne(lang, {_rev: word._rev, _id: word._id}, word);
	}
	
	async insertBulkSinonim(lang, word, bodies){
		
		console.log("incomming word", bodies);
		
		const promises = [];
		for(const body of bodies){
			promises.push(this.makeData(body, Schema.sinonimSchema));
		}
		
		const datas = await Promise.all(promises);
		const validDatas = [];
		const errors = [];
		
		console.log("incomming datas", datas);
		
		for(const index in datas){
			const data = datas[index];
			if(Object.keys(data).length > 0){
				for(const key in this._schema){
					if(this._schema[key].required && !data[key]){
						errors.push({index: index, mes: lang[this._schema[key].required]});
						continue;
					}
				}
				data._id = uuid();
				if(!this.wordExists(data, validDatas) && 
				  !this.wordExists(data, word.sinonimos))
					validDatas.push(data);
			}else{
				errors.push({index: index, mes: lang.emptyBodyError});
			}
		}
		
		let r;
		if(validDatas.length > 0){
			for(const data of validDatas)
				word.sinonimos.push(data);
			
			r = await this.updateOne(lang, {_rev: word._rev, _id: word._id}, word);
		}else{
			r = new Response(false);
		}
		
		r.errors = errors;
		return r;
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
	
	async doInsertBulk(lang, bodies){
		const promises = [];
		for(const body of bodies){
			promises.push(this.makeData(body));
		}
		
		const datas = await Promise.all(promises);
		const validDatas = [];
		const errors = [];
		
		for(const index in datas){
			const data = datas[index];
			if(Object.keys(data).length > 0){
				for(const key in this._schema){
					if(this._schema[key].required && !data[key]){
						errors.push({index: index, mes: lang[this._schema[key].required]});
						continue;
					}
				}
				data.created = Date.now();
				data.lastUsed = Date.now();
				data.lastUpdate = 0;
				data.sinonimos = [];
				validDatas.push(data);
			}else{
				errors.push({index: index, mes: lang.emptyBodyError});
			}
		}
		
		let r;
		if(validDatas.length > 0){
			r = await this.insertMany(lang, validDatas);
		}else{
			r = new Response(false);
		}
		
		r.errors = errors;
		return r;
	}
	
}

module.exports = Doc;