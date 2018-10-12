const maleArticleRules = [
	[/^el$/i, {
		toNeutral: "elle",
		toFemale: "la"
	}],
	[/(ell|aquell|est)([o]{1})(s)?/i, {
		toNeutral: "$1e$3",
		toFemale: "$1a$2"
	}],
	[/(l)(o)(s)/i, {
		toNeutral: "$1e$3",
		toFemale: "$1a$3"
	}],
];

const femaleArticleRules = [
	[/^la$/i, {
		toNeutral: "elle",
		toMale: "el"
	}],
	[/(ell|aquell|est)([a]{1})(s)?/i, {
		toNeutral: "$1e$3",
		toMale: "$1o$3"
	}],
	[/(l)(a)(s)?/i, {
		toNeutral: "$1e$3",
		toMale: "$1o$3"
	}],
];

const neutralArticleRules = [
	[/(ell|aquell|est)(e|x|@){1}(s)?/i, {
		toFemale: "$1a$3",
		toMale: "$1o$3"
	}],
	[/(l)(e|x|@)(s)/i, {
		toFemale: "$1a$3",
		toMale: "$1o$3"
	}],
];

const globalArticleRules = [
		[/^mis?$/],
		...maleArticleRules,
		...femaleArticleRules,
		...neutralArticleRules
];

function articleInferGender(rules){
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

const articleze = {};

articleze.isArticle = function(word){
	let i = globalArticleRules.length;
	while(i--){
		const rule = globalArticleRules[i];
		if(rule[0].test(word)){
			return true;
		}
	}
};

articleze.articleIsMale = articleInferGender(maleArticleRules);

articleze.articleIsFemale = articleInferGender(femaleArticleRules);

articleze.articleIsNeutral = articleInferGender(neutralArticleRules);

function toGender(word, rules, gender){
	if(!articleze.isArticle(word)) return word;
	let length = rules.length;
	while(length--){
		const rule = rules[length];
		if(rule[0].test(word)){
			return word.replace(rule[0], rule[1][gender]);
		}
	}
	return word;
};

articleze.toFemale = function(word){
	return toGender(word, [...maleArticleRules, ...neutralArticleRules], "toFemale");
};
articleze.toMale = function(word){
	return toGender(word, [...neutralArticleRules, ...femaleArticleRules], "toMale");
};
articleze.toNeutral = function(word){
	return toGender(word, [...maleArticleRules, ...femaleArticleRules], "toNeutral");
};
module.exports = articleze;