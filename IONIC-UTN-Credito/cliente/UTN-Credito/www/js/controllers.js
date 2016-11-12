angular.module('starter.controllers', ['ngCordova'])


.controller('AppCtrl', function($scope, $ionicModal, $timeout, $state, ionicToast, usuarioFactory) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Para usar el mail del usuario en el sidemenu
  $scope.usuario = {};
  $scope.usuario.mail = usuarioFactory.payload.mail;

  // Logout
  $scope.logout = function() { 
    // Reenvía a pantalla login
    $state.go('login');
  }
})


.controller('LoginCtrl', function($state, $scope, $cordovaDevice, $auth, $ionicPopup, ionicToast, usuarioService, usuarioFactory) {

  var respuesta = {};

  $scope.loginData = 
  {
    mail: '1@utn.com',
    password : '123123',
    dispositivo : '',
    accion: 'login'
  };

  // Login
  $scope.login = function(){

    document.addEventListener("deviceready", function () {
      usuarioFactory.dispositivo = $cordovaDevice.getModel() + ", " + $cordovaDevice.getPlatform() + ", " + $cordovaDevice.getVersion();
    }, false); 
    
    // Validación. Si se testea en navegador, no funciona el plugin $cordovaDevice. De esta forma almacena el valor NO DETECTADO.
    if (!angular.isString(usuarioFactory.dispositivo)) {
      usuarioFactory.dispositivo = "no detectado";
    }

    // Guarda dato de dispositivo.
    $scope.loginData.dispositivo = usuarioFactory.dispositivo;
    // $scope.loginData.accion = 'login';

    // Valida que los datos intruducidos sean correctos.
    respuesta = usuarioFactory.validaFormUsuario($scope.loginData);

    if (respuesta.estado == true) {          

      $auth.login($scope.loginData, { timeout: 10000 })
      .then(
        function(respuesta){
          if ($auth.isAuthenticated()) {
            
            // Guarda datos de usuario en usuarioFactory.payload
            var payload = $auth.getPayload();
            // Guarda el password en el usuarioFactory
            usuarioFactory.password = $scope.loginData.password;
            $scope.loginData = {};
            usuarioFactory.payload = payload;
            $state.go('app.credito');
          }
          else {
            $scope.loginData = {};
            ionicToast.show('usuario o contraseña incorrecto.', 'middle', false, 2500);
          }
        },
        function(respuesta){
          ionicToast.show('ERROR: Problema de conexion con el servidor.', 'middle', false, 2500);
        })

        .catch(function(respuesta){
            // Si ha habido errores llegamos a esta parte
            ionicToast.show('ERROR: Problema de conexion con el servidor.', 'middle', false, 2500); 
            $scope.loginData = {};
        }
      );
    }
    else {
      ionicToast.show(respuesta.mensaje, 'middle', false, 2500);
    }

    $scope.btnLoginDisabled = false;  
  };

  // Registro
  $scope.registro = function() {
    $scope.registroData = {  
      mail: '',
      password1: '',
      password2: '',
      accion: 'registro'
    }

    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      template: '<h6>E-mail:</h6><input type="email" ng-model="registroData.mail" placeholder="Ingrese su e-mail" style="padding-left:20px; margin-bottom:5px;"><h6>Contraseña:</h6><input type="password" ng-model="registroData.password1"  placeholder="Ingrese una contraseña" style="padding-left:20px; margin-bottom:5px;"><input type="password" ng-model="registroData.password2" placeholder="Repita la contraseña"  style="padding-left:20px; margin-bottom:5px;">',
      title: '<b>Registro</b>',
      subTitle: '<b>Ingrese sus datos:</b>',
      scope: $scope,
      buttons: [
        { text: 'Cancelar' },
        {
          text: '<b>Registrar</b>',
          type: 'button-positive',
          onTap: function(e) {
            respuesta = usuarioFactory.validaFormUsuario($scope.registroData);

            if (respuesta.estado != true) {     
              //don't allow the user to close unless he enters mail
              e.preventDefault();
              ionicToast.show(respuesta.mensaje, 'middle', false, 2500);
            } else {
              usuarioService.registro($scope.registroData) // Checkea que no exista el usuario, si no existe lo registra
              .then( 
                function(respuesta){          
                  if (respuesta.estado == true) {
                    ionicToast.show(respuesta.mensaje, 'middle', false, 2500);
                  }
                  else {
                    ionicToast.show(respuesta.mensaje, 'middle', false, 2500); 
                  }
                }
              );
            }
          }
        },
      ]
    });
    myPopup.then(function(res) {
      //console.log('Tapped!', res);
    });    
  };
})


