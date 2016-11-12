#IONIC-UTN-Crédito#
Aplicación mobile realizada con Ionic Framework para la gestión de crédito (dinero) dentro de un sistema.

##Incluye:##

###1.	Cliente###

####1.1    Pantallas:####

*	<b>Login</b>
		
	<img src="http://jptorrellas.hol.es/img/login.jpg" width="360px" height="640px">

	*	Login de usuario (con token).
	*	Dos botones de acceso rápido con usuarios predeterminados.
	*	Registro de usuario.

*	<b>Mi Crédito</b>
	
	<img src="http://jptorrellas.hol.es/img/micredito.jpg" width="360px" height="640px">

	*	Saldo actual y fecha de última actualización de saldo.
	*	Carga de crédito usando tarjetas de recarga. (utilizando el barcodeScanner del celular o una lista de tarjetas disponibles).
	*	Pasar crédito a otro usuario registrado en el sistema.

*	<b>Historial</b>
	
	<img src="http://jptorrellas.hol.es/img/historial2.jpg" width="360px" height="640px">

	*	Registro de "Mis Recargas".
	*	Registro de "Mis transferencias Enviadas".
	*	Registro de "Mis transferencias Recibidas".
			

####1.2    Por dentro:####
	
*	<b>Uso de TOKEN recibido del Web Service</b>			
				
*	<b>Uso de constantes</b>

	*	Para la URL del servidor
	        	
		archivo: UTN-Credito\www\js\app.js

			// URL SERVIDOR
			// .constant('URLServidor', 'http://localhost/UTN/PPS/PPS-Credito/servidor/services/');
			// .constant('URLServidor', 'http://192.168.0.2/UTN/PPS/PPS-Credito/servidor/services/');
			.constant('URLServidor', 'http://jptorrellas.hol.es/services/');

*	<b>Configuraciones por defecto</b>

	*	Configuración por defecto para el método post de $http // envío y recepción de JSON
	  			
		archivo: UTN-Credito\www\js\app.js
						
			var defaultHTTPHeaders = 
			{
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			};

	  		// Al objeto $http le establecemos sus propiedades por defecto para utilice los headers que definimos arriba
	  		$http.defaults.headers.post = defaultHTTPHeaders;


*	<b>Menús de navegación con state abstract y views</b>

	*	En esta aplicación hay un state abstract para usuario de tipo cliente

		archivo: UTN-Credito\www\js\app.js

	  		// CLIENTE
			.state('app', {
				cache: false,
				url: '/app',
				abstract: true,
				templateUrl: 'templates/menu.html',
				controller: 'AppCtrl'
			})

			.state('app.credito', {
				cache: true,
				url: '/credito',
				views: {
					'menuContent': {
						templateUrl: 'templates/credito.html',
						controller: 'CreditoCtrl'
					}
				}
			})
			...


