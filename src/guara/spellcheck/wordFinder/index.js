const steed = require("../../Steedz")();
const db = require('../../../logic/database/conn')();
const { readFile } = require('fs');
const nodehun = require('nodehun');

const dics = [];
const dicNames = [
	"es",
	"es_AR",
	"es_BO",
	"es_CL",
	"es_CO",
	"es_CR",
	"es_DO",
	"es_EC",
	"es_SV",
	"es_ES",
	"es_GT",
	"es_HN",
	"es_MX",
	"es_NI",
	"es_PA",
	"es_PY",
	"es_PE",
	"es_PR",
	"es_DO",
	"es_UY",
	"es_VE"
];

function getDic(region){
	return new Promise( function(resolve){
		if(region > dicNames.length)
			region = 0;
		
		if(dics[region]){
			resolve(dics[region]);
			return;
		}
		
		const name = dicNames[region];
		
		readFile(`${__dirname}/dics/${name}.dic`,  function(err, dotDic){
			
			readFile(`${__dirname}/dics/${name}.aff`, function(err, dotAff){
				
				const d = new nodehun(dotAff, dotDic);
				
				d.isCorrectP = function(word){
					return new Promise((resolve, reject) => {
						this.isCorrect(word, function(err, correct, origWord){
							
							if(err){ 
								reject(err);
								return;
							}
							
							resolve(correct);
						});
					});
				};
				
				 
				d.spellSuggestionsP = function(word){
					return new Promise((resolve, reject) => {
						this.spellSuggestions(word, function(err, correct, suggestions, origWord){
							
							if(err){ 
								reject(err);
								return;
							}
							
							resolve(suggestions);
						});
					});					
				};
				
				dics[region] = d;
				resolve(dics[region]);
				return;
			});
			return;
		});
	});
	
}

function DicWordState(dictionary){
	this.dictionary = dictionary;
}

function WordState(dictionary, toRegion){
	this.dictionary = dictionary;
	this.toRegion = toRegion;
}

function findWordD(word, cb){
	let reWord = {word: word, found: false, suggestions: []};
	
	this.dictionary.spellSuggestions(word, (err, correct, suggestions) => {
		cb(null, {found: correct, word: word, suggestions: suggestions});
	});
	
};

function findWord(word, cb){
	
	let reWord = {word: word, found: false, suggestions: []};
	
	for(const dic of this.dictionary){
		
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
			reWord.found = true;
			return cb(null, reWord);
		}else{
			for(const sinonim of dic.sinonimos){
				
				if(this.toRegion != sinonim.region)
					continue;
				
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
					reWord.found = true;
					return cb(null, reWord);
				}
			}
		}
	}
	return cb(null, null);
	
};

function findWordR(word, cb){
	
	let reWord = {word: word, found: false, suggestions: []};
	for(const dic of this.dictionary){
		if(dic.word == word){
			reWord.found = true;
			reWord.suggestions = [dic.replace];
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

function queryRWords(query, cb){
	db.search('replace', 'palabra', {
		include_docs:true, 
		q: query
	}, cb);
}

async function getWords(words, toRegion){
	return new Promise( async (resolve, reject) => {
		
		let hunWords = {}, 
			foundWords = {},
			replaceWords = {};
			
		const queryString = [[]], 
			resultF = [],
			resultR = [];
		
		let key = 0, 
			pushes = 0,
			resolvedF = 0,
			resolvedR = 0,
			toReject = false;
		
		for(const word of words){
			queryString[key].push(`palabra:${word}`);
			pushes++;
			if(pushes == 200){
				key++;
				pushes = 0;
			}
		}
		
		let takes = 0;
		const finalResolver = function(){
			takes++;
			if(takes != 3) return;
			
			if(toReject){
				reject(toReject);
				return;
			}
			
			const returnWords = {};
			
			for(const word of words){
				
				if(foundWords.hasOwnProperty(word) && foundWords[word].found){
					returnWords[word] = foundWords[word];
				}else if(replaceWords.hasOwnProperty(word) && replaceWords[word].found){
					returnWords[word] = {found: false, word: word, suggestions: replaceWords[word].suggestions};
				}else if(hunWords.hasOwnProperty(word))
					returnWords[word] = hunWords[word];
				
			}
			resolve(returnWords);
		}
		
		const resolverF = async function(er, dbResponse){
			resolvedF++;
			
			if (er) {
				console.log(er);
				toReject = er;
			}else if(!toReject){
				for(const item of dbResponse.rows){
					resultF.push(item.doc);
				}
			}
			
			if(resolvedF == queryString.length){
				
				if(toReject){
					finalResolver();
					return;
				}
				
				const orders = {};
				for(const word of words){
					orders[word] = findWord;
				}
				
				const formatedWords = await steed.parallel(
					new WordState(resultF, toRegion), 
					orders);
				
				for(let key in formatedWords){
					if(formatedWords[key] == null)
						delete formatedWords[key];
				}
				
				foundWords = formatedWords;
				finalResolver();
			}
		};
		
		const resolverR = async function(er, dbResponse){
			resolvedR++;
			
			if (er) {
				console.log(er);
				toReject = er;
			}else if(!toReject){
				for(const item of dbResponse.rows){
					resultR.push(item.doc);
				}
			}
			
			
			if(resolvedR == queryString.length){
				if(toReject){
					finalResolver();
					return;
				}
				
				const orders = {};
				for(const word of words){
					orders[word] = findWordR;
				}
				
				const formatedWords = await steed.parallel(
					new WordState(resultR, toRegion), 
					orders);
				
				for(let key in formatedWords){
					if(formatedWords[key] == null)
						delete formatedWords[key];
				}
				
				replaceWords = formatedWords;
				finalResolver();
			}
		};
		
		for(const query of queryString){
			queryWords(query.join(" OR "), resolverF);
			queryRWords(query.join(" OR "), resolverR);
		}
		
		const dictionary = await getDic(toRegion), i = words.length;
		const hunOrders = {};
		
		for(const word of words){
			hunOrders[word] = findWordD;
		}
		
		await steed.parallel(new DicWordState(dictionary), hunOrders)
		.then(function(hunResult){
			for(let key in hunResult){
				if(hunResult[key] == null)
					delete hunResult[key];
			}
			
			hunWords = hunResult;
			finalResolver();
		})
		.catch(function(err){
			toReject = err;
			finalResolver();
		});
		
		
	});
};

module.exports = {
	getWords
};