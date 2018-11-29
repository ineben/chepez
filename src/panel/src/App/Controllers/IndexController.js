import {default as Auth, addAuthCallback, removeAuthCallback, AuthInterface} from "../../Lib/Auth";
import {User, Translate} from "../../Lib/Api";
import {EntitySchema, sinonimSchema} from "../../../../logic/schemas/doc";


export default class IndexController{
	
	constructor($scope){
		'ngInject';
		this.User = new User();
		this.Translate = new Translate();
		this.User.updateSelf = Auth.user;
		this.secondSchema = sinonimSchema;
		
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