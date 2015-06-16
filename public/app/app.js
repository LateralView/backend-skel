angular.module("controllers", []);
angular.module("services", []);
angular.module("directives", []);
angular.module("settings", []);

angular.module("skelApp", ["ngAnimate", "ngMessages", "ui.bootstrap", "angularFileUpload", "app.routes", "controllers", "services", "directives", "settings"])
  .config([ '$httpProvider', function($httpProvider) {
    // add token to http requests
    $httpProvider.interceptors.push('AuthInterceptor');

    // manage error messages
    // $httpProvider.interceptors.push('ResponseInterceptor');
  }]);