.controller('CreditoCtrl', function($scope, $ionicPopup, $cordovaBarcodeScanner, $cordovaVibration, ionicToast, usuarioFactory, usuarioService) {
  
  $scope.usuario = usuarioFactory.payload;
  $scope.cboTarjestasHide = true;
  $scope.listaUsuariosReceptoresJSON = [];
  $scope.usuarioReceptorSeleccionado = null;
  
  $scope.actualizaSaldoData =
  {
    idUsuario: usuarioFactory.payload.id,
    accion: 'actualizaSaldo'
  };

  $scope.recargaCreditoData =
  {
    idUsuario: usuarioFactory.payload.id,
    dispositivo: usuarioFactory.dispositivo,
    codigoTarjeta: '',
    accion: 'recargaCredito'
  };

  $scope.pasaCreditoData =
  {
    idUsuarioEmisor : usuarioFactory.payload.id,
    idUsuarioReceptor: '',
    dispositivoUsuarioEmisor : usuarioFactory.dispositivo,
    importe : '',
    accion: 'pasaCredito'
  };

  if ($scope.usuario.fechaUpdateSaldo == null) {
    $scope.usuario.fechaUpdateSaldo = "No hay registro de recargas."
  }

  // Actualiza crédito al arrastrar hacia abajo
  $scope.doRefresh = function() {
    
    usuarioService.actualizaSaldo($scope.actualizaSaldoData)
    .then(
      function(respuesta){          
        ionicToast.show(respuesta.mensaje, 'middle', false, 2500);            
        // Actualiza saldo visible
        if (respuesta.datos != 'error') {
          usuarioFactory.payload.credito = respuesta.datos.credito;
          usuarioFactory.payload.fecha_update_saldo = respuesta.datos.fecha_update_saldo;
          if (usuarioFactory.dispositivo != "no detectado") {
            $cordovaVibration.vibrate(200);
          }
        }  
      },
      function(respuesta){          
        ionicToast.show(respuesta.mensaje, 'middle', false, 2500);
      }
    )
    $scope.$broadcast('scroll.refreshComplete');  
  };
    
  /////////// CODIGO PARA ACTIVAR BARCODE-SCANNER Y DESACTIVAR COMBO TARJETAS

  $scope.recargaCredito = function(){ 

    document.addEventListener("deviceready", function () {

      $cordovaBarcodeScanner
      .scan()
      .then(
        function(barcodeData) {
          
          // El if es en caso de cancelar el escaneo
          if (barcodeData.text != '') {
            $scope.recargaCreditoData.codigoTarjeta = barcodeData.text;

            // Pregunta si desea recargar esa tarjeta
            var confirmPopup = $ionicPopup.confirm({
              title: 'Recarga de crédito',
              template: 'Si el código de su tarjeta es igual a: <b>'+$scope.recargaCreditoData.codigoTarjeta+'</b> seleccione OK.'
            });
            confirmPopup.then(function(respuesta) {
              if(respuesta) {       
                usuarioService.recargaCredito($scope.recargaCreditoData)
                .then(
                  function(respuesta){          
                    ionicToast.show(respuesta.mensaje, 'middle', false, 2500);            
                    // Actualiza saldo visible
                    if (respuesta.datos != 'error') {
                      usuarioFactory.payload.credito = respuesta.datos.credito;
                      usuarioFactory.payload.fecha_update_saldo = respuesta.datos.fecha_update_saldo;
                      $cordovaVibration.vibrate(200);
                    }   
                  },
                  function(respuesta){          
                    ionicToast.show(respuesta.mensaje, 'middle', false, 2500);
                  }
                )
              }
            });
          }    
        }, 
        function(error) {
          // alert(error);
        }
      );
    }, false);
  };
    
  /////////// FIN CODIGO PARA ACTIVAR BARCODE-SCANNER Y DESACTIVAR COMBO TARJETAS
    
  /////////// CODIGO PARA DESACTIVAR BARCODE-SCANNER Y ACTIVAR COMBO TARJETAS
  
  // $scope.cboTarjestasHide = false;

  // $scope.recargaCredito = function(){ 

    
  //   if ($scope.cboTarjetas == null) {
  //     ionicToast.show('Debe seleccionar una tarjeta.', 'middle', false, 2500);     
  //   }
  //   else {
  //     $scope.recargaCreditoData.codigoTarjeta = $scope.cboTarjetas;

  //     // Pregunta si desea recargar esa tarjeta
  //     var confirmPopup = $ionicPopup.confirm({
  //       title: 'Recarga de crédito',
  //       template: 'Si el código de su tarjeta es igual a: <b>'+$scope.recargaCreditoData.codigoTarjeta+'</b> seleccione OK.'
  //     });
  //     confirmPopup.then(function(respuesta) {
  //       if(respuesta) {       
  //         usuarioService.recargaCredito($scope.recargaCreditoData)
  //         .then(
  //           function(respuesta){          
  //             ionicToast.show(respuesta.mensaje, 'middle', false, 2500);            
  //             // Actualiza saldo visible
  //             if (respuesta.datos != 'error') {
  //               usuarioFactory.payload.credito = respuesta.datos.credito;
  //               usuarioFactory.payload.fecha_update_saldo = respuesta.datos.fecha_update_saldo;
                
  //               if (usuarioFactory.dispositivo != "no detectado") {
  //                 $cordovaVibration.vibrate(200);
  //               }  
  //             }   
  //           },
  //           function(respuesta){          
  //             ionicToast.show(respuesta.mensaje, 'middle', false, 2500);
  //           }
  //         )
  //       }
  //     });
  //   }
  // };

  /////////// FIN CODIGO PARA DESACTIVAR BARCODE-SCANNER Y ACTIVAR COMBO TARJETAS
  

  // Pasa crédito a otro usuario
  $scope.pasaCredito = function(){
    if ($scope.usuarioReceptorSeleccionado == null) {
      ionicToast.show('Debe seleccionar un usuario receptor.', 'middle', false, 2500);     
    }
    else {
      // Valida que credito actual sea superior a $0
      if (usuarioFactory.payload.credito < 0) {
        ionicToast.show('Saldo insuficiente.', 'middle', false, 2500); 
      }
      else {
        // An elaborate, custom popup
        var myPopup = $ionicPopup.show({
          template: '<h6><i class="ion-person"></i>&nbspUsuario receptor: {{usuarioReceptorSeleccionado.mail}}</h6><h6><i class="ion-social-usd"></i>&nbspImporte:</h6><input type="number" ng-model="pasaCreditoData.importe" placeholder="Ingrese el importe" style="padding-left:10px; margin-bottom:5px;">',
          title: '<b>Pasar crédito a otro usuario</b>',
          subTitle: 'Verifique el e-mail del receptor e introduzca el importe a pasarle.',
          scope: $scope,
          buttons: [
            { text: 'Cancel' },
            {
              text: '<b>enviar</b>',
              type: 'button-positive',
              onTap: function(e) {
                $scope.pasaCreditoData.idUsuarioReceptor =  $scope.usuarioReceptorSeleccionado.id;
                respuesta = usuarioFactory.validaFormPasaCredito($scope.pasaCreditoData);
                if (respuesta.estado == true) {
                  // Valida que el importe a pasar no sea superior al saldo actual
                  if ($scope.pasaCreditoData.importe > usuarioFactory.payload.credito) {
                    ionicToast.show('Error: El importe que desea pasar es superior a su crédito.', 'middle', false, 2500); 
                  }
                  else {
                    // Valida que el usuario beneficiario no sea igual al usuario actual
                    if (usuarioFactory.payload.id == $scope.pasaCreditoData.idUsuarioReceptor) {
                      ionicToast.show('Error: No puede enviarse crédito a usted mismo ;)', 'middle', false, 2500); 
                    }
                    else {
                      usuarioService.pasaCredito($scope.pasaCreditoData) // checkea si el usuario beneficiario existe (a traves del mail), le suma el importe y se lo resta al cliente actual.
                      .then( 
                        function(respuesta){          
                          if (respuesta.estado == true) {
                            ionicToast.show(respuesta.mensaje, 'middle', false, 2500);
                            // Actualiza saldo visible
                            usuarioFactory.payload.credito = respuesta.datos.credito;
                            usuarioFactory.payload.fecha_update_saldo = respuesta.datos.fecha_update_saldo;
                            
                            if (usuarioFactory.dispositivo != "no detectado") {
                              $cordovaVibration.vibrate(200);
                            }
                          }
                          else {
                            ionicToast.show(respuesta.mensaje, 'middle', false, 4000); 
                          }
                        }
                      );
                    } 
                  }
                }
                else {
                  //don't allow the user to close unless he enters mail
                  ionicToast.show(respuesta.mensaje, 'middle', false, 2500);
                  e.preventDefault();
                }
              }
            },
          ]
        });
        myPopup.then(function(res) {
          //console.log('Tapped!', res);
        });    
      }
    }
  };

  $scope.traeUsuariosReceptores = function(){
    
    $scope.listaUsuariosReceptores = [];
    
    $scope.traeUsuariosReceptoresData = {
      idUsuarioEmisor: usuarioFactory.payload.id,
      accion: 'traeUsuariosReceptores'
    };

    usuarioService.traeUsuariosReceptores($scope.traeUsuariosReceptoresData)
    .then(
      function(respuesta){ // Función a ejecutarse en caso de éxito
        if (respuesta.estado == true) {
          $scope.listaUsuariosReceptoresJSON = respuesta.datos;
          //$scope.usuarioReceptorSeleccionado = $scope.listaUsuariosReceptoresJSON[0].id;
          // Activa botones
          // if ($scope.vehiculoSeleccionado == null) {
          //   $scope.btnEstacionaOnDisabled = true;
          //   $scope.btnEstacionaOffDisabled = true;
          // }
          // else {
          //   $scope.btnEstacionaOnDisabled = false;
          //   $scope.btnEstacionaOffDisabled = true;
          // }
        }
        else {
          ionicToast.show(respuesta.mensaje, 'middle', false, 2500);
        }
      }
    ); 
  };
  $scope.traeUsuariosReceptores();
})

