import {default as BaseEntity} from './BaseEntity';

export default class User extends BaseEntity{
	
	constructor(tolerance = 1){
		super("quotas", tolerance);
	}
	
}