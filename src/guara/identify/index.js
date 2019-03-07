const { pluralize } = require("../PluralizeEs");
const articleze = require("../Articleze");
const steed = require("../Steedz")();
const { getWords } = require("./wordFinder");

const identify = async (query, fromRegion) => {
	return new Promise( (resolve, reject) => {
		
		const workableQuery = query
			.toLowerCase()
			.replace("  ", " ")
			.replace(/[^áéíóúña-z\s]/gi, '');
			
		const words = [...new Set(workableQuery.split(" "))],
			searchWord = [];
		
		words.forEach( (word, i) => {
			if(!articleze.isArticle(word)){
				if(!pluralize.isSingular(word)){
					//word = pluralize.singular(word);
				}
				searchWord.push(word);
			}
		});
		
		getWords(searchWord, fromRegion)
		.then( (translatedWords) => {
			const oldPhrase = query.replace("  ", " ").split(" "), newPhrase = [];
			for(const oWord of oldPhrase){
				
				const word = oWord.match(/([áéíóúña-z]{1,})/gi)[0];
				
				if(articleze.isArticle(word)){
					const ret = {
						word : word,
						type : 7,
						plural : pluralize.isPlural(word.toLowerCase())
					};
					
					if(articleze.articleIsMale(word))
						ret.gender = "male";
					else if(articleze.articleIsFemale(word))
						ret.gender = "female";
					else if(articleze.articleIsNeutral(word))
						ret.gender = "neutral";
					
					newPhrase.push(ret);
					continue;
				}
				
				let keyword = word.toLowerCase();
				const isPlural = pluralize.isPlural(keyword);
				
				let newWord = {
					word : word,
					plural : isPlural
				};
				
				/*if(isPlural){
					keyword = pluralize.singular(keyword);
				}*/
				
				if(translatedWords.hasOwnProperty(keyword)){
					newWord = {...translatedWords[keyword], ...newWord};
					if(newWord.type != 1 && newWord.type != 3){
						delete newWord.plural;
					}
				}else{
					newWord.type = -1;
					delete newWord.plural;
				}
				newPhrase.push(newWord);
			}
			
			resolve(newPhrase);
		} )
		.catch( (e) => {
			reject(e);
		});
	});
};

module.exports = identify;