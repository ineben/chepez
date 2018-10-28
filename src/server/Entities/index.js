'use strict';

const User = require('./User');
const Quota = require('./Quota');

module.exports = {
	User : new User(),
	Quota : new Quota()
};