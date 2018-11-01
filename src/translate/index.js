const {restoreCase, pluralize} = require("./PluralizeEs");
const articleze = require("./Articleze");
const genderize = require("./Genderize");
const steed = require("./Steedz")();
const {getWords} = require("./wordFinder");

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
									genderize.switchPreviousWordsGender(newPhrase, translatedWords, oldPhrase, "neutral", articleze.toNeutral, genderize.toAdjetiveNeutral);
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