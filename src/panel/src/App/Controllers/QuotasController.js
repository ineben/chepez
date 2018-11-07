import {Quota} from "../../Lib/Api";
import {EntitySchema} from "../../../../logic/schemas/quota";
import CRUDController from "./CRUDController";

export default class UserController extends CRUDController{
	
	constructor($timeout, $anchorScroll, toastr, $stateParams){
		'ngInject';
		super($timeout, $anchorScroll, toastr);
		this.Entity = new Quota();
		this.Entity.search.user = $stateParams.id;
		this.Entity.doSearch();
		this.schema = EntitySchema;
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
			},
		]; 
	}
	
	
	async insert(){
		this.Entity.insert.user = this.Entity.search.user;
		const response = await this.Entity.doInsert();
		if(response.success){
			this.Entity.doSearch();
		}
	}
	
};