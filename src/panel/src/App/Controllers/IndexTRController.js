import {default as Auth, addAuthCallback, removeAuthCallback, AuthInterface} from "../../Lib/Auth";
import { User, Doc } from "../../Lib/Api";
import {EntitySchema, sinonimSchema} from "../../../../logic/schemas/doc";
import {emit} from '../../Lib/AngularJSInterface';


export default class IndexTRController{
	
	constructor($scope){
		'ngInject';
		this.schema = EntitySchema;
		this.Doc = new Doc();
		
		this.AuthInterface = new AuthInterface(
			() => { }, //onLogin
			() => { this.Doc.doSearchSinonimByRegion(Auth.user.region); }, //onUserGotten
			() => { }, //onLogout
		);
		if(Auth.user)
			this.Doc.doSearchSinonimByRegion(Auth.user.region);
		
		addAuthCallback(this.AuthInterface);
		
		$scope.$on('$destroy', () => {
			removeAuthCallback(this.AuthInterface);
		});
	}
	
	loadMore(inView){
		if(inView){
			this.Doc.doSSRLoadMore(Auth.user.region);
		}
	}
	
	
};