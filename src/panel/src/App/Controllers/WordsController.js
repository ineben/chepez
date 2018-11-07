import {Doc, Translate} from "../../Lib/Api";
import {EntitySchema, sinonimSchema} from "../../../../logic/schemas/doc";
import CRUDController from "./CRUDController";

export default class WordsController extends CRUDController{
	
	constructor($timeout, $anchorScroll, toastr, $state){
		'ngInject';
		super($timeout, $anchorScroll, toastr);
		this.$state = $state;
		this.Entity = new Doc();
		this.Translate = new Translate();
		this.schema = EntitySchema;
		this.secondSchema = sinonimSchema;
		const context = this;
		this.buttons = [
			{
				function: this.goSinonims.bind(context),
				class: "btn-info",
				icon: "fa-book"
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
	
	async insert(){
		const response = await this.Entity.doInsert();
	}
	
	goSinonims(item){
		this.$state.go("base.word", {id: item._id});
	}
};