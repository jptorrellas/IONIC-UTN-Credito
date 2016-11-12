<?php 
/**
*************************************
* WEB SERVICE                       *
*************************************
* Version: 1.0.2                    *
* Fecha:   09/11/2016               *
* Autor:   Juan Pablo Torrellas     *
*************************************
*/	
	
// Incluye todos los archivos necesarios
require_once('../ws/includeAll.php');

// RECIBE PETICION
$jsonObjeto = file_get_contents("php://input");

$objRecibido = json_decode($jsonObjeto);

// Array que se utilizará para devolver mensaje y data al cliente
$respuesta = [];
$respuesta['mensaje'] = '';
$respuesta['datos'] = '';

// Instancia un objeto Crud
$crud = new Crud;
/**
 * AYUDA FUNCIONES CRUD: TODOS LOS PARAMETROS SON STRING
 * 
 * insert($tabla, $campos, $valores)
 * select($tabla, $campos [, $condiciones])
 * update($tabla, $camposYvalores [, $condiciones])
 * delete($tabla [, $condiciones])
 * selectJoin($campos, $tabla1, $tabla2 [, $condiciones])
 * selectList($tabla, $campos [, $condiciones])
*/

switch ($objRecibido->accion) {
	
	case 'login':

		$usuario = $crud->select("usuarios", "*", "mail = '$objRecibido->mail' && password = '$objRecibido->password' && estado = 1");

		if ($usuario != false && $usuario != null) {

			// TOKEN
			$key = 'tokenutncredito';
			$time = time();
			$token = array(
				"id" => $usuario->id,
				"mail" => $usuario->mail,
				"credito" => $usuario->credito,
				"fecha_update_saldo" => $usuario->fecha_update_saldo,
				'iat' => $time, // Tiempo que inició el token
    			'exp' => $time + (60*60) // Tiempo que expirará el token (+1 hora)
			);
			$jwt = Firebase\JWT\JWT::encode($token, $key, 'HS256');

			$array['tokenutncredito'] = $jwt;
			echo json_encode($array);
		}
		else {
			echo "401";
		}
		break;

	case 'registro':

		$usuario = $crud->select("usuarios", "*", "mail = '$objRecibido->mail'");
		// Si existe un usuario con ese mail devuelve un error
		if ($usuario != null) {
			$respuesta['mensaje'] = 'error';
			echo json_encode($respuesta);
		}
		else {
			if($crud->insert("usuarios", "mail, password", "'$objRecibido->mail', '$objRecibido->password1'")) {
				$respuesta['mensaje'] = 'ok';
				echo json_encode($respuesta);
			}
			else {
				$respuesta['mensaje'] = 'error';
				echo json_encode($respuesta);
			}
		}
		break;

	case 'traeUsuariosReceptores':
		
		$usuariosReceptores = $crud->selectList("usuarios", "id as id, mail as mail", "id != '$objRecibido->idUsuarioEmisor'");

		if ($usuariosReceptores != false && $usuariosReceptores != null) {
			// Devuleve lista de usuarios receptores
			$respuesta['mensaje'] = 'ok';
			$respuesta['datos'] = $usuariosReceptores;
			echo json_encode($respuesta);
		}
		else {
			$respuesta['mensaje'] = 'error';
			echo json_encode($respuesta);
		}
		break;

	case 'recargaCredito':

		$tarjeta = $crud->select("tarjetas", "*", "codigo = '$objRecibido->codigoTarjeta'");

			if ($tarjeta != null && $tarjeta != false) {
				
				if ($tarjeta->estado == 0) {
					$respuesta['mensaje'] = 'error. Tarjeta ya usada.';
					echo json_encode($respuesta);
				}
				else {
					// Guarda el registro de la carga
					$crud->insert("registro_recargas", "id_tarjeta, id_usuario, dispositivo", "'$tarjeta->id', '$objRecibido->idUsuario', '$objRecibido->dispositivo'");
					// Desactiva tarjeta
					//$crud->update("tarjetas", "estado = 0", "id = '$tarjeta->id'"));
						
					// Actualiza saldo y fecha actualizacion de saldo (esto último lo hace automaticamente la BD al hacer un update sobre el registro)
				    if ($crud->update("usuarios", "credito = credito + '$tarjeta->credito'", "id = '$objRecibido->idUsuario'")) {
				    	// Toma saldo actualizado y fecha de update de saldo de BD y lo devuelve al cliente
				    	$usuario = $crud->select("usuarios", "*", "id = '$objRecibido->idUsuario'");
				    	if ($usuario) {
				    		$respuesta['mensaje'] = 'ok';
							$respuesta['datos'] = $usuario;
							echo json_encode($respuesta);
				    	}
				    }
				}
			}
			else {					
				$respuesta['mensaje'] = 'error. Tarjeta no existe.';
				echo json_encode($respuesta);
			}
		break;

	case 'pasaCredito':

		// Busca el usuario receptor por el id recibido
		$usuarioReceptor = $crud->select("usuarios", "*", "id = '$objRecibido->idUsuarioReceptor'");

		if ($usuarioReceptor != null && $usuarioReceptor != false) {
			
			// Guarda el registro del pasaje de crédito
			$crud->insert("registro_transferencias", "id_usuario_emisor, id_usuario_receptor, importe, dispositivo", "'$objRecibido->idUsuarioEmisor', '$objRecibido->idUsuarioReceptor', '$objRecibido->importe', '$objRecibido->dispositivoUsuarioEmisor'");
			
			// Actualiza saldo (suma importe recibido) y fecha de ultima carga de usuario receptor
		    if ($crud->update("usuarios", "credito = credito + '$objRecibido->importe'", "id = '$objRecibido->idUsuarioReceptor'")) {
		    	
		    	// // Actualiza saldo (resta importe recibido) de usuario emisor
		    	if ($crud->update("usuarios", "credito = credito - '$objRecibido->importe'", "id = '$objRecibido->idUsuarioEmisor'")) {

			    	// Toma saldo actualizado y fecha de update de saldo de BD y lo devuelve al cliente
			    	$usuario = $crud->select("usuarios", "*", "id = '$objRecibido->idUsuarioEmisor'");
			    	if ($usuario != null && $usuario != false) {
			    		$respuesta['mensaje'] = 'ok';
						$respuesta['datos'] = $usuario;
						echo json_encode($respuesta);
			    	}
			    }
			    else {
			    	$respuesta['mensaje'] = 'error. Problema al actualizar saldo cliente actual.';
					echo json_encode($respuesta);
			    }
		    }
		    else {
		    	$respuesta['mensaje'] = 'error. Problema al actualizar saldo cliente beneficiario.';
				echo json_encode($respuesta);
		    }

		}
		else {					
			$respuesta['mensaje'] = 'error. Cliente beneficiario no existe.';
			echo json_encode($respuesta);
		}

		break;
	
	case 'actualizaSaldo':
		
		// Toma saldo actualizado y fecha de update de saldo de BD y lo devuelve al cliente
    	$usuario = $crud->select("usuarios", "*", "id = '$objRecibido->idUsuario'");
    	if ($usuario != null && $usuario != false) {
    		$respuesta['mensaje'] = 'ok';
			$respuesta['datos'] = $usuario;
			echo json_encode($respuesta);
    	}
    	else {
    		$respuesta['mensaje'] = 'error';
			echo json_encode($respuesta);
    	}
    	
    	break;

    case 'actualizaListaHistorial':

    	if (isset($objRecibido->idUsuario)) {
    		$tablaRegistro = '';
    		$condicion = null;
    		$join = false;

    		switch ($objRecibido->reporte) {
    			
    			case 'mis recargas':
    				$tabla1 = 'registro_recargas';
    				$tabla2 = 'tarjetas';
    				$campos = 'registro_recargas.fecha, registro_recargas.dispositivo, tarjetas.credito';
    				$condicion = "registro_recargas.id_tarjeta = tarjetas.id WHERE registro_recargas.id_usuario = '$objRecibido->idUsuario' ORDER BY registro_recargas.fecha DESC";
    				$join = true;
    				break;

    			case 'mis transferencias enviadas':
    				$tabla1 = 'registro_transferencias';
    				$tabla2 = 'usuarios';
    				$campos = 'registro_transferencias.fecha, registro_transferencias.importe, usuarios.mail';
    				$condicion = "registro_transferencias.id_usuario_receptor = usuarios.id WHERE registro_transferencias.id_usuario_emisor = '$objRecibido->idUsuario' ORDER BY registro_transferencias.fecha DESC";
    				$join = true;
    				break;

    			case 'mis transferencias recibidas':
    				$tabla1 = 'registro_transferencias';
    				$tabla2 = 'usuarios';
    				$campos = 'registro_transferencias.fecha, registro_transferencias.importe, usuarios.mail';
    				$condicion = "registro_transferencias.id_usuario_emisor = usuarios.id WHERE registro_transferencias.id_usuario_receptor = '$objRecibido->idUsuario' ORDER BY registro_transferencias.fecha DESC";
    				$join = true;
    				break;
    			
    			default:
    				# code...
    				break;
    		}

    		if ($join == false) {
    			// Toma lista
		    	$listaElementos = $crud->selectList("$tablaRegistro", "*", "$condicion");
		    	if ($listaElementos != null && $listaElementos != false) {

		    		$respuesta['mensaje'] = 'ok';
					$respuesta['datos'] = $listaElementos;
					echo json_encode($respuesta);
		    	}
		    	else {
		    		$respuesta['mensaje'] = 'error';
					echo json_encode($respuesta);
		    	}
    		}
    		else {
    			$listaElementos = $crud->selectJoin("$campos", "$tabla1", "$tabla2", "$condicion");
		    	if ($listaElementos != null && $listaElementos != false) {

		    		$respuesta['mensaje'] = 'ok';
					$respuesta['datos'] = $listaElementos;
					echo json_encode($respuesta);
		    	}
		    	else {
		    		$respuesta['mensaje'] = 'error';
					echo json_encode($respuesta);
		    	}
    		}    		
    	}
    	break;

	default:
		echo "error";
		break;
}

?>