const transformer = require('./_transformer');
//const Entities = require('../Entities');

const EntitySchema = {
	_id: {
		type: "string",
		$filter: "uuid",
		mainIndex: true,
		_$label: "quotaToken",
		_$displayAs: "text",
	}, 
	user: {
		type: "string",
		$filter: "uuid",
		required: "quotaInsertRequired",
		insertable: true,
		insertRequired: true,
		searchable: true,
		//linkedWith: Entities.User
	}, 
	valid: {
		type: "boolean",
		$filter: "boolean",
		searchable: true,
		updateable: true,
		_$label: "quotaValid",
		_$inputType: "select",
		_$displayAs: "boolean",
		_$options: [
			{value: true, option: "yes"},
			{value: false, option: "no"}
		]
	},
	restante: {
		type: "number",
		_$label: "quotaRestante",
		_$displayAs: "text", 
	}, 
	total: {
		type: "integer",
		$filter: "integer",
		required: "quotaTotalRequired",
		minimum: 1, 
		insertable: true,
		insertRequired: true,
		searchable: true,
		updateable: true,
		_$label: "quotaTotal",
		_$inputType: "integer",
		_$displayAs: "text",
	}, 
	reset: {
		type: "integer",
		$filter: "integer",
		required: "quotaResetRequired",
		minimum: 1, 
		insertable: true,
		insertRequired: true,
		searchable: true,
		updateable: true,
		_$label: "quotaReset",
		_$inputType: "integer",
		_$displayAs: "text",
	}, 
	created: {
		type: "integer",
		_$label: "quotaCreated",
		_$displayAs: "date"
	}, 
	lastUsed: {
		type: "integer",
		_$label: "quotaLastUsed",
		_$displayAs: "date"
	}, 
	validUntil: {
		type: "integer",
		_$label: "quotaValidUntil",
		_$displayAs: "date"
	}, 
	lastReset: {
		type: "integer",
		_$label: "quotaLastReset",
		_$displayAs: "date"
	}, 
	lastUpdate: {
		type: "integer",
		_$label: "quotaLastUpdate",
		_$displayAs: "date"
	}
};

const InsertSchema = transformer.create({...EntitySchema});
const UpdateSchema = transformer.update({...EntitySchema});
const RemoveSchema = transformer.remove({...EntitySchema});
const GetSchema = transformer.get({...EntitySchema});
const RetrieveSchema = transformer.retrieve({...EntitySchema});

module.exports = {
	EntitySchema : {...EntitySchema},
	InsertSchema : InsertSchema,
	UpdateSchema : UpdateSchema,
	RemoveSchema : RemoveSchema,
	GetSchema : GetSchema,
	RetrieveSchema : RetrieveSchema
};