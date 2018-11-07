import {CancelToken} from 'axios';
import HTTPClient from './HTTPClient';
import Lang from '../Lang';
import Auth from '../Auth';
import {emitSuccess, emitWarning, emitError} from '../MessageInterface';
import {emit} from '../AngularJSInterface';

export default class AuthEntity{
	
	constructor(){
		this.endpoint = 'auth';
		this.login = {};
	}
	
	
	async doLogin(){
		const config = {};
		
		if(this._loginCancel)
			this._loginCancel.cancel();
		this._loginCancel = CancelToken.source();
		config.cancelToken = this._loginCancel.token;
		
		const response = await HTTPClient._post(`${this.endpoint}/login`, this.login, {}, config);
		
		if(!response.cancelled){
			delete this._loginCancel;
		}
		
		if(response.success){
			Auth.login(response.token, response.expires);
			emitSuccess(Lang.lang.loginSuccess);
			emit();
		}else if(response.mes)
			emitError(response.mes);
		
		return response;
	}
	
}