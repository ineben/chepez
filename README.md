# Guara

## Lista de comandos disponibles
* start inicia al aplicacion en una instancia de node
* service:start inicia el servicio de pm2
* build:panel compila el panel
* test:panel ejecuta el panel en un servidor de desarrollo
	
## Aspectos tecnicos
* Plataforma
	* NodeJS v10
* Base de datos
	* Cloudant
* Framework para el servidor
	* Fastify
* Framework del panel
	* AngularJS

## Modulos
#### intervals: Contiene las tareas cron de la plataforma
#### logic: Contiene toda la logica y componentes del manejo de la base de datos
#### panel: Contiene el codigo fuente y compilado del panel administrativo
#### server: Contiene el servidor HTTP de la API REST
#### translate: Contiene el traductor
	
## Datos de ejecucion
* El servidor Web de la api escucha el puerto 8082
* El servidor Web del panel escucha el puerto 8081
	
## Datos generales del API HTTP REST	
* La autenticacion se hace mediante JSONWebToken (JWT) en el header Authorization.
* Todas las solicitudes estan validades con JSONSchema, ademas de validaciones internas propias del desarrollo.
* Cualquier solicitud que no cumpla con los parametros especificados arrojara un error 403

## Rutas del API
* \* denota un campo requerido

* Rutas que *no* requieren Authorization
	* /auth/login - Cambia email y password por JWT
		- Metodo
			- POST
		- Cuerpo
			- email *
			- password *
		- Respuesta
			- success
			- mes
			- token
			- expires
	* /translator/:token - Traduce la frase 
		- Metodo
			- GET
		- Parametros
			- token *
		- Consulta
			- phrase *
			- toRegion : del 1 al 20
			- toGrade : del 1 al 4
			- inclusive : boolean
		- Respuesta
			- success
			- mes
			- phrase
* Rutas que *si* requieren Authorization
	* /docs/ - Agrega una palabra
		- Metodo
			- POST
		- Cuerpo
			- base *
			- type *
			- female
			- neutral
			- plural
			- living
			- profession
		- Respuesta
			- success
			- mes
	* /docs/word/:word - Agrega un sinonimo a la palabra seleccionada
		- Metodo
			- POST
		- Parametros
			- word
		- Cuerpo
			- region *
			- grado *
			- palabra *  
			- female
			- neutral
			- plural
		- Respuesta
			- success
			- mes
	* /docs/word/:word/:id - Edita el sinonimo seleccionado a la palabra seleccionada
		- Metodo
			- PUT
		- Parametros
			- word
			- id
		- Cuerpo
			- region 
			- grado
			- palabra  
			- female
			- neutral
			- plural
		- Respuesta
			- success
			- mes
	* /docs/word/:word/:id - Elimina el sinonimo seleccionado de la palabra seleccionada
		- Metodo
			- DELETE
		- Parametros
			- word
			- id
		- Respuesta
			- success
			- mes
	* /docs/:id - Edita la palabra seleccionada
		- Metodo
			- PUT
		- Parametros
			- id
		- Cuerpo
			- base 
			- type 
			- female
			- neutral
			- plural
			- living
			- profession
		- Respuesta
			- success
			- mes
			- item
	* /docs/:id - Elimina la palabra seleccionada
		- Metodo
			- DELETE
		- Parametros
			- id
		- Respuesta
			- success
			- mes
			- item
	* /docs/:id - Recupera la palabra seleccionada
		- Metodo
			- GET
		- Parametros
			- id
		- Respuesta
			- success
			- mes
			- item
	* /docs/searchWord - Recupera la palabra seleccionada
		- Metodo
			- GET
		- consulta
			- word *
		- Respuesta
			- success
			- items
	* /quotas/ - Agrega una cuota de uso del servicio
		- Metodo
			- POST
		- Cuerpo
			- user *
			- total *
			- reset *
		- Respuesta
			- success
			- mes
	* /quotas/:id - Recupera los datos del usuario seleccionado
		- Metodo
			- GET
		- Parametros
			- id
		- Respuesta
			- success
			- mes
			- item
	* /quotas/:id - Elimina los datos de la cuota seleccionada
		- Metodo
			- DELETE
		- Parametros
			- id
		- Respuesta
			- success
			- mes
	* /quotas/:id - Edita los datos de la cuota seleccionada
		- Metodo
			- PUT
		- Parametros
			- id
		- Cuerpo
			- total
			- valid
			- reset
		- Respuesta
			- success
			- mes
			- item
	* /quotas/search - Busca cuotas
		- Metodo
			- GET
		- Consulta
			- user
			- total
			- valid
			- reset
		- Respuesta
			- success
			- mes
			- items
	* /users/ - Agrega un usuario
		- Metodo
			- POST
		- Cuerpo
			- password *
			- email *
			- priv *
		- Respuesta
			- success
			- mes
	* /users/ - Edita el usuario autenticado
		- Metodo
			- PUT
		- Cuerpo
			- password
			- email
		- Respuesta
			- success
			- mes
	* /users/ - Recupera los datos del usuario autenticado
		- Metodo
			- GET
		- Respuesta
			- success
			- mes
			- item
	* /users/:id - Recupera los datos del usuario seleccionado
		- Metodo
			- GET
		- Parametros
			- id
		- Respuesta
			- success
			- mes
	* /users/:id - Elimina los datos del usuario seleccionado
		- Metodo
			- DELETE
		- Parametros
			- id
		- Respuesta
			- success
			- mes
	* /users/:id - Edita los datos del usuario seleccionado
		- Metodo
			- PUT
		- Parametros
			- id
		- Cuerpo
			- password
			- email
			- priv
		- Respuesta
			- success
			- mes
			- item
	* /users/search - Busca usuarios
		- Metodo
			- GET
		- Consulta
			- priv
			- email
		- Respuesta
			- success
			- mes
			- item
	