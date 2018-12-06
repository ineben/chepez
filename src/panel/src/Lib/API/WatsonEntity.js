import {default as BaseEntity} from './BaseEntity';
import HTTPClient from './HTTPClient';
import {emitSuccess, emitWarning, emitError} from '../MessageInterface';
import {emit} from '../AngularJSInterface';

export default class Watson extends BaseEntity{
	
	constructor(tolerance = 1){
		super("watson", tolerance);
		this.messages = [];
	}

	
	async doInsert(){
		const config = {};
		
		this.ongoingInsert = true;
		
		const response = await HTTPClient._post(this.endpoint, this.insert, {}, config);
		
		this.ongoingInsert = false;
		
		if(response.success){
			this.insert = {};
		}else if(response.mes)
			emitError(response.mes);
		
		emit();
		return response;
	}
	
}