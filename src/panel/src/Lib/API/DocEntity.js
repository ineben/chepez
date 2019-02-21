import {CancelToken} from 'axios';
import {ALLOW, BLOCK, CANCEL, default as BaseEntity} from './BaseEntity';
import HTTPClient from './HTTPClient';
import {emitSuccess, emitWarning, emitError} from '../MessageInterface';
import {emit} from '../AngularJSInterface';
import Lang from '../Lang';

export default class Doc extends BaseEntity{
	
	constructor(tolerance = 1){
		super("docs", tolerance);
		this.searchWord = {};
		this.searchSSR = {
			$limit : 10,
			types : [1, 2, 3, 4]
		};
	}
	
	async doSSRLoadMore(region){
		if(this.itemsSSR && this.itemsSSR.length > 0 && this.itemsSSR.length == this.totalSSR || this.ongoingSSR) return;
		const response = await this.doSearchSinonimByRegion(region, true);
		console.log("loadmorer", this, response);
		if(response.success){
			for(const item of response.items)
				this.itemsSSR.push(item);
			console.log(this.itemsSSR);
		}
		emit();
	}
	
	async doSearchSinonimByRegion(region = 1, skip = false){
		const config = {};
		
		console.log("docent", this);
		
		if(this.ongoingSSR)
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
			
		this.ongoingSSR = true;
		
		const response = await HTTPClient._get(`${this.endpoint}/searchByRegion/${region}`, this.searchSSR, config);
		
		if(response.success){
			if(!skip)
				this.itemsSSR = response.items;
			this.totalSSR = response.total;
			this.searchSSR.bookmark = response.bookmark;
			this.ongoingSSR = false;
		}else if(response.mes)
			emitError(response.mes);
		
		if(!response.cancelled){
			delete this._searchCancel;
			this.ongoingSSR = false;
		}
		emit();
		return response;
	}
		
	async doSearchWord(){
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
		
		const response = await HTTPClient._get(`${this.endpoint}/searchWord`, this.searchWord, config);
		
		if(response.success){
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
		
	async doInsertSinonimo(word){
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
		
		
		const response = await HTTPClient._post(`${this.endpoint}/word/${word}`, this.insert, {}, config);
		
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
		
	async doInsertManySinonimo(word){
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
		
		const response = await HTTPClient._post(`${this.endpoint}/wordBulk/${word}`, this.insertMany, {}, config);
		
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
	
	async doUpdateSinonimo(word){
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
		
		const response = await HTTPClient._put(`${this.endpoint}/word/${word}/${this.update._id}`, this.update, {}, config);
		
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
		
	async doDeleteSinonimo(word){
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
		
		const response = await HTTPClient._delete(`${this.endpoint}/word/${word}/${this.delete._id}`, {}, config);
		
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