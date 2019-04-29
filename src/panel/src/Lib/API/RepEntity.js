import {CancelToken} from 'axios';
import {ALLOW, BLOCK, CANCEL, default as BaseEntity} from './BaseEntity';
import HTTPClient from './HTTPClient';
import {emitSuccess, emitWarning, emitError} from '../MessageInterface';
import {emit} from '../AngularJSInterface';
import Lang from '../Lang';

export default class Doc extends BaseEntity{
	
	constructor(tolerance = 1){
		super("reps", tolerance);
		this.searchWord = {};
		this.searchSSR = {
			$limit : 10
		};
	}
	
	async doLoadMore(region){
		if(this.items && this.items.length > 0 && this.items.length == this.total || this.ongoingSearch) return;
		const response = await this.doSearchWord(true);
		
		if(response.success){
			for(const item of response.items)
				this.items.push(item);
		}
		emit();
	}
		
	async doSearchWord(skip = false){
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
			if(!skip)
				this.items = response.items;
			this.total = response.total;
			this.search.bookmark = response.bookmark;
			this.ongoingSearch = false;
		}else if(response.mes)
			emitError(response.mes);
		
		if(!response.cancelled){
			delete this._searchCancel;
			this.ongoingSearch = false;
		}
		emit();
		return response;
	}

}