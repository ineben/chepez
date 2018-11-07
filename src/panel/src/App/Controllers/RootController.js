import * as URL from "../../Lib/Config";
import {default as Auth, addAuthCallback, removeAuthCallback, AuthInterface} from "../../Lib/Auth";
import Lang from "../../Lib/Lang";
import {HTTPInterface, addHTTPCallback, removeHTTPCallback} from "../../Lib/API";
import {default as MessageInterface, addMessageCallback, removeMessageCallback} from "../../Lib/MessageInterface";
import {default as AngularJSInterface, addCallback as addDigestCallback} from '../../Lib/AngularJSInterface';

import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

export default class RootController{
	
	constructor($rootScope, toastr, $state){
		'ngInject';
		this.$rootScope = $rootScope;
		this.toastr = toastr;
		this.$state = $state;
		
		this.URL = URL;
		this.Lang = Lang;
		
		this.Auth = Auth;
		if(!this.Auth.isLogged)
			$state.go("base.signIn");
		
		this.activeRequests = 0;
		this.HTTPInterface = new HTTPInterface(
			() => {
				this.activeRequests++;
				console.log("start", this.activeRequests);
				NProgress.start();
				this.$rootScope.$apply();
			},
			(percent) => {
				console.log("progress", this.percent);
				NProgress.inc(percent);
			},
			() => {
				this.activeRequests--;
				if (this.activeRequests <= 0) {
					NProgress.done();
				}
				if(this.activeRequests < 0) this.activeRequests = 0;
				this.$rootScope.$apply();
			},
			() => {
				this.activeRequests--;
				if (this.activeRequests <= 0) {
					NProgress.done();
				}
				if(this.activeRequests < 0) this.activeRequests = 0;
				this.$rootScope.$apply();
			}
		);
		addHTTPCallback(this.HTTPInterface);
		
		addDigestCallback(new AngularJSInterface(
			() => this.$rootScope.$apply()
		));
		
		this.MessageInterface = new MessageInterface(
			message => this.toastr.success(message,'',{progressBar:true}),
			message => this.toastr.warning(message,'',{progressBar:true}),
			message => this.toastr.error(message,'',{progressBar:true}));
		
		addMessageCallback(this.MessageInterface);
		
		
		this.AuthInterface = new AuthInterface(
			() => { }, //onLogin
			() => { }, //onUserGotten
			() => { this.$state.go("base.signIn"); }, //onLogout
		);
		
		addAuthCallback(this.AuthInterface);
		
		
	}
	
	
};