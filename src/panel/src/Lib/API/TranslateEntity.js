import {CancelToken} from 'axios';
import {ALLOW, BLOCK, CANCEL, default as BaseEntity} from './BaseEntity';
import HTTPClient from './HTTPClient';
import {emitSuccess, emitWarning, emitError} from '../MessageInterface';
import {emit} from '../AngularJSInterface';

export default class Translate extends BaseEntity{
	
	constructor(tolerance = 1){
		super("translator", tolerance);
		this.phrase = '';
	}

	
	async doSearch(){
		const config = {};
		this.phrase = '';
		if(this.ongoingSearch)
			switch(this.tolerance){
				case ALLOW:
					break;
				case BLOCK:
					return new Response(false);
					break;
				case CANCEL:					
					if(this._searchCancel)
						this._searchCancel.cancel();
					this._searchCancel = CancelToken.source();
					config.cancelToken = this._searchCancel.token;
					break;
			}
			
		this.ongoingSearch = true;
		
		const response = await HTTPClient._get(`${this.endpoint}/A0D7D114-7404-47F2-99F9-7809E7228959`, this.search, config);
		
		if(response.success){
			this.phrase = response.phrase;
			emit();
		}else if(response.mes)
			emitError(response.mes);
		
		if(!response.cancelled){
			delete this._searchCancel;
			this.ongoingSearch = false;
		}
		
		return response;
	}
	
}