const steed = require("../../Steedz")();
const db = require('../../../logic/database/conn')();

function WordState(dictionary, fromRegion){
	this.dictionary = dictionary;
	this.fromRegion = fromRegion;
}

function findWord(word, cb){
	
	let reWord, currentGrade = null;
	
	for(const dic of this.dictionary){
		let found = false;
		
		if(
			dic.base == word || 
			dic.gerundio == word || 
			dic.participio == word || 
			dic.female == word || 
			dic.neutral == word ||
			dic.plural == word ||
			dic.pluralFemale == word ||
			dic.pluralNeutral == word
			
		){
			const ret = {
				grado : 1,
				region : 0,
				type : dic.type
			};
			
			if(dic.type == 2){
				ret.living = dic.living;
				ret.profession = dic.profession;
			}
			
			if(dic.type == 1 || dic.type == 3){
				if(dic.base == word || dic.plural == word){
					ret.gender = "male";
				}else if(dic.female == word || dic.pluralFemale == word){
					ret.gender = "female";
				}else if(dic.neutral == word || dic.pluralNeutral == word){
					ret.gender = "neutral";
				}
			}
			
			if(dic.type != 5 && dic.type != 6 && dic.type != 2){
				ret.plural = word == dic.plural || word == dic.pluralFemale || word == dic.pluralNeutral;
			}
			
			cb(null, ret);
			return;
		}else{
			for(const sinonim of dic.sinonimos){
				if(this.fromRegion == undefined || this.fromRegion == sinonim.region){
					if(
						sinonim.palabra == word || 
						sinonim.gerundio == word || 
						sinonim.participio == word || 
						sinonim.female == word || 
						sinonim.neutral == word ||
						sinonim.plural == word ||
						sinonim.pluralFemale == word ||
						sinonim.pluralNeutral == word
					){
						const ret = {
							grado : sinonim.grado,
							region : sinonim.region,
							type : dic.type
						};
						
						if(dic.type == 2){
							ret.living = dic.living;
							ret.profession = dic.profession;
						}
						
						if(dic.type == 1 || dic.type == 3){
							if(sinonim.palabra == word || sinonim.plural == word){
								ret.gender = "male";
							}else if(sinonim.female == word || sinonim.pluralFemale == word){
								ret.gender = "female";
							}else if(sinonim.neutral == word || sinonim.pluralNeutral == word){
								ret.gender = "neutral";
							}
						}
						
						if(dic.type != 5 && dic.type != 6 && dic.type != 2){
							ret.plural = word == sinonim.plural || word == sinonim.pluralFemale || word == sinonim.pluralNeutral;
						}
						
						cb(null, ret);
						return;
					}
				}
			}
		}
	}
	return cb(null, null);
};

function queryWords(query, cb){
	db.search('palabras', 'palabra', {
		include_docs:true, 
		q: query
	}, cb);
}

function queryWordsPromise(query){
	return new Promise( (resolve, reject) => {
		db.search('palabras', 'palabra', {
			include_docs:true, 
			q: query
		}, (err, dbResponse) => {
			
			if(err){
				console.log(err);
				resolve([]);
				return;
			}
			
			const docs = [];
			for(const item of dbResponse.rows){
				docs.push(item.doc);
			}
			resolve(docs);
		});
	});
}

async function getWords(words, fromRegion){
	return new Promise( async (resolve, reject) => {
		const queryString = [[]], 
			result = [];
		let key = 0, 
			pushes = 0,
			resolved = 0,
			toReject = false;
		
		for(const word of words){
			queryString[key].push(`palabra:${word}`);
			pushes++;
			if(pushes == 200){
				key++;
				pushes = 0;
			}
		}
		
		const resolver = async function(er, dbResponse){
			resolved++;
			
			if (er) {
				console.log(er);
				toReject = er;
			}else if(!toReject){
				for(const item of dbResponse.rows){
					result.push(item.doc);
				}
			}
			
			if(resolved == queryString.length){
				if(toReject)
					reject(toReject);
				else{
					const orders = {};
					for(const word of words){
						orders[word] = findWord;
					}
					
					const formatedWords = await steed.parallel(
						new WordState(result, fromRegion), 
						orders);
						
					for(let key in formatedWords){
						if(formatedWords[key] == null)
							delete formatedWords[key];
					}
					
					resolve(formatedWords);
				}
			}
		};
		
		for(const query of queryString)
			queryWords(query.join(" OR "), resolver);
	});
};

module.exports = {
	findWord,
	getWords,
	queryWords,
	queryWordsPromise
};