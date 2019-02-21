import {CancelToken} from 'axios';
import Lang from '../Lang';
import HTTPClient from './HTTPClient';
import {emitSuccess, emitWarning, emitError} from '../MessageInterface';
import {emit} from '../AngularJSInterface';

const ALLOW = 0;
const BLOCK = 1;
const CANCEL = 2;

export {ALLOW as ToleranceAllow, BLOCK as ToleranceBlock, CANCEL as ToleranceCancel};

export default class BaseEntity{
	
	constructor(endpoint = 'endpoint', tolerance = 1){
		this.tolerance = tolerance;
		this.endpoint = endpoint;
		this.item = {};
		this.self = {};
		this.items = [];
		this.total = 0;
		this.insert = {};
		this.insertMany = [];
		this.search = {};
		this.update = {};
		this.updateSelf = {};
		this.delete = {};
	}
	
	async doPageChange(newPage){
		this.search.currentPage = newPage;
		this.search.start = this.search.limit * (newPage - 1);
		return this.doSearch();
	}
	
	async loadMore(){
		if(this.items.length == this.total) return;
		this.search.start = this.items.length;
		const response = await this.doSearch(true);
		if(response.success)
			this.items.concat(response.items);
		emit();
	}
	
	async doSearch(skip = false){
		const config = {};
		
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
		
		const response = await HTTPClient._get(`${this.endpoint}/search`, this.search, config);
		
		if(response.success){
			if(!skip)
				this.items = response.items;
			this.total = response.total;
			emit();
		}else if(response.mes)
			emitError(response.mes);
		
		if(!response.cancelled){
			delete this._searchCancel;
			this.ongoingSearch = false;
		}
		
		return response;
	}
	
	async doInsert(cancelable = 0){
		const config = {};
		
		if(this.ongoingInsert)
			switch(this.tolerance){
				case ALLOW:
					break;
				case BLOCK:
					return new Response(false);
					break;
				case CANCEL:					
					if(this._postCancel)
						this._postCancel.cancel();
					this._postCancel = CancelToken.source();
					config.cancelToken = this._postCancel.token;
					break;
			}
			
		this.ongoingInsert = true;
		
		
		const response = await HTTPClient._post(this.endpoint, this.insert, {}, config);
		
		if(!response.cancelled){
			delete this._postCancel;
			this.ongoingInsert = false;
		}
		
		if(response.success){
			this.insert = {};
			emitSuccess(Lang.lang.addSuccess);
		}else if(response.mes)
			emitError(response.mes);
		
		emit();
		return response;
	}

	async doInsertMany(cancelable = 0){
		const config = {};
		
		if(this.ongoingInsertMany)
			switch(this.tolerance){
				case ALLOW:
					break;
				case BLOCK:
					return new Response(false);
					break;
				case CANCEL:					
					if(this._postManyCancel)
						this._postManyCancel.cancel();
					this._postManyCancel = CancelToken.source();
					config.cancelToken = this._postManyCancel.token;
					break;
			}
			
		this.ongoingInsertMany = true;
		
		const response = await HTTPClient._post(`${this.endpoint}/bulk`, this.insertMany, {}, config);
		
		if(!response.cancelled){
			delete this._postManyCancel;
			this.ongoingInsertMany = false;
		}
		
		if(response.success){
			this.insertMany = [];
			emitSuccess(Lang.lang.addSuccess);
		}else if(response.mes)
			emitError(response.mes);
		
		emit();
		return response;
	}

	async doUpdate(){
		const config = {};
		
		if(this.ongoingUpdate)
			switch(this.tolerance){
				case ALLOW:
					break;
				case BLOCK:
					return new Response(false);
					break;
				case CANCEL:					
					if(this._putCancel)
						this._putCancel.cancel();
					this._putCancel = CancelToken.source();
					config.cancelToken = this._putCancel.token;
					break;
			}
			
		this.ongoingUpdate = true;
		
		const response = await HTTPClient._put(`${this.endpoint}/id/${this.update._id}`, this.update, {}, config);
		
		if(!response.cancelled){
			delete this._putCancel;
			this.ongoingUpdate = false;
		}
		
		if(response.success)
			emitSuccess(Lang.lang.editSuccess);
		else if(response.mes)
			emitError(response.mes);
		
		emit();
		return response;
	}
	
	async doUpdateSelf(){
		const config = {};
		
		if(this.ongoingUpdateSelf)
			switch(this.tolerance){
				case ALLOW:
					break;
				case BLOCK:
					return new Response(false);
					break;
				case CANCEL:					
					if(this._putSelfCancel)
						this._putSelfCancel.cancel();
					this._putSelfCancel = CancelToken.source();
					config.cancelToken = this._putSelfCancel.token;
					break;
			}
			
		this.ongoingUpdateSelf = true;
		
		const response = await HTTPClient._put(this.endpoint, this.updateSelf, {}, config);
		
		if(!response.cancelled){
			delete this._putSelfCancel;
			this.ongoingUpdateSelf = false;
		}
		
		if(response.success)
			emitSuccess(Lang.lang.editSuccess);
		else if(response.mes)
			emitError(response.mes);
		emit();
		return response;
	}
	
	async doGetSelf(){
		const config = {};
		
		if(this.ongoingGetSelf)
			switch(this.tolerance){
				case ALLOW:
					break;
				case BLOCK:
					return new Response(false);
					break;
				case CANCEL:					
					if(this._getSelfCancel)
						this._getSelfCancel.cancel();
					this._getSelfCancel = CancelToken.source();
					config.cancelToken = this._getSelfCancel.token;
					break;
			}
			
		this.ongoingGetSelf = true;
		
		const response = await HTTPClient._get(this.endpoint, {}, config);
		
		if(!response.cancelled){
			delete this._getSelfCancel;
			this.ongoingGetSelf = false;
		}
		
		if(response.success){
			this.self = response.item;
		}else if(response.mes)
			emitError(response.mes);
		emit();
		return response;
	}
	
	async doGet(id){
		const config = {};
		
		if(this.ongoingGet)
			switch(this.tolerance){
				case ALLOW:
					break;
				case BLOCK:
					return new Response(false);
					break;
				case CANCEL:					
					if(this._getCancel)
						this._getCancel.cancel();
					this._getCancel = CancelToken.source();
					config.cancelToken = this._getCancel.token;
					break;
			}
			
		this.ongoingGet = true;
		
		const response = await HTTPClient._get(`${this.endpoint}/id/${id}`, {}, config);
		
		if(!response.cancelled){
			delete this._getCancel;
			this.ongoingGet = false;
		}
		
		if(response.success){
			this.item = response.item;
		}else if(response.mes)
			emitError(response.mes);
		emit();
		return response;
	}
	
	async doDelete(){
		const config = {};
		
		if(this.ongoingDelete)
			switch(this.tolerance){
				case ALLOW:
					break;
				case BLOCK:
					return new Response(false);
					break;
				case CANCEL:					
					if(this._deleteCancel)
						this._deleteCancel.cancel();
					this._deleteCancel = CancelToken.source();
					config.cancelToken = this._deleteCancel.token;
					break;
			}
			
		this.ongoingDelete = true;
		
		const response = await HTTPClient._delete(`${this.endpoint}/id/${this.delete._id}`, {}, config);
		
		if(!response.cancelled){
			delete this._deleteCancel;
			this.ongoingDelete = false;
		}
		if(!response.success && response.mes)
			emitError(response.mes);
		emit();
		return response;
	}
	
}