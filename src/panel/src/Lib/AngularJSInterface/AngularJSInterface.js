class AngularJSInterface{
	
	constructor(onEmit){
		this.onEmit = onEmit;
	}
	
	static isFunction(value){
		return typeof value === 'function';
	}
	
	set onEmit(value){
		if(AngularJSInterface.isFunction(value))
			this._onEmit = value;
		else
			throw new Error("onEmit is not a function");
	}
		
	get onEmit(){
		return this._onEmit;
	}
}

export default AngularJSInterface;