const {restoreCase, pluralize} = require("./PluralizeEs");
const articleze = require("./Articleze");
const genderize = require("./Genderize");
const steed = require("./Steedz")();
const Cloudant = require('@cloudant/cloudant');

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

const findWord = function(word, cb){
	
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
						if(this.toGrade == sinonim.grade){							
							reWord = {
								...sinonim,
								type: dic.type, 
								living: dic.living,
								profession: dic.profession
							};
							break;
						}else{
							const dif = Math.abs(this.toGrade - sinonim.grade);
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



const getWords = async (words, toRegion, toGrade, fromRegion) => {
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
				console.log(err);
				toReject = err;
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
			db.search('palabras', 'palabra', {
				include_docs:true, 
				q: query.join(" OR ")
			}, resolver);
	});
};

function switchPreviousWordsGender(phrase, translatedWords, oldPhrase, gender, articleGenderBender, adjetiveGenderBender){
	let len = phrase.length;
	while(len--){
		if(articleze.isArticle(phrase[len])){
			phrase[len] = restoreCase(phrase[len], articleGenderBender(phrase[len]));
			return;
		}else{
			
			let keyword = oldPhrase[len].toLowerCase();
			const isPlural = pluralize.isPlural(keyword);
			if(isPlural){
				keyword = pluralize.singular(keyword);
			}
			if(translatedWords.hasOwnProperty(keyword)){
				let replaceWord = translatedWords[keyword].palabra;
				if(translatedWords[keyword].type == "adjetivo"){
					replaceWord = translatedWords[keyword].neutral || adjetiveGenderBender(replaceWord);
					if(isPlural){
						replaceWord = pluralize.plural(replaceWord);
					}
					phrase[len] = restoreCase(phrase[len], replaceWord);
				}
			}
		}
	}
}

const translate = async (query, toRegion, toGrade, fromRegion, inclusive) => {
	return new Promise( (resolve, reject) => {
		
		const workableQuery = query
			.toLowerCase()
			.replace("  ", " ")
			.replace(/[^a-z\s]/gi, '');
			
		const words = [...new Set(workableQuery.split(" "))],
			searchWord = [];
		
		words.forEach( (word, i) => {
			if(!articleze.isArticle(word)){
				if(!pluralize.isSingular(word)){
					word = pluralize.singular(word);
				}
				searchWord[i] = word;
			}
		});

		//words = [...new Set(words)];
		
		getWords(searchWord, toRegion, fromRegion, toGrade)
		.then( (translatedWords) => {
			const oldPhrase = query.split(" "), newPhrase = [];
			for(const word of oldPhrase){
				
				if(articleze.isArticle(word)){
					newPhrase.push(word);
					continue;
				}
				
				let keyword = word.toLowerCase();
				const isPlural = pluralize.isPlural(keyword);
				if(isPlural){
					keyword = pluralize.singular(keyword);
				}
				
				if(translatedWords.hasOwnProperty(keyword)){
					let replaceWord = translatedWords[keyword].palabra;
					switch(translatedWords[keyword].type){
						case "sujeto":
							if(inclusive && translatedWords[keyword].living){
								
								if(newPhrase.length > 0){ //La nueva frase tiene mas de una entrada, buscamos el articulo anterior y corregimos el genero
									switchPreviousWordsGender(newPhrase, translatedWords, oldPhrase, "neutral", articleze.toNeutral, genderize.toAdjetiveNeutral);
								}
								
								if(translatedWords[keyword].profession){
									replaceWord = genderize.toProfessionNeutral(replaceWord);
								}else{
									replaceWord = genderize.toNounNeutral(replaceWord);
								}
							}else{
								replaceWord = genderize.matchNounGender(keyword, replaceWord, translatedWords[keyword]);
								
							}
							
							if(isPlural){
								if(translatedWords[keyword].plural)
									replaceWord = translatedWords[keyword].plural;
								else
									replaceWord = pluralize.plural(replaceWord);
							}
							break;
						case "adjetivo":
							if(inclusive && newPhrase.length > 0){
								let adjLen = newPhrase.length;
								let matchGender = false;
								while(adjLen--){
									let adjKeyword = oldPhrase[adjLen].toLowerCase();
									
									if(articleze.isArticle(adjKeyword)){
										break;
									}
									
									if(pluralize.isPlural(adjKeyword)){
										adjKeyword = pluralize.singular(adjKeyword);
									}
									
									if(
										translatedWords.hasOwnProperty(adjKeyword) && 
										translatedWords[adjKeyword].type == "sujeto"
									){
										
										if(translatedWords[adjKeyword].living)
											replaceWord = genderize.toAdjetiveNeutral(replaceWord);
										else
											matchGender = true;
										break;
									}
								}
								if(matchGender)
									replaceWord = genderize.matchNounGender(keyword, replaceWord, translatedWords[keyword]);
							}else{
								replaceWord = genderize.matchNounGender(keyword, replaceWord, translatedWords[keyword]);	
							}
							
							if(isPlural){
								if(translatedWords[keyword].plural)
									replaceWord = translatedWords[keyword].plural;
								else
									replaceWord = pluralize.plural(replaceWord);
							}
							break;
						case "verbo":
							if(isPlural){
								if(translatedWords[keyword].plural)
									replaceWord = translatedWords[keyword].plural;
								else
									replaceWord = pluralize.plural(replaceWord);
							}
							break;
						default:
							if(isPlural){
								if(translatedWords[keyword].plural)
									replaceWord = translatedWords[keyword].plural;
								else
									replaceWord = pluralize.plural(replaceWord);
							}
							break;
					}
					
					newPhrase.push(restoreCase(word, replaceWord));
				}else{
					newPhrase.push(word);
				}
			}
			resolve(newPhrase.join(" "));
		} )
		.catch( (e) => {
			reject(e);
		});
	});
};

module.exports = translate;