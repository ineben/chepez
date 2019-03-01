const steed = require("../../Steedz")();
const db = require('../../../logic/database/conn')();
const { pluralize } = require("../../PluralizeEs");

function WordState(dictionary, toRegion, toGrade, fromRegion){
	this.dictionary = dictionary;
	this.toRegion = toRegion;
	this.fromRegion = fromRegion;
	this.toGrade = toGrade;
}

function setWord(dic, sinonim){
	const reWord = {
		...sinonim,
		palabra: sinonim.palabra,
		type: dic.type
	};
							
	if(reWord.type == 1 || reWord.type == 3 || reWord.type == 4){
		reWord.palabra = isPlural ? sinonim.plural || pluralize.plural(sinonim.palabra) : sinonim.palabra;
	}
	
	if(reWord.type == 1 || reWord.type == 3){
		reWord.female = isPlural ? sinonim.pluralFemale || pluralize.plural(sinonim.female)  : sinonim.female;
		reWord.neutral = isPlural ? sinonim.pluralNeutral || pluralize.plural(sinonim.neutral)  : sinonim.neutral;
	}
	
	if(reWord.type == 2){
		if(foundGerundio)
			reWord.palabra = sinonim.gerundio;
		else if(foundParticipio)
			reWord.palabra = sinonim.participio;
	}
	
	return reWord;
}

function findWord(word, cb){
	
	let reWord, currentGrade = null;
	
	for(const dic of this.dictionary){
		
		let found = false, 
			isPlural = false, 
			foundGerundio = false, 
			foundParticipio = false;
		
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
			found = true;
			isPlural = dic.plural == word ||
				dic.pluralFemale == word ||
				dic.pluralNeutral == word;
			
			if(dic.type == 2){
				
				if(dic.gerundio == word)
					foundGerundio = true;
				else if(dic.participio == word)
					foundParticipio = true;
			}
			
		}else{
			for(const sinonim of dic.sinonimos){
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
					if(this.fromRegion !== undefined || this.fromRegion == sinonim.region){
						found = true;
						isPlural = sinonim.plural == word ||
							sinonim.pluralFemale == word ||
							sinonim.pluralNeutral == word;
						
						if(dic.type == 2){
							
							if(sinonim.gerundio == word)
								foundGerundio = true;
							else if(sinonim.participio == word)
								foundParticipio = true;
						}
						
					}
				}
			}
		}
		
		if(found){
			reWord = {
				palabra : dic.base,
				type : dic.type
			};
			
			if(reWord.type == 1 || reWord.type == 3 || reWord.type == 4){
				reWord.palabra = isPlural ? dic.plural || pluralize.plural(dic.base) : dic.base;
			}
			
			if(reWord.type == 1 || reWord.type == 3){
				reWord.female = isPlural ? dic.pluralFemale || pluralize.plural(dic.female)  : dic.female;
				reWord.neutral = isPlural ? dic.pluralNeutral || pluralize.plural(dic.neutral)  : dic.neutral;
			}
			
			if(reWord.type == 2){
				if(foundGerundio)
					reWord.palabra = dic.gerundio;
				else if(foundParticipio)
					reWord.palabra = dic.participio;
			}
			
			for(const sinonim of dic.sinonimos){
				if(sinonim.region == this.toRegion){
					if(this.toGrade !== undefined){
						if(this.toGrade == sinonim.grado){							
							reWord = setWord(dic, sinonim);
							break;
						}else{
							const dif = Math.abs(this.toGrade - sinonim.grado);
							if(currentGrade === null || dif < currentGrade){
								reWord = setWord(dic, sinonim);
							}
						}
					}else{
						reWord = setWord(dic, sinonim);
						break;
					}
				}
			}
			
			if(reWord.type == 1){
				reWord.living = dic.living;
				reWord.profession = dic.profession;
			}
			
			if(reWord.type == 1 || reWord.type == 3){
				if(reWord.palabra == null && reWord.neutral == null)
					reWord.gender = "female";
				if(reWord.female == null && reWord.neutral == null)
					reWord.gender = "male";
				if(reWord.palabra == null && reWord.female == null)
					reWord.gender = "neutral";
			}
			
			if(reWord.type == 4){
				reWord.adverbType = dic.adverbType;
			}
			
			return cb(null, reWord);
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

async function getWords(words, toRegion, toGrade, fromRegion){
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
						new WordState(result, toRegion, fromRegion, toGrade), 
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