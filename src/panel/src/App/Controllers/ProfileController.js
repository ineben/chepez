import {default as Auth, addAuthCallback, removeAuthCallback, AuthInterface} from "../../Lib/Auth";
import {User} from "../../Lib/Api";
import {EntitySchema} from "../../../../logic/schemas/user";
import {emit} from '../../Lib/AngularJSInterface';


export default class ProfileController{
	
	constructor($scope){
		'ngInject';
		this.User = new User();
		this.User.updateSelf = Auth.user;
		this.userSchema = EntitySchema;
		
		this.AuthInterface = new AuthInterface(
			() => { }, //onLogin
			() => { 
				console.log(Auth);
				this.User.updateSelf = Auth.user; 
			}, //onUserGotten
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