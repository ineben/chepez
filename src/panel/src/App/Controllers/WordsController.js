import {Doc} from "../../Lib/Api";
import {EntitySchema, sinonimSchema} from "../../../../logic/schemas/doc";
import CRUDController from "./CRUDController";
import {default as Auth, addAuthCallback, removeAuthCallback, AuthInterface} from "../../Lib/Auth";


let search = {};
let insert = {
	living: false,
	profession: false
};

export default class WordsController extends CRUDController{ 
	
	constructor($timeout, $anchorScroll, toastr, $state){
		'ngInject';
		super($timeout, $anchorScroll, toastr);
		this.$state = $state;
		this.Entity = new Doc();
		this.Entity.search = search;
		this.Entity.insert = insert;
		this.Entity.doSearch();
		this.schema = EntitySchema;
		const context = this;
		this.buttons = [
			{
				function: this.goSinonims.bind(context),
				class: "btn-info",
				icon: "fa-book",
				conditional : function(item){
					console.log("type", item);
					return item.type != "name" && item.type != "lastname";
				}
			},
		]; 
		
		this.AuthInterface = new AuthInterface(
			() => { }, //onLogin
			() => { context.setButtons(context); }, //onUserGotten
			() => { }, //onLogout
		);
		
		addAuthCallback(this.AuthInterface);
		
		this.setButtons(context);
		
	}
	
	setButtons(context){
		if(Auth.isAdmin){
			this.buttons.push({
				function: this.setUpdate.bind(context),
				class: "btn-success",
				icon: "fa-edit"
			});
			this.buttons.push({
				function: this.setDelete.bind(context),
				class: "btn-danger",
				icon: "fa-trash"
			});
		}
	}
	
	async insert(){
		const nI = {
			living: insert.living,
			profession: insert.profession
		};
		const response = await this.Entity.doInsert();
		this.Entity.insert = insert = nI;
	}
	
	goSinonims(item){
		this.$state.go("base.word", {id: item._id});
	}
};