import {User as UserC, ToleranceCancel} from '../API';
import {emit} from '../AngularJSInterface';

const User = new UserC(ToleranceCancel);

const globalCallbacks = [];

const emitLogin = () => {
	for(const cb of globalCallbacks)
		cb.onLogin();
};

const emitUserGotten = () => {
	for(const cb of globalCallbacks)
		cb.onUserGotten();
};

const emitLogout = () => {
	for(const cb of globalCallbacks)
		cb.onLogout();
};

class Auth{
	
	constructor(){
		this.expires = localStorage.getItem('expires') || undefined;
		this._user = {};
		if(this.isLogged){
			this._token = localStorage.getItem('token') || undefined;
			this.getUser();
		}else{
			this.deleteUser();
			this.deleteExpires();
			this.deleteToken();
		}
		emit();
	}
	
	login(token, expires){
		this.token = token;
		this.expires = expires * 1000;
		emit();
		this.getUser();
		emitLogin();
	}
	
	logout(){
		this.deleteToken();
		this.deleteExpires();
		this.user = {};
		emitLogout();
	}
	
	get isLogged(){
		return this.expires !== undefined && this.expires > Date.now();
	}
	
	get isAdmin(){
		if(!this.isLogged || !this.user) return;
		return this.user.priv == 1;
	}
		
	get token(){
		return this._token || localStorage.getItem('token');
	}
	
	set token(token){
		this._token = token;
		localStorage.setItem("token", token);
	}
	
	deleteToken(){
		this._token = undefined;
		localStorage.removeItem("token");
	}
		
	get expires(){
		return this._expires || localStorage.getItem('expires');
	}
	
	set expires(expires){
		this._expires = parseInt(expires);
		localStorage.setItem("expires", this._expires);
	}
	
	deleteExpires(){
		this._expires = undefined;
		localStorage.removeItem("expires");
	}
	
	get user(){
		return this._user;
	}
	
	set user(user){
		this._user = user;
	}
	
	deleteUser(){
		this._user = {};
	}
	
	async getUser(){
		const response = await User.doGetSelf();
		if(response.success){
			this.user = response.item;
			emitUserGotten();
		}
		emit();
	}
	
}

const auth = new Auth();

export class AuthInterface{
	
	constructor(onLogin, onUserGotten, onLogout){
		this.onLogin = onLogin;
		this.onUserGotten = onUserGotten;
		this.onLogout = onLogout;
	}
	
	static isFunction(value){
		return typeof value === 'function';
	}
	
	set onLogin(value){
		if(AuthInterface.isFunction(value))
			this._onLogin = value;
		else
			throw new Error("onLogin is not a function");
	}
	
	set onUserGotten(value){
		if(AuthInterface.isFunction(value))
			this._onUserGotten = value;
		else
			throw new Error("onUserGotten is not a function");
	}
	
	set onLogout(value){
		if(AuthInterface.isFunction(value))
			this._onLogout = value;
		else
			throw new Error("onLogout is not a function");
	}
	
	get onLogin(){
		return this._onLogin;
	}
	
	get onUserGotten(){
		return this._onUserGotten;
	}
	
	get onLogout(){
		return this._onLogout;
	}
	
}

export default auth;

export const addAuthCallback = (cb) => {
	if(cb === undefined) throw new Error("AuthInterface is undefined");
	if(!cb instanceof AuthInterface){
		if(cb.onSuccess && cb.onWarning && cb.onError)
			cb = new AuthInterface(cb.onSuccess, cb.onWarning, cb.onError);
		else 
			throw new Error("AuthInterface must have onStart, onProgress and onStop functions");
	}
	globalCallbacks.push(cb);
};

export const removeAuthCallback = (cb) => {
	const index = globalCallbacks.indexOf(cb);
	if(index >= 0)
		globalCallbacks.splice(index, 1);
};