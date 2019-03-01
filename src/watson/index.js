const AssistantV2 = require('watson-developer-cloud/assistant/v2');
const Response = require('../logic/Entities/_Response');
const {sinonimSchema} = require('../logic/schemas/doc');
const translator = require('../guara/translate');


const assistant = new AssistantV2({
	username: 'apikey',
	password: 'dqcrdCnMwKT9jQRJeffssYo2Hk_3giqKeniGKKnYTkHl',
	url: 'https://gateway.watsonplatform.net/assistant/api/',
	version: '2018-09-19'
});

module.exports = {
	createSession(){
		return new Promise((resolve, reject) => {
			assistant.createSession({
				assistant_id : "6ec28271-f39d-4f02-8b0f-d9025966c364"
			}, (err, response) => {
				if(err){
					console.log(err);
					resolve(new Response(false, err));
				}else{
					resolve(new Response(true, response.session_id));
				}
			});
		});
	},
	message(text, session_id){
		return new Promise((resolve, reject) => {			
			assistant.message(
				{
					input: {text},
					assistant_id: '6ec28271-f39d-4f02-8b0f-d9025966c364',
					session_id: session_id
				},
				async (err, response) => {
					if (err) {
						console.log(err);
						resolve(new Response(false, err));
					} else {
						let output = response.output.generic[0].text;
						
						let intentFound = false;
						
						for(const intent of response.output.intents){
							if(intent.intent == "traducir"){
								
								const inputs = [], countries = [], countriesNames = [], grados = [], gradosNames = [];
								let inclusive = false;
								
								for(const entity of response.output.entities){
									switch(entity.entity){
										case "input":
											for(const group of entity.groups){
												inputs.push(text.substr(group.location[0], group.location[1]-group.location[0]).replace(/"/g, ``));
											}
											break;
										case "idioma":
											for(const region of sinonimSchema.region._$options){
												if(region.option.toLowerCase() == entity.value.toLowerCase()){
													if(countries.indexOf(region.value) < 0){
														countries.push(region.value);
														countriesNames.push(text.substr(entity.location[0], entity.location[1] - entity.location[0]));
													}
													break;
												}
											}
											break;
										case "grado":
											for(const grado of sinonimSchema.grado._$options){
												if(grado.option.toLowerCase() == entity.value.toLowerCase()){
													if(grados.indexOf(grado.value) < 0){
														grados.push(grado.value);
														gradosNames.push(text.substr(entity.location[0], entity.location[1] - entity.location[0]));
													}
													break;
												}
											}
											break;
										case "inclusivo":
											inclusive = true;
											break;
									}
								}
								
								const promises = [], promiseName = [];
								
								if(inputs.length > 0 && countries.length > 0 && grados.length > 0){
									for(const input of inputs){
										for(const country in countries){
											for(const grado in grados){
												promiseName.push(`Traducido "${input}" a <b>${countriesNames[country]}</b> <b>${gradosNames[grado]}</b> <b>${inclusive ? "inclusivo" : "" }</b>: `);
												promises.push(translator(input, countries[country], grados[grado], null, inclusive));
											}
										}
									}
									
									const results = await Promise.all(promises);
									const textResults = [];
									
									for(const key in results){
										textResults.push(`${promiseName[key]} ${results[key]}`);
									}
									
									output = textResults.join(`<br>`);
								}else
									output = `Por favor envia, el texto a traducir, el pais de destino y el grado de formalidad`;
							}
						}
						
						resolve(new Response(true, output));
					}
				}
			);
		});
	}
};