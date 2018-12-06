const Cloudant = require('@cloudant/cloudant');
const steed = require("../Steedz")();
const cloudant = Cloudant(
	{
		account: "f7c359be-1f39-4c2f-82a0-3020878141a4-bluemix", 
		password: "2fa3033a07b8795be43cda64bd4576875ab9dd0e5a5be66cb57306bb0c3b5c17"
	}
);
const db = cloudant.db.use('guara');


function WordState(dictionary, toRegion, toGrade, fromRegion){
	//this.words = words;
	this.dictionary = dictionary;
	this.toRegion = toRegion;
	this.fromRegion = fromRegion;
	this.toGrade = toGrade;
}

function findWord(word, cb){
	
	let reWord, currentGrade = null;
	
	for(const dic of this.dictionary){
		let found = false;
		
		if(dic.base == word || dic.female == word || dic.neutral == word)
			found = true;
		else{
			for(const sinonim of dic.sinonimos){
				if(sinonim.palabra == word || sinonim.female == word || sinonim.neutral == word){
					if(this.fromRegion !== undefined){
						found = this.fromRegion == sinonim.region;
					}else
						found = true
				}
			}
		}
		
		if(found){
			reWord = {
				palabra: dic.base,
				female: dic.female,
				neutral: dic.neutral,
				plural: dic.basePural, 
				type: dic.type, 
				living: dic.living,
				profession: dic.profession
			};
			
			for(const sinonim of dic.sinonimos){
				if(sinonim.region == this.toRegion){
					if(this.toGrade !== undefined){
						if(this.toGrade == sinonim.grado){							
							reWord = {
								...sinonim,
								type: dic.type, 
								living: dic.living,
								profession: dic.profession
							};
							break;
						}else{
							const dif = Math.abs(this.toGrade - sinonim.grado);
							if(currentGrade === null || dif < currentGrade){
								reWord = {
									...sinonim,
									type: dic.type, 
									living: dic.living,
									profession: dic.profession
								};
							}
						}
					}else{
						reWord = {
							...sinonim,
							type: dic.type, 
							living: dic.living,
							profession: dic.profession
						};
						break;
					}
				}
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