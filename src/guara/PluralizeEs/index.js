const pluralRules = [];
const singularRules = [];
const uncountables = {};
const irregularPlurals = {};
const irregularSingles = {};


function sanitizeRule(rule){
	if (typeof rule === 'string') {
		return new RegExp('^' + rule + '$', 'i');
	}
	return rule;
}

/**
 * Pass in a word token to produce a function that can replicate the case on
 * another word.
 *
 * @param	{string}	 word
 * @param	{string}	 token
 * @return {Function}
 */
function restoreCase(word, token){
	// Tokens are an exact match.
	if (word === token) return token;

	// Upper cased words. E.g. "HELLO".
	if (word === word.toUpperCase()) return token.toUpperCase();

	// Title cased words. E.g. "Title".
	if (word[0] === word[0].toUpperCase()) {
		return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase();
	}

	// Lower cased words. E.g. "test".
	return token.toLowerCase();
}

/**
 * Interpolate a regexp string.
 *
 * @param	{string} str
 * @param	{Array}	args
 * @return {string}
 */
function interpolate(str, args){
	return str.replace(/\$(\d{1,2})/g, (match, index) => {
		return args[index] || '';
	});
}

/**
 * Replace a word using a rule.
 *
 * @param	{string} word
 * @param	{Array}	rule
 * @return {string}
 */
function replace(word, rule){
	return word.replace(rule[0], function(match, index){
		var result = interpolate(rule[1], arguments);

		if (match === '') {
			return restoreCase(word[index - 1], result);
		}

		return restoreCase(match, result);
	});
}

/**
 * Sanitize a word by passing in the word and sanitization rules.
 *
 * @param	{string}	 token
 * @param	{string}	 word
 * @param	{Array}		rules
 * @return {string}
 */
function sanitizeWord(token, word, rules){
	
	// Empty string or doesn't need fixing.
	if (!token.length || uncountables.hasOwnProperty(token)) {
		return word;
	}

	var len = rules.length;

	// Iterate over the sanitization rules and use the first one to match.
	while (len--) {
		var rule = rules[len];
		if (rule[0].test(word)) {
			return replace(word, rule);
		}
	}	
	
	return word;
}

/**
 * Replace a word with the updated word.
 *
 * @param	{Object}	 replaceMap
 * @param	{Object}	 keepMap
 * @param	{Array}		rules
 * @return {Function}
 */
function replaceWord(replaceMap, keepMap, rules){
	return function(word){
		if(!word) return word;
		// Get the correct token and case restoration functions.
		var token = word.toLowerCase();

		// Check against the keep object map.
		if (keepMap.hasOwnProperty(token)) {
			return restoreCase(word, token);
		}

		// Check against the replacement map for a direct word replacement.
		if (replaceMap.hasOwnProperty(token)) {
			return restoreCase(word, replaceMap[token]);
		}
		
		// Run all the rules against the word.
		
		let r = sanitizeWord(token, word, rules);
		return r;
	};
}

/**
 * Check if a word is part of the map.
 */
function checkWord(replaceMap, keepMap, rules, bool){
	return function(word){
		if(!word) return word;
		var token = word.toLowerCase();

		if (keepMap.hasOwnProperty(token)) return true;
		if (replaceMap.hasOwnProperty(token)) return false;

		return sanitizeWord(token, token, rules) === token;
	};
}

/**
 * Pluralize or singularize a word based on the passed in count.
 *
 * @param	{string}	word
 * @param	{number}	count
 * @param	{boolean} inclusive
 * @return {string}
 */
function pluralize(word, count, inclusive){
	const pluralized = count === 1 ? 
		pluralize.singular(word) : 
		pluralize.plural(word);

	return (inclusive ? count + ' ' : '') + pluralized;
}

/**
 * Pluralize a word.
 *
 * @type {Function}
 */
pluralize.plural = replaceWord(
	irregularSingles, irregularPlurals, pluralRules
);

/**
 * Check if a word is plural.
 *
 * @type {Function}
 */
pluralize.isPlural = checkWord(
	irregularSingles, irregularPlurals, pluralRules
);

/**
 * Singularize a word.
 *
 * @type {Function}
 */
pluralize.singular = replaceWord(
	irregularPlurals, irregularSingles, singularRules
);

/**
 * Check if a word is singular.
 *
 * @type {Function}
 */
pluralize.isSingular = checkWord(
	irregularPlurals, irregularSingles, singularRules
);

/**
 * Add a pluralization rule to the collection.
 *
 * @param {(string|RegExp)} rule
 * @param {string}					replacement
 */
pluralize.addPluralRule = function(rule, replacement){
	pluralRules.push([sanitizeRule(rule), replacement]);
};

/**
 * Add a singularization rule to the collection.
 *
 * @param {(string|RegExp)} rule
 * @param {string}					replacement
 */
pluralize.addSingularRule = function(rule, replacement){
	singularRules.push([sanitizeRule(rule), replacement]);
};

/**
 * Add an uncountable word rule.
 *
 * @param {(string|RegExp)} word
 */
pluralize.addUncountableRule = function(word){
	if (typeof word === 'string') {
		uncountables[word.toLowerCase()] = true;
		return;
	}

	// Set singular and plural references for the word.
	pluralize.addPluralRule(word, '$0');
	pluralize.addSingularRule(word, '$0');
};

/**
 * Add an irregular word definition.
 *
 * @param {string} single
 * @param {string} plural
 */
pluralize.addIrregularRule = function(single, plural){
	plural = plural.toLowerCase();
	single = single.toLowerCase();

	irregularSingles[single] = plural;
	irregularPlurals[plural] = single;
};

/**
 * Irregular rules.
 */
[
	['él', 'ellos'],
	['el', 'los'],
	['élla', 'ellas'],
	['la', 'las'],
	['esta', 'estas'],
	['esto', 'estos'],
	['este', 'estes'],
].forEach( function(rule){
	return pluralize.addIrregularRule(rule[0], rule[1]);
});

/**
 * Pluralization rules.
 */
[
	[/([áéíóúña-z]{1,}[áéíóúaeiou]$)/i, '$1s'],
	[/([áéíóúña-z]{1,}[wrtpdfhjkcvbnm]$)/i, '$1es'],
	[/([áéíóúña-z]{1,})z$/i, '$1ces'],
	[/([áéíóúña-z]{1,}g)$/i, '$1ues'],
	[/([áéíóúña-z]{1,})c$/i, '$1ques'],
].forEach( function(rule){
	return pluralize.addPluralRule(rule[0], rule[1]);
});

/**
 * Singularization rules.
 * Desde abajo hacia arriba la mas excluyente
 */
[
	[/([áéíóúña-z]{1,})s$/i, '$1'],
	[/([áéíóúña-z]{1,})es$/i, '$1'],
	[/([áéíóúña-z]{1,})ces$/i, '$1z'],
	[/([áéíóúña-z]{1,}g)ues$/i, '$1'],
	[/([áéíóúña-z]{1,})ques$/i, '$1c']
].forEach( function(rule){
	return pluralize.addSingularRule(rule[0], rule[1]);
});

/**
 * Uncountable rules.
 */
[
	'alcohol',
	'análisis',
	'lunes',
	'martes',
	'miércoles',
	'jueves',
	'viernes',
	'haber',
	'audio',
	'imprimir',
	'tu',
	'yo',
	'es'
].forEach(pluralize.addUncountableRule);


module.exports = {restoreCase, pluralize};
