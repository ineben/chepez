'use strict';

const User = require('./User');
const Quota = require('./Quota');
const Doc = require('./Doc');
const Rep = require('./Rep');

module.exports = {
	User : new User(),
	Quota : new Quota(),
	Doc: new Doc(),
	Rep: new Rep()
};