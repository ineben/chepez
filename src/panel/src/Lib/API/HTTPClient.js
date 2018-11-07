import axios, {CancelToken} from 'axios';
import {api} from '../Config';
import Auth from '../Auth';
import Lang from '../Lang';
import Response from './Response';
import HTTPInterface from './HTTPInterface';

const globalCallbacks = [];

const addHTTPCallback = (cb) => {
	if(cb === undefined) throw new Error("Progresscallback is undefined");
	if(!cb instanceof HTTPInterface){
		if(cb.onStart && cb.onProgress && cb.onStop && cb.onError)
			cb = new HTTPInterface(cb.onStart, cb.onProgress, cb.onStop, cb.onError);
		else 
			throw new Error("ProgressCallback must have onStart, onProgress and onStop functions");
	}
	globalCallbacks.push(cb);
};

const removeHTTPCallback = (cb) => {
	const index = globalCallbacks.indexOf(cb);
	if(index >= 0)
		globalCallbacks.splice(index, 1);
};

const callOnStarts = () => {
	for(const cb of globalCallbacks)
		cb.onStart();
};

const callOnErrors = () => {
	for(const cb of globalCallbacks)
		cb.onError();
};

const callOnStops = () => {
	for(const cb of globalCallbacks)
		cb.onStop();
};

const callOnProgress = (percentage) => {
	console.log("percentage", percentage);
	for(const cb of globalCallbacks)
		cb._onProgress(percentage);
};

const calculatePercentage = (loaded, total) => { return (Math.floor(loaded * 1.0) / total)};

const errorCB = (error) => {
	callOnStops();
	callOnErrors();
	console.log(error);
	return Promise.reject(new Response(false, Lang.lang.connectionError));
};

const updateCB = (e) => {
	console.log("e", e);
	const progress = calculatePercentage(e.loaded, e.total);
	callOnProgress(progress);
};

const isFile = (file) => {
	return file != null && (file instanceof Blob || file instanceof File || (file.flashId && file.name && file.size));
}

const addValueToFormData = (formData, key, value) => {
	let returnFormData = false;	
	if( isFile(value) ){
		returnFormData = true;
		formData.append(key, value, value.name);
	}else if(Array.isArray(value)){
		for(let kkey in value){
			let j = addValueToFormData(formData, key, value[kkey]);
			if(j && !returnFormData)
				returnFormData = j;
		}
	}else if(typeof val === "object"){
		for(let kkey in value){
			let j = addValueToFormData(formData, key+"."+kkey, value[kkey]);
			if(j && !returnFormData)
				returnFormData = j;
		}
	}else
		formData.append(key, value);
	return returnFormData;
}

const requestTransformer = (data, headers) => {
	if(!data) return data;
	
	let returnFormData = false;
	const formData = new FormData();
	
	for(const key in data){
		returnFormData = addValueToFormData(formData, key, data[key]);
	}
	
	if(returnFormData){
		headers['Content-Type'] = 'multipart/form-data;charset=utf-8';
	}else{
		headers['Content-Type'] = 'application/json;charset=utf-8';
	}
	
	return returnFormData ? formData : JSON.stringify(data);	
};

const http = axios.create({
  baseURL: api,
  timeout: 60 * 1000,
  onDownloadProgress: updateCB,
  onUploadProgress: updateCB,
  transformRequest : [requestTransformer]
});

http.interceptors.request.use(
	(config) => {
		if(Auth.isLogged) 
			config.headers.Authorization = Auth.token;
		else
			delete config.headers.Authorization;
		
		callOnStarts();
		return config;
	},
	errorCB
);

http.interceptors.response.use(
	(response) => {
		callOnStops();
		return response;
	},
	errorCB
);

class HTTPClient{
	
	async doRequest(request){
		try{
			const response = await http(request);
			const r = new Response(response.data);
			if(r.deleteToken){
				Auth.logout();
			}
			return r;
		}catch(e){
			if(axios.isCancel(e)){
				const R = new Response(false);
				R.cancelled = true;
				return R;
			}else
				return new Response(false, Lang.lang.connectionError);
		}
	}
	
	async _get(url = '/', query = {}, config = {}){
		
		const request = config;
		request.method = 'get';
		request.url = url;
		request.params = query;
		
		return await this.doRequest(request);
	}
	
	async _delete(url = '', query = {}, config = {}){
		
		const request = config;
		request.method = 'delete';
		request.url = url;
		request.params = query;
		
		return await this.doRequest(request);
	}
	
	async _put(url = '', data = {}, query = {}, config = {}){
		
		const request = config;
		request.method = 'put';
		request.url = url;
		request.params = query;
		request.data = data;
		
		return await this.doRequest(request);
	}
	
	async _post(url = '', data = {}, query = {}, config = {}){
		
		const request = config;
		request.method = 'post';
		request.url = url;
		request.params = query;
		request.data = data;
		
		return await this.doRequest(request);
	}
}

export {addHTTPCallback, removeHTTPCallback};
const client = new HTTPClient();
export default client;