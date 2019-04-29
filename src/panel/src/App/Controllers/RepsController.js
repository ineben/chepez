import { Rep } from "../../Lib/Api";
import { EntitySchema } from "../../../../logic/schemas/rep";
import CRUDController from "./CRUDController";


export default class RepsController extends CRUDController{
	
	constructor($timeout, $anchorScroll, toastr, $state){
		'ngInject';
		super($timeout, $anchorScroll, toastr);
		this.schema = EntitySchema;
		this.Entity = new Rep();
		this.Entity.doSearchWord(false);
		
		const context = this;
		this.buttons = [
			{
				function: this.setUpdate.bind(context),
				class: "btn-success",
				icon: "fa-edit"
			},
			{
				function: this.setDelete.bind(context),
				class: "btn-danger",
				icon: "fa-trash"
			}
		];
	}
	
	doChange(){
		this.Entity.items = [];
		delete this.Entity.searchWord.bookmark;
		this.Entity.doSearchWord();
	}
	
	loadMore(inView){
		if(inView){
			this.Entity.doLoadMore();
		}
	}
	
	
	async insert(){
		const response = await this.Entity.doInsert();
		if(response.success){
			this.doChange();
		}
	}
	
};