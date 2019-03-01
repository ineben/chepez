import {default as Auth, addAuthCallback, removeAuthCallback, AuthInterface} from "../../Lib/Auth";
import {Doc} from "../../Lib/Api";
import {EntitySchema, sinonimSchema} from "../../../../logic/schemas/doc";
import CRUDController from "./CRUDController";

let insert = {};

export default class WordsController extends CRUDController{
	
	constructor($timeout, $anchorScroll, toastr, $stateParams, $scope){
		'ngInject';
		super($timeout, $anchorScroll, toastr);
		this.word = $stateParams.id;
		this.Auth = Auth;
		this.Entity = new Doc();
		this.vEntity = this.Entity;
		this.Entity.doGet(this.word);
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
		this.insertMany = [];
		for(let i = 0; i < 50; i++)
			this.insertMany[i] = {};
		
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
			this.insertMany[key].region = this.Auth.user.region;
		}
	}
	
	async insert(){
		const newArray = [];
		for(const entry of this.insertMany)
			if(entry.palabra || 
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
			response = await this.Entity.doInsertSinonimo(this.word);
		}else{
			this.Entity.insertMany = newArray;
			response = await this.Entity.doInsertManySinonimo(this.word);
		}
		
		if(response.success){
			
			this.insertMany = [];
			for(let i = 0; i < 50; i++)
				this.insertMany[i] = {};
			
			if(Auth.user.region)
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