const transformer = require('./_transformer');

const EntitySchema = {
	_id: {
		type: "string",
		$filter: "uuid",
		_$label: "id",
		_$displayAs: "text",
		mainIndex: true,
	}, 
	word: {
		type: "string",
		$filter: "string",
		insertable: true,
		insertRequired: true,
		updateable: true,
		toLowerCase: true,
		_$label: "repWord",
		_$displayAs: "text",
		_$inputType: "text"
	}, 
	replace: {
		type: "string",
		$filter: "string",
		insertable: true,
		insertRequired: true,
		updateable: true,
		toLowerCase: true,
		_$label: "repReplace",
		_$displayAs: "text",
		_$inputType: "text"
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