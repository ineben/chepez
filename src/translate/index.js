const {restoreCase, pluralize} = require("./PluralizeEs");
const steed = require("./Steedz")();

const staticDictionary = [
	{
		base: "joven",
		sinonimos: [
			{
				region: 1,
				palabra: "pibe",
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
				grado: 3
			},
			{
				region: 2,
				palabra: "carajo",
				grado: 4
			}
		]
	},
	{
		base: "feo",
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
		
		if(dic.base == word)
			found = true;
		else{
			for(const sinonim of dic.sinonimos){
				if(sinonim.palabra == word){
					if(this.fromRegion !== undefined){
						found = this.fromRegion == sinonim.region;
					}else
						found = true
				}
			}
		}
		
		if(found){
			reWord = {palabra: dic.base, plural: dic.basePural};
			for(const sinonim of dic.sinonimos){
				if(sinonim.region == this.toRegion){
					if(this.toGrade !== undefined){
						if(this.toGrade == sinonim.grade){							
							reWord = sinonim;
							break;
						}else{
							const dif = Math.abs(this.toGrade - sinonim.grade);
							if(currentGrade === null || dif < currentGrade){
								reWord = sinonim;
							}
						}
					}else{
						reWord = sinonim;
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
		
		const formatedWords = await steed.parallel(new WordState(result, toRegion, fromRegion, toGrade), orders);
		for(let key in formatedWords){
			if(formatedWords[key] == null)
				delete formatedWords[key];
		}
		resolve(formatedWords);
	});
};

const translate = async (query, toRegion, toGrade, fromRegion) => {
	return new Promise( (resolve, reject) => {
		
		const workableQuery = query
			.toLowerCase()
			.replace("  ", " ")
			.replace(/[^a-z\s]/gi, '');
			
		let words = [...new Set(workableQuery.split(" "))];
		
		words.forEach( (word, i) => {
			if(!pluralize.isSingular(word)){
				word = pluralize.singular(word);
			}
			words[i] = word;
		});

		words = [...new Set(words)];
		
		getWords(words, toRegion, fromRegion, toGrade)
		.then( (translatedWords) => {
			const oldPhrase = query.split(" "), newPhrase = [];
			for(const word of oldPhrase){
				let keyword = word.toLowerCase();
				const isPlural = pluralize.isPlural(keyword);
				if(isPlural){
					keyword = pluralize.singular(keyword);
				}
				
				if(translatedWords.hasOwnProperty(keyword)){
					let replaceWord = translatedWords[keyword].palabra;
					if(isPlural){
						if(translatedWords[keyword].plural)
							replaceWord = translatedWords[keyword].plural;
						else
							replaceWord = pluralize.plural(replaceWord);
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