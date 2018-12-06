import {default as Auth, addAuthCallback, removeAuthCallback, AuthInterface} from "../../Lib/Auth";
import {User, Translate, Watson} from "../../Lib/Api";
import {EntitySchema, sinonimSchema} from "../../../../logic/schemas/doc";
import {emit} from '../../Lib/AngularJSInterface';


export default class IndexController{
	
	constructor($scope){
		'ngInject';
		this.User = new User();
		this.Watson = new Watson();
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
	
	async submitMessage(){
		this.Watson.messages.unshift({message: this.Watson.insert.text});
		const response = await this.Watson.doInsert();
		if(response.success){
			this.Watson.messages.unshift({watson: true, message: response.item});
			if(response.session)
				this.Watson.insert.session = response.session;
		}
		emit();
	}
	
	async sendPut(){
		const response = await this.User.doUpdateSelf();
		if(response.success){
			if(response.token)
				Auth.login(response.token, response.expires);
		}
	}
	
};