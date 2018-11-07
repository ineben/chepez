import MessageInterface from './MessageInterface';

const globalCallbacks = [];

export const addMessageCallback = (cb) => {
	if(cb === undefined) throw new Error("MessageInterface is undefined");
	if(!cb instanceof MessageInterface){
		if(cb.onSuccess && cb.onWarning && cb.onError)
			cb = new MessageInterface(cb.onSuccess, cb.onWarning, cb.onError);
		else 
			throw new Error("MessageInterface must have onStart, onProgress and onStop functions");
	}
	globalCallbacks.push(cb);
};

export const removeMessageCallback = (cb) => {
	const index = globalCallbacks.indexOf(cb);
	if(index >= 0)
		globalCallbacks.splice(index, 1);
};

export const emitSuccess = (mes) => {
	for(const cb of globalCallbacks)
		cb.onSuccess(mes);
};

export const emitWarning = (mes) => {
	for(const cb of globalCallbacks)
		cb.onWarning(mes);
};

export const emitError = (mes) => {
	for(const cb of globalCallbacks)
		cb.onError();
};

export default MessageInterface;
