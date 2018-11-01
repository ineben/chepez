const transformer = require('./transformer');

const sinonimSchema = {
	_id: {
		type: "string",
		$filter: "uuid"
	},
	region: {
		type: "integer",
		$filter: "integer",
		insertable: true,
		updateable: true,
		insertRequired: true
	},
	grado: {
		type: "integer",
		$filter: "integer",
		insertable: true,
		updateable: true,
		insertRequired: true
	},				
	palabra: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		insertRequired: true
	}, 
	female: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true
	}, 
	neutral: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true
	}, 
	plural: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true
	}
};

const EntitySchema = {
	_id: {
		type: "string",
		$filter: "uuid",
		mainIndex: true,
	}, 
	base: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		insertRequired: true,
		searchable: true
	}, 
	femenine: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		searchable: true
	}, 
	neutral: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		searchable: true
	}, 
	plural: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		searchable: true
	}, 
	type: {
		type: "string",
		$filter: "string",
		insertable: true,
		updateable: true,
		insertRequired: true,
		searchable: true
	}, 
	living: {
		type: "boolean",
		$filter: "boolean",
		insertable: true,
		updateable: true,
		searchable: true
	}, 
	profession: {
		type: "boolean",
		$filter: "boolean",
		insertable: true,
		updateable: true,
		searchable: true
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

const InsertSchema = transformer.create(EntitySchema);
const UpdateSchema = transformer.update(EntitySchema);
//const UpdateSelfSchema = transformer.updateSelf(EntitySchema);
const RemoveSchema = transformer.remove(EntitySchema);
const GetSchema = transformer.get(EntitySchema);
const RetrieveSchema = transformer.retrieve(EntitySchema);

const InsertSinonimSchema = transformer.create(sinonimSchema, {
	type: "object",
	additionalProperties: false,
	properties : {
		word: {
			type: "string", 
			pattern: "^[0-9a-zA-Z-]{1,}$"
		}
	}
});
const UpdateSinonimSchema = transformer.update(sinonimSchema, {
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

const RemoveSinonimSchema = transformer.remove(sinonimSchema, {
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
	InsertSinonimSchema : {...InsertSinonimSchema},
	UpdateSinonimSchema : {...UpdateSinonimSchema},
	RemoveSinonimSchema : {...RemoveSinonimSchema},
	EntitySchema : {...EntitySchema},
	InsertSchema : {...InsertSchema},
	UpdateSchema : {...UpdateSchema},
	//UpdateSelfSchema : {...UpdateSelfSchema},
	RemoveSchema : {...RemoveSchema},
	GetSchema : {...GetSchema},
	RetrieveSchema : {...RetrieveSchema}
};