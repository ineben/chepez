import {default as Auth, addAuthCallback, removeAuthCallback, AuthInterface} from "../../Lib/Auth";
import {Doc} from "../../Lib/Api";
import {EntitySchema, sinonimSchema} from "../../../../logic/schemas/doc";
import CRUDController from "./CRUDController";
import Lang from "../../Lib/Lang";

let insert = {};

export default class WordsController extends CRUDController{
	
	constructor($timeout, $anchorScroll, toastr, $stateParams, $scope, $rootScope){
		'ngInject';
		super($timeout, $anchorScroll, toastr);
		this.word = $stateParams.id;
		this.Auth = Auth;
		this.Entity = new Doc();
		this.vEntity = this.Entity;
		
		this.Entity.doGet(this.word)
		.then((res) => {
			if(!res.success) return;
			
			this.insertMany = [];
			for(let i = 0; i < 25; i++)
				this.insertMany[i] = {};
			this.setUp();
			
			console.log(this.insertMany);
			$rootScope.$apply();
		});
		
		this.schema =  sinonimSchema;
		this.vSchema =  EntitySchema;
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
		
		this.AuthInterface = new AuthInterface(
			() => { }, //onLogin
			() => {
				if(Auth.isTranslator){
					this.setUp();
					delete this.schema.region;
				}
			}, //onUserGotten
			() => { }, //onLogout
		);
		addAuthCallback(this.AuthInterface);
		if(Auth.user.region){
			this.setUp();
			delete this.schema.region;
		}
		$scope.$on('$destroy', () => {
			removeAuthCallback(this.AuthInterface);
		});
	}
	
	setUp(){
		for(const key in this.insertMany){
			this.insertMany[key].type = this.Entity.item.type;
			this.insertMany[key].sustantiveType = this.Entity.item.sustantiveType;
			this.insertMany[key].adverbType = this.Entity.item.adverbType;
			this.insertMany[key].region = this.Auth.user.region;
		}
	}
	
	isDirty(combo){
		const ret = (combo.grado != null && combo.grado != '') ||
			(combo.palabra != null && combo.palabra != '') ||
			(combo.female != null && combo.female != '') ||
			(combo.neutral != null && combo.neutral != '') ||
			(combo.gerundio != null && combo.gerundio != '') ||
			(combo.participio != null && combo.participio != '') ||
			(combo.plural != null && combo.plural != '') ||
			(combo.pluralFemale != null && combo.pluralFemale != '') ||
			(combo.pluralNeutral != null && combo.pluralNeutral != '');
		return ret;
	}
	
	async insert(){
		const newArray = [];
		for(const entry of this.insertMany)
			if(entry.palabra || 
				entry.female || 
				entry.neutral || 
				entry.plural || 
				entry.gerundio || 
				entry.participio || 
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
			response = await this.Entity.doInsertSinonimo(this.word);
		}else{
			this.Entity.insertMany = newArray;
			response = await this.Entity.doInsertManySinonimo(this.word);
		}
		
		if(response.success){
			
			this.insertMany = [];
			for(let i = 0; i < 25; i++)
				this.insertMany[i] = {};
			this.setUp();
			this.Entity.doGet(this.word);
		}
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