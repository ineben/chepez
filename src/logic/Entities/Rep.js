const Base = require(__dirname + '/_Base');

let	Schema = require("../schemas/rep");
Schema = {...Schema};

class Rep extends Base{
	
	constructor(){
		super("rep", Schema.EntitySchema);
	}
	
}

module.exports = Rep;