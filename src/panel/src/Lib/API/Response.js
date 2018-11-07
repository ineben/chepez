export default class Response{
	
	constructor(value, response){
		
		if(typeof value == "object"){
			for(const key in value){
				this[key] = value[key];
			}
		}else{		
			this.success = value;
			if(value){
				if(Array.isArray(response))
					this.items = response;
				else
					this.item = response;
			}else
				this.mes = response;
		}
	}
	
}