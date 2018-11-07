import Auth from "../../Lib/Auth";
import {Auth as AuthAPI} from "../../Lib/Api";


export default class LoginController{
	
	constructor($state){
		'ngInject';
		this.$state = $state;
		this.URL = URL;
		this.AuthAPI = new AuthAPI()
		this.Auth = Auth;
		if(!this.Auth.isLogged)
			$state.go("base.signIn");
	}
	
	async submit(){
		const res = await this.AuthAPI.doLogin();
		if(res.success)
			this.$state.go("base.index");
	}

};