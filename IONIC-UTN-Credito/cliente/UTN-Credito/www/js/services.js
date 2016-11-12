angular.module('starter.controllers')
// Mi Factory para usuario
.factory('usuarioFactory', function () {
	// Objeto JSON respuesta utilizado para todas las respuestas al controller.
	var respuesta = {};
	
	return {
 		// Objetos, almacena los datos del usuario.
 		payload : {},
 		dispositivo: {},
 		password : {},

		validaFormUsuario : function (data){

			var arrayValidaciones= [];
			var mensajeValidaciones="";

			// Validaciones
			// Validación Mail					
			if (data.mail == "" || data.mail == null || !(/\S+@\S+\.\S+/.test(data.mail)) ) {
				arrayValidaciones.push("e-mail inválido");
			}
			// Validación Password Form Login
			if (data.password) {
				if (data.password == "" || data.password == null) {
					arrayValidaciones.push("contraseña inválida");
				}
			}			
			// Validación Password Form Registro
			if (data.password1) {
				if (data.password1 == "" || data.password1 == null || data.password2 == "" || data.password2 == null) {
					arrayValidaciones.push("contraseña inválida");
				}
				if (data.password1 != data.password2) {
					arrayValidaciones.push("Las contraseñas deben ser iguales");
				}
			}
				
			if (arrayValidaciones.length > 0) {
				for (var i = 0; i < arrayValidaciones.length; i++) {
					if (i == arrayValidaciones.length-1) {
						mensajeValidaciones = mensajeValidaciones+arrayValidaciones[i]+".";
					}
			  	else{
			    		mensajeValidaciones = mensajeValidaciones+arrayValidaciones[i]+", ";
			 		}
				}

				respuesta.estado = false;
				respuesta.mensaje = "Error: "+mensajeValidaciones;
				return respuesta;
			}
			if (arrayValidaciones.length == 0) {
				respuesta.estado = true;
				respuesta.mensaje = "";
				return respuesta;
			}
		},

		validaFormPasaCredito : function (data){

			var arrayValidaciones= [];
			var mensajeValidaciones="";

			// Validaciones				
			// Validación Importe
			if (data.importe == "" || data.importe == null || !(/^[0-9]+([.][0-9]+)?$/.test(data.importe)) ) {
				arrayValidaciones.push("importe inválido");
			}
			
			if (arrayValidaciones.length > 0) {
				for (var i = 0; i < arrayValidaciones.length; i++) {
					if (i == arrayValidaciones.length-1) {
						mensajeValidaciones = mensajeValidaciones+arrayValidaciones[i]+".";
					}
			  	else{
			    		mensajeValidaciones = mensajeValidaciones+arrayValidaciones[i]+", ";
			 		}
				}

				respuesta.estado = false;
				respuesta.mensaje = "Error: "+mensajeValidaciones;
				return respuesta;
			}
			if (arrayValidaciones.length == 0) {
				respuesta.estado = true;
				respuesta.mensaje = "ok";
				return respuesta;
			}
		}
 	}
})

