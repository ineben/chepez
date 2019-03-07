const transformer = require('./_transformer');

const sentimentCondition = function(model){
	return model.type == 2 || model.type == 3;
};

const entityCondition = function(model){
	return model.type == 5;
};

const adverbCondition = function(model){
	return model.type == 4;
};

const verbCondition = function(model){
	return model.type == 2;
};

const sustantiveCondition = function(model){
	return model.type == 1;
};

const femaleAndNeutralCondition = function(model){
	return model.type == 3 || (model.sustantiveType == 1 || model.sustantiveType == 2);
};

const genderedCondition = function(model){
	return model.type == 3 || model.type == 1;
};

const neutralDisabledCondition = function(model){
	if(model.type == 3) return false;
	
	return model.sustantiveType != 1 && model.sustantiveType != 2;
}

const pluralCondition = function(model){
	return model.type == 1 || model.type == 3;
};

const baseCondition = function(model){
	return model.type != 1 || (model.sustantiveType == 1 || model.sustantiveType == 2);
};

const pluralBaseCondition = function(model){
	if(model.type == 3) return true;
	
	if(model.sustantiveType != 3 && 
		model.sustantiveType != 4 && 
		model.sustantiveType != 9 &&
		model.sustantiveType != 10){
		
		return model.base != "" && model.base != null;
		
	}else return false;
};

const pluralMaleCondition = function(model){
	if(model.type == 3) return true;
	
	if(model.sustantiveType != 3 && 
		model.sustantiveType != 4 && 
		model.sustantiveType != 9 &&
		model.sustantiveType != 10){
		
		return model.palabra != "" && model.palabra != null;
		
	}else return false;
};

const pluralFemaleCondition = function(model){
	if(model.type == 3) return true;
	
	if(model.sustantiveType != 3 && 
		model.sustantiveType != 4 && 
		model.sustantiveType != 9 &&
		model.sustantiveType != 10){
		
		return model.female != "" && model.female != null;
		
	}else return false;
};

const disablePluralCondition = function(model){
	return model.sustantiveType == 3 || 
		model.sustantiveType == 4 ||
		model.sustantiveType == 9 || 
		model.sustantiveType == 10;
};

const pluralNeutralCondition = function(model){
	if(model.type == 3) return true;
	
	if(model.sustantiveType != 3 && 
		model.sustantiveType != 4 && 
		model.sustantiveType != 9 &&
		model.sustantiveType != 10){
		
		return model.neutral != "" && model.neutral != null;
		
	}else return false;
};

const sinonimSchema = {
	_id: {
		type: "string",
		_$displayAs: "text",
		_$label: "id",
		$filter: "uuid"
	},
	region: {
		type: "integer",
		$filter: "integer",
		insertable: true,
		updateable: true,
		insertRequired: true,
		_$label: "docRegion",
		_$displayAs: "select",
		_$inputType: "select",
		_$options: [
			{value: 1, option: "argentina"},
			{value: 2, option: "bolivia"},
			{value: 3, option: "chile"},
			{value: 4, option: "colombia"},
			{value: 5, option: "costaRica"},
			{value: 6, option: "cuba"},
			{value: 7, option: "ecuador"},
			{value: 8, option: "elSalvador"},
			{value: 9, option: "espana"},
			{value: 10, option: "guatemala"},
			{value: 11, option: "honduras"},
			{value: 12, option: "mexico"},
			{value: 13, option: "nicaragua"},
			{value: 14, option: "panama"},
			{value: 15, option: "paraguay"},
			{value: 16, option: "peru"},
			{value: 17, option: "puertoRico"},
			{value: 18, option: "repubicaDominicana"},
			{value: 19, option: "uruguay"},
			{value: 20, option: "venezuela"}
		],
	},
	grado: {
		type: "integer",
		$filter: "integer",
		insertable: true,
		updateable: true,
		insertRequired: true,
		_$label: "docGrado",
		_$inputType: "select",
		_$displayAs: "select",
		_$options: [
			{value: 1, option: "docGradoFormal"},
			{value: 2, option: "docGradoCasual"},
			{value: 3, option: "docGradoInformal"},
			{value: 4, option: "docGradoVeryInformal"}
		],
	},				
	palabra: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		toLowerCase: true,
		_$requiredCondition: baseCondition,
		_$label: "docPalabra",
		_$displayAs: "text",
		_$inputType: "text",
	}, 
	plural: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		toLowerCase: true,
		_$conditional: pluralCondition,
		_$disabledCondition: disablePluralCondition,
		_$requiredCondition: pluralMaleCondition,
		_$label: "docPlural",
		_$displayAs: "text",
		_$inputType: "text",
	}, 
	gerundio: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		searchable: true,
		toLowerCase: true,
		_$conditional: verbCondition,
		_$label: "docGerundio",
		_$displayAs: "text",
		_$inputType: "text",
	}, 
	participio: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		searchable: true,
		toLowerCase: true,
		_$conditional: verbCondition,
		_$label: "docParticipio",
		_$displayAs: "text",
		_$inputType: "text",
	}, 
	female: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		toLowerCase: true,
		_$conditional: genderedCondition,
		_$requiredCondition: femaleAndNeutralCondition,
		_$label: "docFemale",
		_$displayAs: "text",
		_$inputType: "text",
	}, 
	pluralFemale: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		toLowerCase: true,
		_$conditional: genderedCondition,
		_$disabledCondition: disablePluralCondition,
		_$requiredCondition: pluralFemaleCondition,
		_$label: "docPluralFemale",
		_$displayAs: "text",
		_$inputType: "text",
	}, 
	neutral: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		toLowerCase: true,
		_$conditional: genderedCondition,
		_$requiredCondition: femaleAndNeutralCondition,
		_$label: "docNeutral",
		_$displayAs: "text",
		_$inputType: "text",
	}, 
	pluralNeutral: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		toLowerCase: true,
		_$conditional: genderedCondition,
		_$disabledCondition: disablePluralCondition,
		_$requiredCondition: pluralNeutralCondition,
		_$label: "docPluralNeutral",
		_$displayAs: "text",
		_$inputType: "text",
	}
};

