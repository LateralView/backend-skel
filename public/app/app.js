angular.module("controllers", [])
angular.module("services", [])
angular.module("directives", [])

angular.module("packedApp", ["ngAnimate", "ngMessages", "ui.bootstrap", "angularFileUpload", "app.routes", "controllers", "services", "directives"])
	.config([ '$httpProvider', function($httpProvider) {
		// add token to http requests
		$httpProvider.interceptors.push('AuthInterceptor');

		// manage error messages
		// $httpProvider.interceptors.push('ResponseInterceptor');
	}])

	.run(['$rootScope', 'User', function($rootScope, User) {
	    $rootScope.currentUser = User.getCurrentUser();
	}]);