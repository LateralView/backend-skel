angular.module("controllers", []);
angular.module("services", []);
angular.module("directives", []);
angular.module("settings", []);

angular.module("skelApp", ["ngMessages", "ui.bootstrap", "angularFileUpload", "app.routes", "controllers", "services", "directives", "settings"])
  .config([ '$httpProvider', function($httpProvider) {
    // add token to http requests
    $httpProvider.interceptors.push('AuthInterceptor');
  }]);
