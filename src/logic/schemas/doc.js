const transformer = require('./_transformer');

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
		insertRequired: true,
		_$label: "docPalabra",
		_$displayAs: "text",
		_$inputType: "text",
	}, 
	female: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		_$label: "docFemale",
		_$displayAs: "text",
		_$inputType: "text",
	}, 
	neutral: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		_$label: "docNeutral",
		_$displayAs: "text",
		_$inputType: "text",
	}, 
	plural: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		_$label: "docPlural",
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
	base: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		insertRequired: true,
		searchable: true,
		_$label: "docPalabra",
		_$displayAs: "text",
		_$inputType: "text",
	}, 
	female: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		searchable: true,
		_$label: "docFemale",
		_$displayAs: "text",
		_$inputType: "text",
	}, 
	neutral: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		searchable: true,
		_$label: "docNeutral",
		_$displayAs: "text",
		_$inputType: "text",
	}, 
	plural: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		searchable: true,
		_$label: "docPlural",
		_$displayAs: "text",
		_$inputType: "text",
	}, 
	type: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		insertRequired: true,
		searchable: true,
		_$label: "docType",
		_$inputType: "select",
		_$displayAs: "select",
		_$options: [
			{value: "sujeto", option: "docTypeNoun"},
			{value: "verbo", option: "docTypeVerb"},
			{value: "adjetivo", option: "docTypeAdjetive"},
			{value: "adjverbio", option: "docTypeAdverb"},
		],
	}, 
	living: {
		type: "boolean",
		$filter: "boolean",
		insertable: true,
		updateable: true,
		searchable: true,
		_$label: "docLiving",
		_$inputType: "select",
		_$displayAs: "boolean",
		_$options: [
			{value: true, option: "yes"},
			{value: false, option: "no"}
		],
	}, 
	profession: {
		type: "boolean",
		$filter: "boolean",
		insertable: true,
		updateable: true,
		searchable: true,
		_$label: "docProfession",
		_$inputType: "select",
		_$displayAs: "boolean",
		_$options: [
			{value: true, option: "yes"},
			{value: false, option: "no"}
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
const UpdateSchema = transformer.update({...EntitySchema});
const RemoveSchema = transformer.remove({...EntitySchema});
const GetSchema = transformer.get({...EntitySchema});
const RetrieveSchema = transformer.retrieve({...EntitySchema});

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
	UpdateSinonimSchema : UpdateSinonimSchema,
	RemoveSinonimSchema : RemoveSinonimSchema,
	
	EntitySchema : {...EntitySchema},
	InsertSchema : InsertSchema,
	UpdateSchema : UpdateSchema,
	RemoveSchema : RemoveSchema,
	GetSchema : GetSchema,
	RetrieveSchema : RetrieveSchema
};