const {restoreCase, pluralize} = require("../PluralizeEs");
const articleze = require("../Articleze");
const {getWords} = require("./wordFinder");
const stringSimilarity = require('string-similarity');

const spellcheck = function(query, toRegion){
	return new Promise( (resolve, reject) => {
		const workableQuery = query
			.toLowerCase()
			.replace("  ", " ")
			.replace(/[^áéíóúña-z\s]/gi, '');
			
		const words = [...new Set(workableQuery.split(" "))],
			searchWord = [];
		
		words.forEach( (word, i) => {
			if(!articleze.isArticle(word)){
				searchWord.push(word);
			}
		});
		
		getWords(searchWord, toRegion)
		.then( (translatedWords) => {
			const oldPhrase = query.replace("  ", " ").split(" "), newPhrase = [], sugoi = {};
			for(const oWord of oldPhrase){
				
				const word = oWord.match(/([áéíóúña-z]{1,})/gi)[0];
				
				if(articleze.isArticle(word)){
					newPhrase.push(oWord);
					continue;
				}
				
				let keyword = word.toLowerCase();
				if(translatedWords.hasOwnProperty(keyword)){
					
					if(translatedWords[keyword].found){
						newPhrase.push(oWord);
						continue;
					}else if(translatedWords[keyword].suggestions.length > 0){
						
						let replaceWord;
						
						sugoi[keyword] = translatedWords[keyword].suggestions;
						
						if(translatedWords[keyword].suggestions.length == 1){
							replaceWord = translatedWords[keyword].suggestions[0];
						}else{
							
							const ogSuggestions = translatedWords[keyword].suggestions;
							const fixedSuggestions = [];
							for(let sug of ogSuggestions){
								
								if(sug.charAt(0) == "h")
									sug = sug.substr(1);
								
								sug = sug.replace("á", "a");
								sug = sug.replace("é", "é");
								sug = sug.replace("í", "i");
								sug = sug.replace("ó", "o");
								sug = sug.replace("ú", "u");
								
								fixedSuggestions.push(sug);
							}
							
							const matches = stringSimilarity.findBestMatch(keyword, fixedSuggestions);
							const bestMatch = matches.bestMatch;
							//console.log(bestMatch);
							replaceWord = ogSuggestions[matches.bestMatchIndex];
						}
						
						newPhrase.push(oWord.replace(/([áéíóúña-z]{1,})/ig, restoreCase(word, replaceWord)));
					}
				}else{
					newPhrase.push(oWord.replace(/([áéíóúña-z]{1,})/ig, word));
				}
			}
			const ret = {
				phrase : newPhrase.join(" "),
				suggestions: sugoi
			};
			
			resolve(ret);
		})
		.catch( (e) => {
			reject(e);
		});
	});
};

module.exports = spellcheck;