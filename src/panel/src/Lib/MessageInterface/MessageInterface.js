class MessageInterface{
	
	constructor(onSuccess, onWarning, onError){
		this.onSuccess = onSuccess;
		this.onWarning = onWarning;
		this.onError = onError;
	}
	
	static isFunction(value){
		return typeof value === 'function';
	}
	
	set onSuccess(value){
		if(MessageInterface.isFunction(value))
			this._onSuccess = value;
		else
			throw new Error("onSuccess is not a function");
	}
	
	set onWarning(value){
		if(MessageInterface.isFunction(value))
			this._onWarning = value;
		else
			throw new Error("onWarning is not a function");
	}
	
	set onError(value){
		if(MessageInterface.isFunction(value))
			this._onError = value;
		else
			throw new Error("onError is not a function");
	}
	
	get onSuccess(){
		return this._onSuccess;
	}
	
	get onWarning(){
		return this._onWarning;
	}
	
	get onError(){
		return this._onError;
	}
	
}

export default MessageInterface;