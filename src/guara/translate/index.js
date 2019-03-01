const {restoreCase, pluralize} = require("../PluralizeEs");
const articleze = require("../Articleze");
const genderize = require("../Genderize");
const steed = require("../Steedz")();
const {getWords} = require("./wordFinder");


function findGender(keyword, indexInTranslated, newPhrase, translatedWords, oldPhrase){
	if(translatedWords[indexInTranslated].gender)
		return translatedWords[indexInTranslated].gender;
	
	if(translatedWords[indexInTranslated].palabra == keyword || 
		genderize.nounIsMale(keyword) || 
		genderize.professionIsMale(keyword)){
		return "male";
	}else if(translatedWords[indexInTranslated].female == keyword || 
		genderize.nounIsFemale(keyword) || 
		genderize.professionIsFemale(keyword)){
		return "female";
	}else if(translatedWords[indexInTranslated].neutral == keyword || 
		genderize.nounIsNeutral(keyword) || 
		genderize.professionIsNeutral(keyword)){
		return "neutral";
	}
	
	return articleze.findGenderOfPreviousArticle(newPhrase, translatedWords, oldPhrase);
}

const translate = async (query, toRegion, toGrade, fromRegion, inclusive) => {
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
		
		getWords(searchWord, toRegion, fromRegion, toGrade)
		.then( (translatedWords) => {
			
			const oldPhrase = query.replace("  ", " ").split(" "), newPhrase = [];
			for(const oWord of oldPhrase){
				
				const word = oWord.match(/([áéíóúña-z]{1,})/gi)[0];
				
				if(articleze.isArticle(word)){
					newPhrase.push(oWord);
					continue;
				}
				
				let keyword = word.toLowerCase();
				const isPlural = pluralize.isPlural(keyword);
				
				if(isPlural){
					//keyword = pluralize.singular(keyword);
				}
				
				if(translatedWords.hasOwnProperty(keyword)){
					
					
					let replaceWord;
					if(translatedWords[keyword].palabra){
						replaceWord = translatedWords[keyword].palabra;
					}else if(translatedWords[keyword].female){
						replaceWord = translatedWords[keyword].female;
					}else if(translatedWords[keyword].neutral){
						replaceWord = translatedWords[keyword].neutral;
					}
					
					switch(translatedWords[keyword].type){
						case 1: //sujeto
							if(translatedWords[keyword].living){
								
								if(inclusive){
									if(newPhrase.length > 0){ //La nueva frase tiene mas de una entrada, buscamos el articulo anterior y corregimos el genero
										genderize.switchPreviousWordsGender(newPhrase, translatedWords, oldPhrase, "neutral", articleze.toNeutral, genderize.toAdjetiveNeutral);
									}
									
									if(translatedWords[keyword].neutral){
										replaceWord = translatedWords[keyword].neutral;
									}else if(translatedWords[keyword].profession){
										replaceWord = genderize.toProfessionNeutral(replaceWord);
									}else{
										replaceWord = genderize.toNounNeutral(replaceWord);
									}
								
									//if(isPlural){
									//	if(translatedWords[keyword].pluralNeutral)
									//		replaceWord = translatedWords[keyword].pluralNeutral;
									//	else
									//		replaceWord = pluralize.plural(replaceWord);
									//}
								
								}else{
									/*if(isPlural){
										
										replaceWord = translatedWords[keyword].plural || pluralize.plural(replaceWord);
										
										const gender = findGender(keyword, keyword, newPhrase, translatedWords, oldPhrase);
										
										switch(gender){
											case "male":
												if(translatedWords[keyword].plural)
													replaceWord = translatedWords[keyword].plural;
												break;
											case "female":
												if(translatedWords[keyword].pluralFemale)
													replaceWord = translatedWords[keyword].pluralFemale;
												break;
											case "neutral":
												if(translatedWords[keyword].pluralNeutral)
													replaceWord = translatedWords[keyword].pluralNeutral;
												break;	
										}
									
									}else{*/
										replaceWord = genderize.matchNounGender(keyword, replaceWord, translatedWords[keyword]);
									//}
								}
								
							}else{
								//find gender of keyword
								//equate to same gender if possible
								//if not fix the previous article
								const gender = findGender(keyword, keyword, newPhrase, translatedWords, oldPhrase);
								
								console.log("toSwitch", gender);
								switch(gender){
									case "male":
										if(translatedWords[keyword].palabra){
											replaceWord = translatedWords[keyword].palabra;
										}else{
											if(translatedWords[keyword].female){
												replaceWord = translatedWords[keyword].female;
												genderize.switchPreviousWordsGender(newPhrase, translatedWords, oldPhrase, "female", articleze.toFemale, genderize.toAdjetiveFemale);
											}else if(translatedWords[keyword].neutral){
												replaceWord = translatedWords[keyword].neutral;
												genderize.switchPreviousWordsGender(newPhrase, translatedWords, oldPhrase, "neutral", articleze.toNeutral, genderize.toAdjetiveNeutral);
											}
										}
										break;
									case "female":
										if(translatedWords[keyword].female){
											replaceWord = translatedWords[keyword].female;
											genderize.switchPreviousWordsGender(newPhrase, translatedWords, oldPhrase, "female", articleze.toFemale, genderize.toAdjetiveFemale);
										}else{
											if(translatedWords[keyword].palabra){
												replaceWord = translatedWords[keyword].palabra;
												genderize.switchPreviousWordsGender(newPhrase, translatedWords, oldPhrase, "male", articleze.toMale, genderize.toAdjetiveMale);
											}else if(translatedWords[keyword].neutral){
												replaceWord = translatedWords[keyword].neutral;
												genderize.switchPreviousWordsGender(newPhrase, translatedWords, oldPhrase, "neutral", articleze.toNeutral, genderize.toAdjetiveNeutral);
											}
										}
										break;
									case "neutral":
											if(translatedWords[keyword].neutral){
												replaceWord = translatedWords[keyword].neutral;
											}else{
												if(translatedWords[keyword].palabra){
													replaceWord = translatedWords[keyword].palabra;
													genderize.switchPreviousWordsGender(newPhrase, translatedWords, oldPhrase, "male", articleze.toMale, genderize.toAdjetiveMale);
												}else if(translatedWords[keyword].female){
													replaceWord = translatedWords[keyword].female;
													genderize.switchPreviousWordsGender(newPhrase, translatedWords, oldPhrase, "female", articleze.toFemale, genderize.toAdjetiveFemale);
												}
											}
										break;
								}
							}
							break;
						case 3: //adjetivo
							if(newPhrase.length > 0){
								let adjLen = newPhrase.length;
								let matchGender = false;
								while(adjLen--){
									const OadjKeyword = oldPhrase[adjLen].toLowerCase();
									const OadjNKeyword = newPhrase[adjLen].toLowerCase();
									
									if(new RegExp(/[\.!?¡¿]/g).test(OadjKeyword)) break;
									
									let adjKeyword = OadjKeyword.match(/([áéíóúña-z]{1,})/gi)[0];
									
									if(articleze.isArticle(adjKeyword)){
										break;
									}
									
									if(pluralize.isPlural(adjKeyword)){
										//adjKeyword = pluralize.singular(adjKeyword);
									}
									
									if( translatedWords.hasOwnProperty(adjKeyword) && translatedWords[adjKeyword].type == 1){
										
										let adjNKeyword = OadjNKeyword.match(/([áéíóúña-z]{1,})/gi)[0];
										if(pluralize.isPlural(adjNKeyword)){
											//adjNKeyword = pluralize.singular(adjNKeyword);
										}
										let doGender = false;
										
										if(translatedWords[adjKeyword].living){
											if(inclusive){
												//if(isPlural){
												//	replaceWord = translatedWords[keyword].pluralNeutral || ( translatedWords[keyword].neutral ? pluralize.plural(translatedWords[keyword].neutral) :  pluralize.plural(genderize.toAdjetiveNeutral(translatedWords[keyword].palabra || translatedWords[keyword].female)));
												//}else{
													replaceWord = translatedWords[keyword].neutral || genderize.toAdjetiveNeutral(translatedWords[keyword].palabra || translatedWords[keyword].female);
												//}
											}else{
												doGender = true;
											}
										}else{
											doGender = true;
										}
										
										if(doGender){											
											const gender = findGender(adjNKeyword, adjKeyword, newPhrase, translatedWords, oldPhrase);
											
											console.log("doGender", adjNKeyword, keyword, gender);
											
											switch(gender){
												case "male":
													//if(isPlural){
													//	replaceWord = translatedWords[keyword].plural || ( translatedWords[keyword].palabra ? pluralize.plural(translatedWords[keyword].palabra) :  pluralize.plural(genderize.toAdjetiveMale(translatedWords[keyword].female || translatedWords[keyword].neutral)));
													//}else{
														replaceWord = translatedWords[keyword].palabra || genderize.toAdjetiveMale(translatedWords[keyword].neutral || translatedWords[keyword].female);
													//}
													break;
												case "female":
													//if(isPlural){
													//	replaceWord = translatedWords[keyword].pluralFemale || ( translatedWords[keyword].female ? pluralize.plural(translatedWords[keyword].female) :  pluralize.plural(genderize.toAdjetiveFemale(translatedWords[keyword].male || translatedWords[keyword].neutral)));
													//}else{
														replaceWord = translatedWords[keyword].female || genderize.toAdjetiveMale(translatedWords[keyword].neutral || translatedWords[keyword].palabra);
													//}
													break;
												case "neutral":
													//if(isPlural){
													//	replaceWord = translatedWords[keyword].pluralNeutral || ( translatedWords[keyword].neutral ? pluralize.plural(translatedWords[keyword].neutral) :  pluralize.plural(genderize.toAdjetiveNeutral(translatedWords[keyword].palabra || translatedWords[keyword].female)));
													//}else{
														replaceWord = translatedWords[keyword].neutral || genderize.toAdjetiveNeutral(translatedWords[keyword].palabra || translatedWords[keyword].female);
													//}
													break;
												default:
													matchGender = true;
													break;
											}
										}
										break;
									}
								}
								if(matchGender)
									replaceWord = genderize.matchNounGender(keyword, replaceWord, translatedWords[keyword]);
							}else{
								replaceWord = genderize.matchNounGender(keyword, replaceWord, translatedWords[keyword]);	
							}
							break;
						case 2: //verbo
							/*if(isPlural){
								if(translatedWords[keyword].plural)
									replaceWord = translatedWords[keyword].plural;
								else
									replaceWord = pluralize.plural(replaceWord);
							}*/
							break;
						default:
							/*if(isPlural){
								if(translatedWords[keyword].plural)
									replaceWord = translatedWords[keyword].plural;
								else
									replaceWord = pluralize.plural(replaceWord);
							}*/
							break;
					}
					newPhrase.push(oWord.replace(/([áéíóúña-z]{1,})/ig, restoreCase(word, replaceWord)));
				}else{
					newPhrase.push(oWord.replace(/([áéíóúña-z]{1,})/ig, word));
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