//import './scss/app.scss';
import './stylesheets/now-ui-kit.css';
import './stylesheets/style.css';
import 'angular-toastr/dist/angular-toastr.min.css';
import 'moment';
import './javascripts/static.js';
import angular from 'angular';

import fontawesome from "@fortawesome/fontawesome";
import fasUsers from "@fortawesome/fontawesome-free-solid/faUsers";
import fasHome from "@fortawesome/fontawesome-free-solid/faHome";
import fasDollarSign from "@fortawesome/fontawesome-free-solid/faDollarSign";
import fasQuestion from "@fortawesome/fontawesome-free-solid/faQuestion";
import fasInfo from "@fortawesome/fontawesome-free-solid/faInfo";
import fasEdit from "@fortawesome/fontawesome-free-solid/faEdit";
import fasTrash from "@fortawesome/fontawesome-free-solid/faTrash";
import fasChevronDown from "@fortawesome/fontawesome-free-solid/faChevronDown";
import fasArrowUp from "@fortawesome/fontawesome-free-solid/faArrowUp";
import fasKey from "@fortawesome/fontawesome-free-solid/faKey";
import fasUser from "@fortawesome/fontawesome-free-solid/faUser";
import fasSave from "@fortawesome/fontawesome-free-solid/faSave";
import fasTimes from "@fortawesome/fontawesome-free-solid/faTimes";
import fasBook from "@fortawesome/fontawesome-free-solid/faBook";

//import fasQuote from "@fortawesome/fontawesome-free-solid/faQuote";
import fasBold from "@fortawesome/fontawesome-free-solid/faBold";
//import fasItallic from "@fortawesome/fontawesome-free-solid/faItallic";
import fasUnderline from "@fortawesome/fontawesome-free-solid/faUnderline";
import fasStrikethrough from "@fortawesome/fontawesome-free-solid/faStrikethrough";
import fasListUl from "@fortawesome/fontawesome-free-solid/faListUl";
import fasListOl from "@fortawesome/fontawesome-free-solid/faListOl";
//import fasRepeat from "@fortawesome/fontawesome-free-solid/faRepeat";
import fasUndo from "@fortawesome/fontawesome-free-solid/faUndo";
import fasBan from "@fortawesome/fontawesome-free-solid/faBan";
import fasAlignLeft from "@fortawesome/fontawesome-free-solid/faAlignLeft";
import fasAlignRight from "@fortawesome/fontawesome-free-solid/faAlignRight";
import fasAlignCenter from "@fortawesome/fontawesome-free-solid/faAlignCenter";
import fasAlignJustify from "@fortawesome/fontawesome-free-solid/faAlignJustify";
import fasIndent from "@fortawesome/fontawesome-free-solid/faIndent";
import fasOutdent from "@fortawesome/fontawesome-free-solid/faOutdent";
import fasLink from "@fortawesome/fontawesome-free-solid/faLink";
 
fontawesome.library.add(
//fasQuote,
fasBold,
//fasItallic,
fasUnderline,
fasStrikethrough,
fasListUl,
fasListOl,
//fasRepeat,
fasUndo,
fasBan,
fasAlignLeft,
fasAlignRight,
fasAlignCenter,
fasAlignJustify,
fasIndent,
fasOutdent,
fasLink,
fasBook,
fasSave, fasTimes, fasArrowUp, fasUser, fasKey, fasUsers, fasHome, fasDollarSign, fasQuestion, fasInfo, fasEdit, fasTrash, fasChevronDown);



angular.lowercase = str => angular.isString(str) ? str.toLowerCase() : str;
import uirouter from '@uirouter/angularjs';
import dirPagination from 'angular-utils-pagination';
import ngFileUpload from 'ng-file-upload';
import ngAnimate from 'angular-animate';
import ngResource from 'angular-resource';
import 'textangular/dist/textAngular-sanitize';
//import textAngular from 'textangular';
import toastr from 'angular-toastr';
import 'angular-toastr/dist/angular-toastr.tpls.js';
import 'sprintf-js';
import sprintf from 'sprintf-js/src/angular-sprintf';
import 'angular-i18n/angular-locale_es';
import angularInview from 'angular-inview';


import config from './App/config';


import AddWordController from './App/Controllers/AddWordController';
import RootController from './App/Controllers/RootController';
import LayoutController from './App/Controllers/LayoutController';
import LoginController from './App/Controllers/LoginController';
import IndexController from './App/Controllers/IndexController';
import IndexTRController from './App/Controllers/IndexTRController';
import UsersController from './App/Controllers/UsersController';
import ProfileController from './App/Controllers/ProfileController';
import QuotasController from './App/Controllers/QuotasController';
import WordsController from './App/Controllers/WordsController';
import WordController from './App/Controllers/WordController';

const app = angular.module('app', [
	uirouter,
	angularInview,
	dirPagination, 
	ngFileUpload, 
	ngAnimate, 
	ngResource, 
	'ngSanitize', 
	//textAngular,
	toastr,
	'sprintf'
]);

app.config(config);
app.controller("addWord", AddWordController);
app.controller("root", RootController);
app.controller("layout", LayoutController);
app.controller("login", LoginController);
app.controller("index", IndexController);
app.controller("indexTR", IndexTRController);
app.controller("users", UsersController);
app.controller("profile", ProfileController);
app.controller("quotas", QuotasController);
app.controller("words", WordsController);
app.controller("word", WordController);