const EntitySchema = {
	_id: {
		type: "string",
		$filter: "uuid",
		_$label: "id",
		_$displayAs: "text",
		mainIndex: true,
	},
	
	adverbType: { //https://www.practicaespanol.com/los-adverbios-de-tiempo-lugar-modo-cantidad/
		type: "integer",
		$filter: "integer",
		insertable: true,
		updateable: true,
		searchable: true,
		_$conditional: adverbCondition,
		_$requiredCondition: () => { return true; },
		_$label: "docAdverbType",
		_$inputType: "select",
		_$displayAs: "select",
		_$options: [
			{value: 1, option: "docAdverbTypeTime"}, //faClock
			{value: 2, option: "docAdverbTypePlace"}, //faMapMarker
			{value: 3, option: "docAdverbTypeMode"}, //M
			{value: 4, option: "docAdverbTypeQuantity"}, //C
			{value: 5, option: "docAdverbTypeAfirmation"}, //faCheck
			{value: 6, option: "docAdverbTypeNegation"}, //faTimes
			{value: 7, option: "docAdverbTypeDoubt"}, //faQuestion
			{value: 8, option: "docAdverbTypeExclusion"}, //faPlus
			{value: 9, option: "docAdverbTypeInclusion"} //faMinus
		],
	}, 
	sustantiveType: { 
		type: "integer",
		$filter: "integer",
		insertable: true,
		updateable: true,
		searchable: true,
		_$conditional: sustantiveCondition,
		_$requiredCondition: () => { return true; },
		_$label: "docSustantiveType",
		_$inputType: "select",
		_$displayAs: "select",
		_$options: [
			{value: 1, option: "docSustantiveTypeHuman"}, //faMale
			{value: 2, option: "docSustantiveTypeProfession"}, //faUserAstronaut
			{value: 3, option: "docSustantiveTypeName"}, //N
			{value: 4, option: "docSustantiveTypeLastname"}, //A
			{value: 5, option: "docSustantiveTypeAnimal"}, //faPaw
			{value: 6, option: "docSustantiveTypeInnanimateObject"}, //faChair 
			{value: 7, option: "docSustantiveTypeIdea"}, //faLightbulb
			{value: 8, option: "docSustantiveTypePlace"}, //faHome
			{value: 9, option: "docSustantiveTypeGeographicPlace"}, //faMapMarker
			{value: 10, option: "docSustantiveTypeBrand"} //faApple
		],
	}, 
	sentiment: {
		type: "integer",
		$filter: "integer",
		insertable: true,
		updateable: true,
		searchable: true,
		_$conditional: sentimentCondition,
		insertRequired: true,
		_$label: "docSentiment",
		_$inputType: "select",
		_$displayAs: "select",
		_$options: [
			{value: 0, option: "docSentimentNeutral"},
			{value: 1, option: "docSentimentSlightlyPositive"},
			{value: 2, option: "docSentimentSomewhatPositive"},
			{value: 3, option: "docSentimentPositive"},
			{value: 4, option: "docSentimentVeryPositive"},
			{value: 5, option: "docSentimentExtremlyPositive"},
			{value: -1, option: "docSentimentSlightlyNegative"},
			{value: -2, option: "docSentimentSomewhatNegative"},
			{value: -3, option: "docSentimentNegative"},
			{value: -4, option: "docSentimentVeryNegative"},
			{value: -5, option: "docSentimentExtremlyNegative"}
		],
	},
	base: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		searchable: true,
		toLowerCase: true,
		_$requiredCondition: baseCondition,
		_$label: "docPalabra",
		_$displayAs: "text",
		_$inputType: "text",
	}, 
	plural: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		searchable: true,
		toLowerCase: true,
		_$conditional: pluralCondition,
		_$disabledCondition: disablePluralCondition,
		_$requiredCondition: pluralBaseCondition,
		_$label: "docPlural",
		_$displayAs: "text",
		_$inputType: "text",
	}, 
	gerundio: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		searchable: true,
		toLowerCase: true,
		_$conditional: verbCondition,
		_$requiredCondition: verbCondition,
		_$label: "docGerundio",
		_$displayAs: "text",
		_$inputType: "text",
	}, 
	participio: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		searchable: true,
		toLowerCase: true,
		_$conditional: verbCondition,
		_$requiredCondition: verbCondition,
		_$label: "docParticipio",
		_$displayAs: "text",
		_$inputType: "text",
	}, 
	female: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		searchable: true,
		toLowerCase: true,
		_$conditional: genderedCondition,
		_$requiredCondition: femaleAndNeutralCondition,
		_$label: "docFemale",
		_$displayAs: "text",
		_$inputType: "text",
	}, 
	pluralFemale: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		searchable: true,
		toLowerCase: true,
		_$conditional: genderedCondition,
		_$disabledCondition: disablePluralCondition,
		_$requiredCondition: pluralFemaleCondition,
		_$label: "docPluralFemale",
		_$displayAs: "text",
		_$inputType: "text",
	}, 
	neutral: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		searchable: true,
		toLowerCase: true,
		_$conditional: genderedCondition,
		_$disabledCondition: neutralDisabledCondition,
		_$requiredCondition: femaleAndNeutralCondition,
		_$label: "docNeutral",
		_$displayAs: "text",
		_$inputType: "text",
	}, 
	pluralNeutral: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		searchable: true,
		toLowerCase: true,
		_$conditional: genderedCondition,
		_$disabledCondition: disablePluralCondition,
		_$requiredCondition: pluralNeutralCondition,
		_$label: "docPluralNeutral",
		_$displayAs: "text",
		_$inputType: "text",
	},
	type: {
		type: "integer",
		$filter: "integer",
		insertable: true,
		updateable: true,
		insertRequired: true,
		searchable: true,
		_$label: "docType",
		_$inputType: "select",
		_$displayAs: "select",
		_$options: [
			{value: 1, option: "docTypeNoun"},
			{value: 2, option: "docTypeVerb"},
			{value: 3, option: "docTypeAdjetive"},
			{value: 4, option: "docTypeAdverb"},
			{value: 7, option: "docTypeArticle"},
		],
	},
	created: {
		type: "integer"
	}, 
	lastUsed: {
		type: "integer"
	}, 
	lastUpdate: {
		type: "integer"
	},
	sinonimos: {
		type: "array",
		$filter: "array",
		items: {
			type: "object",
			properties: {
				...sinonimSchema
			}
		}
	}
};

