angular.module("controllers", []);
angular.module("services", []);
angular.module("directives", []);
angular.module("settings", []);

angular.module("skelApp", ["ngMessages", "ui.bootstrap", "angularFileUpload", "app.routes", "controllers", "services", "directives", "settings"])
	.config([ '$httpProvider', function($httpProvider) {
		// add token to http requests
		$httpProvider.interceptors.push('AuthInterceptor');
	}])

	.run(['$rootScope', '$location', 'Auth', 'config', function ($rootScope, $location, Auth, config) {
		$rootScope.$on('$routeChangeStart', function (event, next, current) {
			if (next.$$route) {
				if (!Auth.isLoggedIn()) {
					if (next.$$route.authenticate) $location.path('/login');
				} else {
					if (!next.$$route.authenticate) $location.path(config.main_path);
				}
			}
		});
	}]);



