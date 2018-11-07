import {emit} from '../AngularJSInterface';

class mClass{
	
	constructor(){
		//this._langKey = localStorage.getItem('langKey') || "es";
		const lang = require("../../../../logic/langs/site/es.json");
		this._lang = lang;
	}
	
	
	/*get langKey(){
		return this._langKey || localStorage.getItem('langKey');
	}
	
	set langKey(key){
		this._langKey = key;
		localStorage.setItem("langKey", key);
	}*/
	
	get lang(){
		return this._lang;
	}
	
	set lang(lang){
		this._lang = lang;
	}
	
	/*async getLang(LangAPI){
		const response = await LangAPI.getLang(this.langKey);
		if(response.success)
			this.lang = response.item;
		emit();
	}*/
	
}

const lang = new mClass();

export default lang;