const translate = require("./src/translate");



translate("El joven trabaja", 1)
.then( (translation) => {
	console.log(translation);
}).catch( (e) => {
	console.log(e);
})