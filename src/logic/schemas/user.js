const transformer = require('./_transformer');

const EntitySchema = {
	_id: {
		type: "string",
		$filter: "uuid",
		_$label: "id",
		_$displayAs: "text",
		mainIndex: true,
	}, 
	email: {
		type: "string", 
		$filter: "string",
		required: "userEmailRequired",
		inline : true,
		insertable: true,
		insertRequired: true,
		searchable: true,
		selfUpdateable: true,
		updateable: true,
		toLowerCase: true,
		_$label: "userEmail",
		_$displayAs: "text",
		_$inputType: "email",
		pattern: /^((?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]))$/
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
			{value: 2, option: "userPrivTranslator"},
			{value: 3, option: "userPrivUser"},
		],
	},
	region: {
		type: "integer",
		$filter: "integer",
		insertable: true,
		updateable: true,
		searchable: true,
		selfUpdateable: true,
		_$conditional: function(model){
			return model.priv == 2;
		},
		_$label: "userRegion",
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