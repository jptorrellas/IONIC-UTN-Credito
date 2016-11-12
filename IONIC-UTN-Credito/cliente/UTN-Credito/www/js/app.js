// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ngCordova', 'ionic-toast', 'satellizer'])

.run(function($ionicPlatform, $http) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  var defaultHTTPHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  // Al objeto $http le establecemos sus propiedades por defecto para utilice los headers que definimos arriba
  $http.defaults.headers.post = defaultHTTPHeaders;
})

.config(function($stateProvider, $urlRouterProvider, $authProvider) {

  // Parametros de configuración
  
  // URL
  // VERIFICAR BIEN LA RUTA COMPLETA ELEGIDA Y COLOCARLA DEBAJO !!!
  $authProvider.loginUrl = "http://jptorrellas.hol.es/services/usuarioService.php";
  //$authProvider.loginUrl = "http://localhost/UTN/PPS/PPS-Credito/servidor/services/usuarioService.php";

  //$authProvider.signupUrl = "http://api.com/auth/signup";
  $authProvider.tokenName = "tokenutncredito";
  $authProvider.tokenPrefix = "login";
  

  $stateProvider

  .state('login', {
    cache: false,
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

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

  .state('app.historial', {
    cache: false,
    url: '/historial',
    views: {
      'menuContent': {
        templateUrl: 'templates/historial.html',
        controller: 'HistorialCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
})


// URL SERVIDOR
// VERIFICAR BIEN LA RUTA ELEGIDA Y COLOCARLA EN LA CONSTANTE !!!
.constant('URLServidor', 'http://jptorrellas.hol.es/services/');
// .constant('URLServidor', 'http://localhost/UTN/PPS/PPS-Credito/servidor/services/');

