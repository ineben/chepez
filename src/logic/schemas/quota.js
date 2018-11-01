const transformer = require('./transformer');
const Entities = require('../Entities');

const EntitySchema = {
	_id: {
		type: "string",
		$filter: "uuid",
		mainIndex: true,
	}, 
	user: {
		type: "string",
		$filter: "uuid",
		required: "quotaInsertRequired",
		insertable: true,
		insertRequired: true,
		searchable: true,
		linkedWith: Entities.User
	}, 
	valid: {
		type: "boolean",
		$filter: "boolean",
		searchable: true,
		updateable: true
	},
	restante: {
		type: "number", 
	}, 
	total: {
		type: "integer",
		$filter: "integer",
		required: "quotaTotalRequired",
		minimum: 1, 
		insertable: true,
		insertRequired: true,
		searchable: true,
		updateable: true
	}, 
	reset: {
		type: "integer",
		$filter: "integer",
		required: "quotaResetRequired",
		minimum: 1, 
		insertable: true,
		insertRequired: true,
		searchable: true,
		updateable: true
	}, 
	created: {
		type: "integer"
	}, 
	lastUsed: {
		type: "integer"
	}, 
	validUntil: {
		type: "integer"
	}, 
	lastReset: {
		type: "integer"
	}, 
	lastUpdate: {
		type: "integer"
	}
};

const InsertSchema = transformer.create(EntitySchema);
const UpdateSchema = transformer.update(EntitySchema);
const UpdateSelfSchema = transformer.updateSelf(EntitySchema);
const RemoveSchema = transformer.remove(EntitySchema);
const GetSchema = transformer.get(EntitySchema);
const RetrieveSchema = transformer.retrieve(EntitySchema);

module.exports = {
	EntitySchema : {...EntitySchema},
	InsertSchema : {...InsertSchema},
	UpdateSchema : {...UpdateSchema},
	UpdateSelfSchema : {...UpdateSelfSchema},
	RemoveSchema : {...RemoveSchema},
	GetSchema : {...GetSchema},
	RetrieveSchema : {...RetrieveSchema}
};