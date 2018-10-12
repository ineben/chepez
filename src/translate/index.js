const {restoreCase, pluralize} = require("./PluralizeEs");
const articleze = require("./Articleze");
const genderize = require("./Genderize");
const steed = require("./Steedz")();

const staticDictionary = [
	{
		base: "profesor",
		female: "profesora",
		type: "sujeto",
		living: true,
		profession: true,
		sinonimos: []
	},
	{
		base: "mesa",
		type: "sujeto",
		living: false,
		sinonimos: []
	},
	{
		base: "hijo",
		female: "hija",
		neutral: "hije",
		type: "sujeto",
		living: true,
		sinonimos: []
	},
	{
		base: "lindo",
		female: "linda",
		neutral: "linde",
		type: "adjetivo",
		sinonimos: []
	},
	{
		base: "joven",
		type: "sujeto",
		living: true,
		profession: false,
		sinonimos: [
			{
				region: 1,
				palabra: "pibe",
				female: "piba",
				grado: 3
			},
			{
				region: 1,
				palabra: "chabon",
				grado: 4
			},
			{
				region: 2,
				palabra: "chamo",
				female: "chama",
				grado: 3
			},
			{
				region: 2,
				palabra: "carajo",
				female: "caraja",
				grado: 4
			}
		]
	},
	{
		base: "feo",
		type: "adjetivo",
		sinonimos: [
			{
				region: 0,
				palabra: "horrible",
				grado: 3
			}
			,
			{
				region: 1,
				palabra: "batracio",
				grado: 4
			}
		]
	}
];

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
		
		const result = [...staticDictionary], orders = {};
		
		for(const word of words){
			orders[word] = findWord;
		}
		
		/*		
		let foundObject = findWord(word, result, toRegion, fromRegion, toGrade);	
		if(foundObject){
			formatedWords[word] = {...foundObject};
		}*/
		
		const formatedWords = await steed.parallel(
			new WordState(result, toRegion, fromRegion, toGrade), 
			orders);
			
		for(let key in formatedWords){
			if(formatedWords[key] == null)
				delete formatedWords[key];
		}
		
		resolve(formatedWords);
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
			
		const 
			words = [...new Set(workableQuery.split(" "))],
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