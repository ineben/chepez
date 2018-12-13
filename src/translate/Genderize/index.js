const {restoreCase, pluralize} = require("../PluralizeEs");
const articleze = require("../Articleze");

const maleProfessionNouns = [
	[
		/^([áéíóúña-z]{1,}[^áéíóúaeiou]$)/i, 
		{
			toNeutral: "$1",
			toFemale: "$1a"
		}
	],
	[
		/^([áéíóúña-z]{1,})[óo]$/i,
		{
			toNeutral: "$1e",
			toFemale: "$1a"
		}
	]
];

const femaleProfessionNouns = [
	[
		/^([áéíóúña-z]{1,})[áa]$/i,
		{
			toNeutral: "$1e",
			toMale: "$1o"
		}
	]
];

const neutralProfessionNouns = [
	[
		/^([áéíóúña-z]{1,}[^áéíóúaeiou]$)/i, 
		{
			toMale: "$1",
			toFemale: "$1a"
		}
	]
];

const maleLivingNoun = [
	[
		/^([áéíóúña-z]{1,})[óo]$/i,
		{
			toNeutral: "$1e",
			toFemale: "$1a"
		}
	]
];

const femaleLivingNoun = [
	[
		/^([áéíóúña-z]{1,})[áa]$/i,
		{
			toNeutral: "$1e",
			toMale: "$1o"
		}
	]
];

const neutralLivingNoun = [
	[
		/^([áéíóúña-z]{1,})[ée]$/i,
		{
			toMale: "$1o",
			toFemale: "$1a"
		}
	]
];

const maleAdjetive = [
	[
		/^([áéíóúña-z]{1,})[óo]$/i,
		{
			toNeutral: "$1e",
			toFemale: "$1a"
		}
	]
];

const femaleAdjetive = [
	[
		/^([áéíóúña-z]{1,})[áa]$/i,
		{
			toNeutral: "$1e",
			toMale: "$1o"
		}
	]
];

const neutralAdjetive = [
	[
		/^([áéíóúña-z]{1,}[^óoáa])$/i,
		{
			toFemale: "$0",
			toMale: "$0"
		}
	]
];

function inferGender(rules){
	return function(word){
		let token = word.toLowerCase().trim();
		let i = rules.length;
		while(i--){
			const rule = rules[i];
			if(rule[0].test(token)){
				return true;
			}
		}
		return false;
	};	
};

const genderize = {};

genderize.switchPreviousWordsGender = function(phrase, translatedWords, oldPhrase, gender, articleGenderBender, adjetiveGenderBender){
	let len = phrase.length;
	while(len--){
		if(articleze.isArticle(phrase[len])){
			phrase[len] = restoreCase(phrase[len], articleGenderBender(phrase[len]));
			return;
		}else{
			
			const Okeyword = oldPhrase[len].toLowerCase();
			
			if(new RegExp(/[\.!?¡¿]/g).test(Okeyword)) break;
			
			const keyword = Okeyword.match(/([áéíóúña-z]{1,})/gi)[0];
			const isPlural = pluralize.isPlural(keyword);
			if(isPlural){
				keyword = pluralize.singular(keyword);
			}
			
			if(translatedWords.hasOwnProperty(keyword)){
				let replaceWord = translatedWords[keyword].palabra;
				if(translatedWords[keyword].type == "adjetivo"){
					replaceWord = translatedWords[keyword][gender] || adjetiveGenderBender(replaceWord);
					if(isPlural){
						replaceWord = pluralize.plural(replaceWord);
					}
					phrase[len] = restoreCase(phrase[len], replaceWord);
				}
			}
		}
	}
};

genderize.adjetiveIsMale = inferGender(maleAdjetive);
genderize.adjetiveIsFemale = inferGender(femaleAdjetive);
genderize.adjetiveIsNeutral = inferGender(neutralAdjetive);

genderize.nounIsMale = inferGender(maleLivingNoun);
genderize.nounIsFemale = inferGender(femaleLivingNoun);
genderize.nounIsNeutral = inferGender(neutralLivingNoun);

genderize.professionIsMale = inferGender(maleProfessionNouns);
genderize.professionIsFemale = inferGender(femaleProfessionNouns);
genderize.professionIsNeutral = inferGender(neutralProfessionNouns);

function toGender(word, rules, gender){
	let length = rules.length;
	while(length--){
		const rule = rules[length];
		if(rule[0].test(word)){
			return word.replace(rule[0], rule[1][gender]);
		}
	}
	return word;
};

genderize.toAdjetiveFemale = function(word){
	return toGender(word, [...maleAdjetive, ...neutralAdjetive], "toFemale");
};
genderize.toAdjetiveMale = function(word){
	return toGender(word, [...neutralAdjetive, ...femaleAdjetive], "toMale");
};
genderize.toAdjetiveNeutral = function(word){
	return toGender(word, [...maleAdjetive, ...femaleAdjetive], "toNeutral");
};

genderize.matchNounGender = function(oldWord, newWord, dictionaryWord){
	if(oldWord == newWord) return newWord;
	
	if(dictionaryWord.profession){
		if(genderize.professionIsMale(oldWord)){
			return dictionaryWord.palabra || genderize.toProfessionMale(newWord);
		}else if(genderize.professionIsFemale(oldWord)){
			return dictionaryWord.female || genderize.toProfessionFemale(newWord);
		}else if(genderize.professionIsNeutral(oldWord)){
			return dictionaryWord.neutral || genderize.toProfessionNeutral(newWord);
		}else return newWord;
	}else{
		if(genderize.nounIsMale(oldWord)){
			return dictionaryWord.palabra || genderize.toNounMale(newWord);
		}else if(genderize.nounIsFemale(oldWord)){
			return dictionaryWord.female || genderize.toNounFemale(newWord);
		}else if(genderize.nounIsNeutral(oldWord)){
			return dictionaryWord.neutral || genderize.toNounNeutral(newWord);
		}else return newWord;
	}
};

genderize.matchAdjetiveGender = function(oldWord, newWord, dictionaryWord){
	if(oldWord == newWord) return newWord;
	
	if(genderize.adjetiveIsMale(oldWord)){
		return genderize.toAdjetiveMale(newWord);
	}else if(genderize.adjetiveIsFemale(oldWord)){
		return dictionaryWord.female || genderize.toAdjetiveFemale(newWord);
	}else if(genderize.adjetiveIsMale(oldWord)){
		return dictionaryWord.neutral || genderize.toAdjetiveNeutral(newWord);
	}else return newWord;
}

genderize.toNounFemale = function(word){
	return toGender(word, [...maleLivingNoun, ...neutralLivingNoun], "toFemale");
};
genderize.toNounMale = function(word){
	return toGender(word, [...neutralLivingNoun, ...femaleLivingNoun], "toMale");
};
genderize.toNounNeutral = function(word){
	return toGender(word, [...maleLivingNoun, ...femaleLivingNoun], "toNeutral");
};

genderize.toProfessionFemale = function(word){
	return toGender(word, [...maleProfessionNouns, ...neutralProfessionNouns], "toFemale");
};
genderize.toProfessionMale = function(word){
	return toGender(word, [...neutralProfessionNouns, ...femaleProfessionNouns], "toMale");
};
genderize.toProfessionNeutral = function(word){
	return toGender(word, [...maleProfessionNouns, ...femaleProfessionNouns], "toNeutral");
};


module.exports = genderize;