*	<b>Factory</b>

	*	Para alamcenar los datos del usuario y acceder desde cualquier Controller a esos datos.

		archivo: UTN-Credito\www\js\services.js

	  		.factory('usuarioFactory', function() {
				// Objeto JSON respuesta utilizado para todas las respuestas al controller.
				var respuesta = {};
	
				return {
 					// Objeto JSON datos, almacena los datos del usuario.
 					datos: {},
 					...

	*	Para contener funciones de validación de formularios/campos, utilizando regex (expresiones regulares).

		archivo: UTN-Credito\www\js\services.js
						
			.factory('usuarioFactory', function() {
				// Objeto JSON respuesta utilizado para todas las respuestas al controller.
				var respuesta = {};
	
				return {
 					// Objeto JSON datos, almacena los datos del usuario.
 					datos: {},

			  		validaFormPasaCredito : function(data) {

					var arrayValidaciones = [];
					var mensajeValidaciones = "";

					// Validaciones				
					// Validación Importe
					if (data.importe == "" || data.importe == null || !(/^[0-9]+([.][0-9]+)?$/.test(data.importe))) {
						arrayValidaciones.push("importe inválido");
					}
					if (arrayValidaciones.length > 0) {
						for (var i = 0; i < arrayValidaciones.length; i++) {
							if (i == arrayValidaciones.length -1) {
								mensajeValidaciones = mensajeValidaciones+arrayValidaciones[i] + ".";
							}
							else {
								mensajeValidaciones = mensajeValidaciones+arrayValidaciones[i] + ", ";
							}
						}

						respuesta.estado = false;
						respuesta.mensaje = "Error: " + mensajeValidaciones;
						return respuesta;
					}				
					if (arrayValidaciones.length == 0) {
						respuesta.estado = true;
						respuesta.mensaje = "ok";
						return respuesta;
					}
				}
				...


*	<b>Service</b>

	*	Para contener todas las consultas al Web Service.

		archivo: UTN-Credito\www\js\services.js

	  		.service('usuarioService', function ($http, URLServidor) {
				// Objeto JSON respuesta utilizado para todas las respuestas al controller.
				var respuesta = {};

				this.login = function (data) {
					var urlCompleta = URLServidor + "usuarioService.php";

					return $http.post(urlCompleta, data,  { timeout: 10000 })
					.then(
						function(retorno) { // Función a ejecutarse en caso de éxito  
							//console.log(retorno); 
							if (retorno.data.mensaje == "ok") {
								respuesta.estado = true;
								respuesta.datos = retorno.data.datos;	    		
								return respuesta;
							}
							if (retorno.data.mensaje == "error") {
								respuesta.estado = false;
								respuesta.mensaje = "ERROR: Usuario o Password incorrecto, vuelva a intentarlo.";
								return respuesta;
							}	
						},
						function(retorno) { // Función a ejecutarse en caso de fallo
							respuesta.estado = false;
							respuesta.mensaje = "ERROR: Problema de conexion con el servidor. Vuelva a intentarlo pasados unos minutos.";
							respuesta.datos = 'error';
							return respuesta;
						}
					);
				};
				...

- - -


###2.	Servidor:###

####2.1	Web Service version 1.0.2####


- - -


###3.	Recursos:###
	
####3.1	Tarjetas de recarga (tarjetas recarga.jpg)####
	
####3.2	Base de Datos mySql (DB.utn_credito.sql)####


- - -

	
##Modo de Uso:

<b>Antes que nada</b>, lo primero que debe hacer es <b>construir la apk</b>:
	
	cd UTN-Credito
	
	ionic build adroid

###<b>1º Forma de uso:</b>###
	
*	Probar la aplicación <b>desde un celular conectando con servidor en la nube</b> (actualmente online y funcionando).
		
	Una vez construida la apk ya está lista para probar en un celular, sin modificar nada de código.
		
###<b>2ª Forma de uso:</b>###
	
*	Probar la aplicación <b>desde el navegador (con ionic serve) conectando con servidor en la nube</b> (actualmente online y funcionando).
		
	Como la aplicación está diseñada para escanear los códigos de las tarjetas de recarga desde un celular, si se quiere 	
	usar desde un navegador no va a funcionar, con lo cual para poder probar la recarga sin escaner, debe hacer lo siguiente:
		
	Dentro del archivo "UTN-Credito\www\js\controllers.js"
		
	COMENTAR: De la línea 204 a la línea 249.
		
	DESCOMENTAR: De la línea 254 a la línea 293.
		
###<b>3ª Forma de uso:</b>###
	
*	Probar la aplicación <b>desde un celular conectando con servidor local o en la nube</b> (servidor suyo).
		
	Debe realizar lo siguiente:
		
	1.	Agregar la base de datos provista (recursos/DB.utn_credito.sql) a su motor de BD.
			
	2.	Modificar la constante URLServidor por la ruta donde tiene alojada la carpeta "/services"
			
		archivo: UTN-Credito\www\js\app.js

			// URL SERVIDOR
			// .constant('URLServidor', 'http://localhost/UTN/PPS/PPS-Credito/servidor/services/');
			// .constant('URLServidor', 'http://192.168.0.2/UTN/PPS/PPS-Credito/servidor/services/');
			.constant('URLServidor', 'http://jptorrellas.hol.es/services/');
				
	3.	Modificar la URL del "$authProvider.loginUrl" por la ruta "completa" donde tiene alojado su archivo "usuarioService.php"
		
		archivo: UTN-Credito\www\js\app.js

			// URL
  			// VERIFICAR BIEN LA RUTA COMPLETA ELEGIDA Y COLOCARLA DEBAJO !!!
  			//$authProvider.loginUrl = "http://localhost/UTN/PPS/PPS-Credito/servidor/services/usuarioService.php";
			$authProvider.loginUrl = "http://jptorrellas.hol.es/services/usuarioService.php";
			
###<b>4ª Forma de uso:</b>###
	
*	Probar la aplicación <b>desde el navegador (con ionic serve) conectando con servidor local o en la nube</b> (servidor suyo).
		
	Debe realizar los cambios explicados en la 2º Forma y luego los cambios explicados en la 3º Forma.