const InsertSchema = transformer.create({...EntitySchema});
const InsertBulkSchema = transformer.createBulk({...EntitySchema});
const UpdateSchema = transformer.update({...EntitySchema});
const RemoveSchema = transformer.remove({...EntitySchema});
const GetSchema = transformer.get({...EntitySchema});
const RetrieveSchema = transformer.retrieve({...EntitySchema});

const InsertBulkSinonimSchema = transformer.createBulk({...sinonimSchema}, {
	type: "object",
	additionalProperties: false,
	properties : {
		word: {
			type: "string", 
			pattern: "^[0-9a-zA-Z-]{1,}$"
		}
	}
});
const InsertSinonimSchema = transformer.create({...sinonimSchema}, {
	type: "object",
	additionalProperties: false,
	properties : {
		word: {
			type: "string", 
			pattern: "^[0-9a-zA-Z-]{1,}$"
		}
	}
});

const UpdateSinonimSchema = transformer.update({...sinonimSchema}, {
	type: "object",
	additionalProperties: false,
	properties : {
		id: {
			type: "string", 
			pattern: "^[0-9a-zA-Z-]{1,}$"
		},
		word: {
			type: "string", 
			pattern: "^[0-9a-zA-Z-]{1,}$"
		}
	}
});
const RemoveSinonimSchema = transformer.remove({...sinonimSchema}, {
	type: "object",
	additionalProperties: false,
	properties : {
		id: {
			type: "string", 
			pattern: "^[0-9a-zA-Z-]{1,}$"
		},
		word: {
			type: "string", 
			pattern: "^[0-9a-zA-Z-]{1,}$"
		}
	}
});

module.exports = {
	sinonimSchema : {...sinonimSchema},
	InsertSinonimSchema : InsertSinonimSchema,
	InsertBulkSinonimSchema : InsertBulkSinonimSchema,
	UpdateSinonimSchema : UpdateSinonimSchema,
	RemoveSinonimSchema : RemoveSinonimSchema,
	
	EntitySchema : {...EntitySchema},
	InsertSchema : InsertSchema,
	InsertBulkSchema: InsertBulkSchema,
	UpdateSchema : UpdateSchema,
	RemoveSchema : RemoveSchema,
	GetSchema : GetSchema,
	RetrieveSchema : RetrieveSchema
};