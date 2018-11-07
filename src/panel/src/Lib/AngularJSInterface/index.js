import AngularJSInterface from './AngularJSInterface';

const globalCallbacks = [];

export const addCallback = (cb) => {
	if(cb === undefined) throw new Error("AngularJSInterface is undefined");
	if(!cb instanceof AngularJSInterface){
		if(cb.onEmit)
			cb = new AngularJSInterface(cb.onEmit);
		else 
			throw new Error("MessageInterface must have onEmit functions");
	}
	globalCallbacks.push(cb);
};

export const removeCallback = (cb) => {
	const index = globalCallbacks.indexOf(cb);
	if(index >= 0)
		globalCallbacks.splice(index, 1);
};

export const emit = () => {
	for(const cb of globalCallbacks)
		cb.onEmit();
};

export default AngularJSInterface;
