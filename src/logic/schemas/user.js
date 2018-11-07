const transformer = require('./_transformer');

const EntitySchema = {
	_id: {
		type: "string",
		$filter: "uuid",
		_$label: "id",
		_$displayAs: "text",
		mainIndex: true,
	}, 
	password: {
		type: "string",
		$filter: "string",
		required: "userPasswordRequired",
		minLength: 8,
		insertable: true,
		insertRequired: true,
		updateable: true,
		selfUpdateable: true,
		private: true,
		_$label: "userPassword",
		_$inputType: "password",
	}, 
	email: {
		type: "string", 
		$filter: "string",
		required: "userEmailRequired",
		inline : true,
		insertable: true,
		insertRequired: true,
		searchable: true,
		updateable: true,
		selfUpdateable: true,
		toLowerCase: true,
		_$label: "userEmail",
		_$displayAs: "text",
		_$inputType: "email",
		pattern: /^((?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]))$/
	}, 
	priv: {
		type: "integer",
		$filter: "integer",
		required: "userPrivRequired",
		minimum: 1.0, 
		maximum: 3.0,
		insertable: true,
		insertRequired: true,
		searchable: true,
		updateable: true,
		_$label: "userPriv",
		_$displayAs: "select",
		_$inputType: "select",
		_$options: [
			{value: 1, option: "userPrivAdmin"},
			{value: 2, option: "userPrivUser"}
		],
	},	
	created: {
		type: "integer",
		_$label: "userCreated",
		_$displayAs: "date"
	}, 
	lastOnline: {
		type: "integer",
		_$label: "userLastOnline",
		_$displayAs: "date"
	}, 
	lastUpdate: {
		type: "integer",
		_$label: "userLastUpdate",
		_$displayAs: "date"
	}, 
	issuedAfter: {
		type: "integer",
		private: true
	}
};

const InsertSchema = transformer.create({...EntitySchema});
const UpdateSchema = transformer.update({...EntitySchema});
const UpdateSelfSchema = transformer.updateSelf({...EntitySchema});
const RemoveSchema = transformer.remove({...EntitySchema});
const GetSchema = transformer.get({...EntitySchema});
const RetrieveSchema = transformer.retrieve({...EntitySchema});

module.exports = {
	EntitySchema : {...EntitySchema},
	InsertSchema : InsertSchema,
	UpdateSchema : UpdateSchema,
	UpdateSelfSchema : UpdateSelfSchema,
	RemoveSchema : RemoveSchema,
	GetSchema : GetSchema,
	RetrieveSchema : RetrieveSchema
};