import { Doc } from "../../Lib/Api";
import Lang from "../../Lib/Lang";
import { EntitySchema } from "../../../../logic/schemas/doc";
import CRUDController from "./CRUDController";

export default class AddWordController extends CRUDController{
	
	constructor($timeout, $anchorScroll, toastr, $stateParams){
		'ngInject';
		super($timeout, $anchorScroll, toastr);
		this.Entity = new Doc();
		this.insertMany = [];
		this.gModel = angular.copy($stateParams);
		for(let i = 0; i < 50; i++)
			this.insertMany[i] = {type :  this.gModel.type, living: false, profession : false};
		
		this.schema = angular.copy(EntitySchema);
		
		for(const option of EntitySchema.type._$options){
			if(option.value == this.gModel.type){
				this.title = Lang.lang[option.option];
				break;
			}
		}
		
		delete this.schema.type;
		const context = this;
	}
	
	async insert(){
		const newArray = [];
		for(const entry of this.insertMany)
			if(entry.base || 
				entry.female || 
				entry.neutral || 
				entry.plural || 
				entry.pluralNeutral ||
				entry.pluralFemale){
					newArray.push(entry);
				}
		if(newArray.length == 0){
			this.toastr.error(Lang.lang.inputAtLeastOneValidEntry, {progressBar:true});
			return;
		}
		
		let response;
		if(newArray.length == 1){
			this.Entity.insert = newArray[0];
			response = await this.Entity.doInsert();
		}else{
			this.Entity.insertMany = newArray;
			response = await this.Entity.doInsertMany();
		}
		
		if(response.success){
			this.insertMany = [];
			for(let i = 0; i < 50; i++)
				this.insertMany[i] = {type : this.gModel.type, living: false, profession : false};
		}
	}
};