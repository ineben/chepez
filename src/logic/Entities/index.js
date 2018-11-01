'use strict';

const User = require('./User');
const Quota = require('./Quota');
const Doc = require('./Doc');

module.exports = {
	User : new User(),
	Quota : new Quota(),
	Doc: new Doc()
};