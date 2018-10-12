const translate = require("./src/translate");

const entradas = [
	["Los jovenes son fuertes", "cambio de region:", false],
	["Mis hijos son lindos", "filtro de inclusividad:", true],
	["Mis lindos hijos son lindos", "Con adjetivos de ambos lados del sujeto:", true],
	["Mis mesas son lindas", "Filtro de inclusiviad con un sujeto no viviente:", true],
	["Mis mesas son lindas y mis hijos son lindos", "Filtro de inclusiviad con sujeto viviente y no viviente:", true],
	["Mis hijas son lindas", "sin filtro de inclusividad:", false]
];

for(const entrada of entradas){
	translate(entrada[0], 1, null, null, entrada[2])
	.then( (translation) => {
		console.log(entrada[1], translation);
	}).catch( (e) => {
		console.log(e);
	})	
}