const privateKeys = ["linkedWith", "insertable", "updateable", "searchable", "inline", "required", "extraFilter", "pattern"];

const queryActions = {
	integer: ["lt", "lte", "gt", "gte", "ne", "exists"],
	number: ["lt", "lte", "gt", "gte", "ne", "exists"],
	string: ["startswith", "endswith", "contains", "ne", "exists"],
	array: ["all", "in", "ne", "exists"],
	geopoint: ["point", "polygon", "intersects", "within", "near", "ne", "exists"]
};

const clean = function(body){
	body = {...body};
	for(let key of privateKeys)
		delete body[key];
	
	return body;
};

const basic = function(schema){
	const data = {};
	for(let key in schema){
		if(!schema.hasOwnProperty("private"))
			data[key] = clean({...schema[key]});
	}
	return data;
};

const process = function(schema, validKey, requiredKey = 'null'){
	const data = {
		body: {
			type: "object",
			additionalProperties: false,
			required: [],
			properties : {}
		},
		headers : {
			type: "object",
			additionalProperties: true,
			required: ["Authorization"],
			properties: {
				Authorization : {type: "string"}
			}
		},
		response: {
			'2xx' : toResponseSingle(schema)
		}
	};
	for(let key in schema){
		if(schema.hasOwnProperty(validKey)){
			data.body.properties[key] = clean({...schema[key]});
			if(schema.hasOwnProperty(requiredKey))
				data.body.required.push(key);
		}
	}
	return data;
};

const create = function(schema){
	return process(schema, "insertable", "insertRequired");
};

const update = function(schema){
	return process(schema, "updateable", "updateRequired");
};

const updateSelf = function(schema){
	return process(schema, "selfUpdateable", "selfUpdateRequired");
};

const toResponseSingle = function(schema){
	return {
		type: "object",
		additionalProperties: false,
		required : ["success"],
		properties: {
			success: { 
				type: "boolean", 
				default: true
			}, 
			item: {
				type: "object", 
				properties: basic(schema)
			},
			mes : {
				type: "string"
			},
			deleteToken : {
				type: "boolean",
				default: false
			}
		}
	};
};

const toResponseArray = function(schema){
	return {
		type: "object",
		required : ["success"],
		additionalProperties: false,
		properties: {
			success: {
				type: "boolean", 
				default: true
			}, 
			items: {
				type: "array", 
				items: {
					type: "object",
					properties: basic(schema)
				}
			},
			mes : {
				type: "string"
			},
			deleteToken : {
				type: "boolean",
				default: false
			},
			total: {
				type: "integer"
			}
		}
	};
};

const remove = function(){
	const data = {
		params : {
			type: "object",
			additionalProperties: false,
			properties : {
				id: {
					type: "string", 
					pattern: "^[0-9a-zA-Z-]$"
				}
			}
		},
		headers : {
			type: "object",
			additionalProperties: true,
			required: ["Authorization"],
			properties: {
				Authorization : {type: "string"}
			}
		},
		response: {
			'2xx' : {
				type: "object",
				additionalProperties: false,
				required : ["success"],
				properties: {
					success: { 
						type: "boolean", 
						default: true
					},
					mes : {
						type: "string"
					},
					deleteToken : {
						type: "boolean",
						default: false
					}
				}
			}
		}
	};
	return data;
};

const get = function(schema){
	const data = {
		params : {
			type: "object",
			additionalProperties: false,
			properties : {
				id: {
					type: "string", 
					pattern: "^[0-9a-zA-Z-]$"
				}
			}
		},
		response: {
			'2xx' : toResponseSingle(schema)
		}
	};
	return data;
};

const retrieve = function(schema){
	const data = {
		querystring : {
			type: "object",
			additionalProperties: false,
			properties : {
				limit: {
					type: "integer", 
					default: 20
				}, 
				start: {
					type: "integer", 
					default: 0
				}, 
				order: {
					type: "array", 
					default: null, 
					items: {
						type: "array", 
						default: null, 
						items: {
							type: "string"
						}
					}
				}, 
				projection: {
					type: "array", 
					items: {
						type: "string"
					}
				}
			}
		},
		response: {
			'2xx' : toResponseArray(schema)
		}
	};
	for(let key in schema){
		if(schema.hasOwnProperty("searchable")){
			const clone = clean({...schema[key]});
			data.querystring.properties[key] = clone;
			if(queryActions.hasOwnProperty(clone.type))
				for(const kkey in queryActions[clone.type])
					data.querystring.properties[`${key}_${kkey}`] = clone;
		}
	}
	return data;
};

module.exports = {
	create,
	update,
	updateSelf,
	remove,
	retrieve,
	get
};