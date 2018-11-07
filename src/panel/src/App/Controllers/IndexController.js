import {default as Auth, addAuthCallback, removeAuthCallback, AuthInterface} from "../../Lib/Auth";
import {User} from "../../Lib/Api";

export default class IndexController{
	
	constructor($scope){
		'ngInject';
		this.User = new User();
		this.User.updateSelf = Auth.user;
		
		this.AuthInterface = new AuthInterface(
			() => { }, //onLogin
			() => { this.User.updateSelf = Auth.user; }, //onUserGotten
			() => { }, //onLogout
		);
		
		addAuthCallback(this.AuthInterface);
		
		$scope.$on('$destroy', () => {
			removeAuthCallback(this.AuthInterface);
		});
		
	}
	
	
	async sendPut(){
		const response = await this.User.doUpdateSelf();
		if(response.success){
			if(response.token)
				Auth.login(response.token, response.expires);
		}
	}
	
};