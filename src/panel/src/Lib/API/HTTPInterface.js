class HTTPInterface{
	
	constructor(onStart, onProgress, onStop, onError){
		this.onStart = onStart;
		this.onProgress = onProgress;
		this.onStop = onStop;
		this.onError = onError;
	}
	
	static isFunction(value){
		return typeof value === 'function';
	}
	
	set onStart(value){
		if(HTTPInterface.isFunction(value))
			this._onStart = value;
		else
			throw new Error("onStart is not a function");
	}
	
	set onProgress(value){
		if(HTTPInterface.isFunction(value))
			this._onProgress = value;
		else
			throw new Error("onProgress is not a function");
	}
	
	set onStop(value){
		if(HTTPInterface.isFunction(value))
			this._onStop = value;
		else
			throw new Error("onStop is not a function");
	}
	
	set onError(value){
		if(HTTPInterface.isFunction(value))
			this._onError = value;
		else
			throw new Error("onStop is not a function");
	}
	
	get onStart(){
		return this._onStart;
	}
	
	get onProgress(){
		return this._onProgress;
	}
	
	get onStop(){
		return this._onStop;
	}
	
	get onError(){
		return this._onError;
	}
}

export default HTTPInterface;