.controller('HistorialCtrl', function($scope, ionicToast, usuarioFactory, usuarioService) {

  // Función para pasar a imprenta un texto.
  var camelCase = function(input) { 
    return input.toLowerCase().replace(/\s(.)/g, function(match, group1) {
        return group1.toUpperCase();
    });
  };
  
  $scope.listaHistorial = [];
  $scope.chkReportes = 
  {
    misRecargas: false,
    misTransferenciasEnviadas : false,
    misTransferenciasRecibidas : false,
    todasLasTransferencias : false
  };
  
  $scope.actualizaListaHistorialData = 
  {
    idUsuario : usuarioFactory.payload.id,
    reporte : '',
    accion : 'actualizaListaHistorial'
  };

  $scope.actualizaListaHistorial = function(reporte) {
    $scope.actualizaListaHistorialData.reporte = reporte;

    usuarioService.actualizaListaHistorial($scope.actualizaListaHistorialData)
    .then(
      function(respuesta){ // Función a ejecutarse en caso de éxito
        if (respuesta.estado == true) {
          var reporteCamelCase = camelCase($scope.actualizaListaHistorialData.reporte);
          $scope.listaHistorial = null;
          
          // Setea los ng-if del template de acuerdo al tipo de reporte
          if (reporteCamelCase == 'misRecargas') { $scope.chkReportes.misTransferenciasEnviadas = false; $scope.chkReportes.misTransferenciasRecibidas = false; $scope.chkReportes.estacionamientos = false; $scope.chkReportes.misRecargas = true; }
          if (reporteCamelCase == 'misTransferenciasEnviadas') { $scope.chkReportes.misRecargas = false; $scope.chkReportes.misTransferenciasRecibidas = false; $scope.chkReportes.estacionamientos = false; $scope.chkReportes.misTransferenciasEnviadas = true; }
          if (reporteCamelCase == 'misTransferenciasRecibidas') { $scope.chkReportes.misRecargas = false; $scope.chkReportes.misTransferenciasEnviadas = false; $scope.chkReportes.estacionamientos = false; $scope.chkReportes.misTransferenciasRecibidas = true; }

          // Guarda en la listaHistorial el reporte recibido del servidor
          $scope.listaHistorial = respuesta.datos;
        }
        else {
          ionicToast.show(respuesta.mensaje, 'middle', false, 2500);
          $scope.listaHistorial = [];
        }
      }
    ); 
  };
  $scope.actualizaListaHistorial('mis recargas');
})
