import {User} from "../../Lib/Api";
import {EntitySchema} from "../../../../logic/schemas/user";
import CRUDController from "./CRUDController";

export default class UserController extends CRUDController{
	
	constructor($timeout, $anchorScroll, toastr, $state){
		'ngInject';
		super($timeout, $anchorScroll, toastr);
		this.$state = $state;
		this.Entity = new User();
		this.Entity.doSearch();
		this.schema = EntitySchema;
		const context = this;
		this.buttons = [
			{
				function: this.goQuotas.bind(context),
				class: "btn-info",
				icon: "fa-ban"
			},
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
	
	goQuotas(item){
		this.$state.go("base.user", {id: item._id});
	}
};