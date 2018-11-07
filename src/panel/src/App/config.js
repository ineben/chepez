export default function routing(paginationTemplateProvider, $locationProvider, toastrConfig, $stateProvider, $urlRouterProvider) {
	'ngInject';
	
	
	paginationTemplateProvider.setString(require('./Views/Directives/dirPagination.pug'));
	
	$locationProvider.html5Mode({
		enabled: true
	});
	
	angular.extend(toastrConfig, {
		timeOut: 10000,
	});
	
	
    $urlRouterProvider.otherwise('/');
	
	$stateProvider
	.state('base', {
		abstract: true,
		template: require( './Views/layout.pug')
	})
	.state('base.index',{
		url: '/',
		template: require( './Views/index.pug')
	})
	.state('base.signIn',{
		url: '/signIn',
		template: require( './Views/login.pug')
	})
	.state('base.users',{
		url: '/users',
		template: require( './Views/users.pug')
	})
	.state('base.user',{
		url: '/user/:id',
		template: require( './Views/user.pug')
	})
	.state('base.words',{
		url: '/words',
		template: require( './Views/words.pug')
	})
	.state('base.word',{
		url: '/word/:id',
		template: require( './Views/word.pug')
	})
	
}