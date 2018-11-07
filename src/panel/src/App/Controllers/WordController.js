import {Doc} from "../../Lib/Api";
import {sinonimSchema} from "../../../../logic/schemas/doc";
import CRUDController from "./CRUDController";

export default class WordsController extends CRUDController{
	
	constructor($timeout, $anchorScroll, toastr, $stateParams){
		'ngInject';
		super($timeout, $anchorScroll, toastr);
		this.word = $stateParams.id;
		this.Entity = new Doc();
		this.Entity.doGet(this.word);
		this.schema =  sinonimSchema;
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
		const response = await this.Entity.doInsertSinonimo(this.word);
		if(response.success)
			this.Entity.doGet(this.word);
	}
	
	async update(){
		const r = await this.Entity.doUpdateSinonimo(this.word);
		if(r.success){
			this.editing = false;
			this.Entity.doGet(this.word);
		}
	}
	
	async delete(){
		const r = await this.Entity.doDeleteSinonimo(this.word);
		if(r.success){			
			if(this.editing && this.Entity.update && this.Entity.update._id == this.delete._id)
				this.editing = false;
		}
		this.Entity.doGet(this.word);
	}
};