.service('usuarioService', function($http, URLServidor){
	// Objeto JSON respuesta utilizado para todas las respuestas al controller.
	var respuesta = {};

	this.registro = function(data){

		var urlCompleta = URLServidor + "usuarioService.php";

    	return $http.post(urlCompleta, data,  { timeout: 10000 })
    	.then(
  			function(retorno){ // Función a ejecutarse en caso de éxito        
    			if (retorno.data.mensaje == "ok") {
    				respuesta.estado = true;
	    			respuesta.mensaje = 'Usuario Registrado. Ya puede acceder al sistema :)';

	    			return respuesta;
    			}
    			if (retorno.data.mensaje == "error") {
    				respuesta.estado = false;
    				respuesta.mensaje = "ERROR: Ya existe el usuario.";
    				return respuesta;
    			}
    			if (retorno.data.mensaje != "ok" && retorno.data != "error") {
    				respuesta.estado = false;
    				respuesta.mensaje = "ERROR DESCONOCIDO";
    				return respuesta;	
    			}	
  			},
  			function(retorno){ // Función a ejecutarse en caso de fallo
    			respuesta.estado = false;
    			respuesta.mensaje = "ERROR: Problema de conexion con el servidor.";
    			return respuesta;
  			}
    	);
	};

	this.recargaCredito = function(data){

		var urlCompleta = URLServidor + "usuarioService.php";
    	
    	return $http.post(urlCompleta, data,  { timeout: 10000 })
    	.then(
  			function(retorno){ // Función a ejecutarse en caso de éxito   
    			if (retorno.data.mensaje == "ok") {
    				respuesta.estado = true;
	    			respuesta.mensaje = 'Recarga realizada! :)';
	    			respuesta.datos = retorno.data.datos;
	    			return respuesta;
    			}
    			if (retorno.data.mensaje == "error. Tarjeta ya usada.") {
    				respuesta.estado = false;
    				respuesta.mensaje = "ERROR: Tarjeta ya usada.";
    				respuesta.datos = 'error';
    				return respuesta;
    			}
    			if (retorno.data.mensaje == "error. Tarjeta no existe.") {
    				respuesta.estado = false;
    				respuesta.mensaje = "ERROR: Tarjeta no válida.";
    				respuesta.datos = 'error';
    				return respuesta;
    			}
    			if (retorno.data.mensaje != "ok" && retorno.data != "error") {
    				respuesta.estado = false;
    				respuesta.mensaje = "ERROR DESCONOCIDO";
    				respuesta.datos = 'error';
    				//console.log(retorno.data);
    				return respuesta;	
    			}	
  			},
  			function(retorno){ // Función a ejecutarse en caso de fallo
    			respuesta.estado = false;
    			respuesta.mensaje = "ERROR: Problema de conexion con el servidor.";
    			respuesta.datos = 'error';
    			return respuesta;
  			}
    	);
	};
	
	this.pasaCredito = function(data){

		var urlCompleta = URLServidor + "usuarioService.php";

    	return $http.post(urlCompleta, data,  { timeout: 10000 })
    	.then(
  			function(retorno){ // Función a ejecutarse en caso de éxito   
    			if (retorno.data.mensaje == "ok") {
    				respuesta.estado = true;
	    			respuesta.mensaje = 'Operación exitosa! :)';
	    			respuesta.datos = retorno.data.datos;
	    			return respuesta;
    			}
    			
    			if (retorno.data.mensaje == "error. Cliente beneficiario no existe.") {
    				respuesta.estado = false;
    				respuesta.mensaje = "ERROR: El e-mail ingresado no existe. Compruebe el e-mail del beneficiario y vuelva a intentarlo.";
    				respuesta.datos = 'error';
    				return respuesta;
    			}
    			if (retorno.data.mensaje == "error. Problema al actualizar saldo cliente actual.") {
    				respuesta.estado = false;
    				respuesta.mensaje = "ERROR: Problema al actualizar saldo cliente actual.";
    				respuesta.datos = 'error';
    				return respuesta;
    			}
    			if (retorno.data.mensaje == "error. Problema al actualizar saldo cliente beneficiario.") {
    				respuesta.estado = false;
    				respuesta.mensaje = "ERROR: Problema al actualizar saldo cliente beneficiario.";
    				respuesta.datos = 'error';
    				return respuesta;
    			}

    			if (retorno.data.mensaje != "ok" && retorno.data != "error") {
    				respuesta.estado = false;
    				respuesta.mensaje = "ERROR DESCONOCIDO";
    				respuesta.datos = 'error';
    				console.log(retorno.data);
    				return respuesta;	
    			}	
  			},
  			function(retorno){ // Función a ejecutarse en caso de fallo
    			respuesta.estado = false;
    			respuesta.mensaje = "ERROR: Problema de conexion con el servidor.";
    			respuesta.datos = 'error';
    			return respuesta;
  			}
    	);
	};

	this.traeUsuariosReceptores = function(data){

		var urlCompleta = URLServidor + "usuarioService.php";

    	return $http.post(urlCompleta, data,  { timeout: 10000 })
	    .then(
			function(retorno){ // Función a ejecutarse en caso de éxito   ;
				if (retorno.data.mensaje == "ok") {
					respuesta.estado = true;
					respuesta.mensaje = 'Lista actualizada';
					for (var i = 0; i < retorno.data.datos.length; i++) {
						retorno.data.datos[i].id = parseInt(retorno.data.datos[i].id);
					}
					respuesta.datos = retorno.data.datos;
					return respuesta;
				}

				if (retorno.data.mensaje == "error") {
					respuesta.estado = false;
					respuesta.mensaje = "ERROR: No se encuentran usuarios.";
					respuesta.datos = 'error';
					return respuesta;
				}
				if (retorno.data.mensaje != "ok" && retorno.data != "error") {
					respuesta.estado = false;
					respuesta.mensaje = "ERROR DESCONOCIDO";
					respuesta.datos = 'error';
					return respuesta;	
				}	
			},
			function(retorno){ // Función a ejecutarse en caso de fallo
				respuesta.estado = false;
				respuesta.mensaje = "ERROR: Problema de conexion con el servidor.";
				respuesta.datos = 'error';
				return respuesta;
			}
		);
	};

	this.actualizaSaldo = function(data){

		var urlCompleta = URLServidor + "usuarioService.php";

    	return $http.post(urlCompleta, data,  { timeout: 10000 })
    	.then(
  			function(retorno){ // Función a ejecutarse en caso de éxito   
    			if (retorno.data.mensaje == "ok") {
    				respuesta.estado = true;
	    			respuesta.mensaje = 'Saldo actualizado';
	    			respuesta.datos = retorno.data.datos;
	    			return respuesta;
    			}
    			if (retorno.data.mensaje == "error") {
    				respuesta.estado = false;
    				respuesta.mensaje = "ERROR: Problema al intentar actualizar el saldo, vuelva a intentarlo.";
    				respuesta.datos = 'error';
    				return respuesta;
    			}
    			if (retorno.data.mensaje != "ok" && retorno.data != "error") {
    				respuesta.estado = false;
    				respuesta.mensaje = "ERROR DESCONOCIDO";
    				respuesta.datos = 'error';
    				return respuesta;	
    			}	
  			},
  			function(retorno){ // Función a ejecutarse en caso de fallo
    			respuesta.estado = false;
    			respuesta.mensaje = "ERROR: Problema de conexion con el servidor.";
    			respuesta.datos = 'error';
    			return respuesta;
  			}
    	);
	};	

	this.actualizaListaHistorial = function(data){

		var urlCompleta = URLServidor + "usuarioService.php";

    	return $http.post(urlCompleta, data,  { timeout: 10000 })
    	.then(
  			function(retorno){ // Función a ejecutarse en caso de éxito
	  			console.log(retorno);
				if (retorno.data.mensaje == "ok") {
					respuesta.estado = true;
	    			respuesta.mensaje = 'Lista actualizada';
	    			respuesta.datos = retorno.data.datos;
	    			return respuesta;
				}

				if (retorno.data.mensaje == "error") {
					respuesta.estado = false;
					respuesta.mensaje = "No tiene historial de "+data.reporte.toUpperCase();+".";
					respuesta.datos = 'error';
					return respuesta;
				}
				if (retorno.data.mensaje != "ok" && retorno.data != "error") {
					respuesta.estado = false;
					respuesta.mensaje = "ERROR DESCONOCIDO";
					respuesta.datos = 'error';
					return respuesta;	
				}	
			},
			function(retorno){ // Función a ejecutarse en caso de fallo
				respuesta.estado = false;
				respuesta.mensaje = "ERROR: Problema de conexion con el servidor.";
				respuesta.datos = 'error';
				return respuesta;
			}
    	);
	};	
})

