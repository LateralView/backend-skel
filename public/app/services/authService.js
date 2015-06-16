angular.module("services")
	.factory("Auth", ['$http', '$q', 'SessionManager', function($http, $q, SessionManager) {
		var authFactory = {};

		// login
		authFactory.login = function(email, password) {
			return $http.post("/api/users/authenticate", {
				email: email,
				password: password
			})
				.success(function(data) {
					if (!data.errors){
						SessionManager.createSession(data);
					}

					return data;
				});
		};

		// logout
		authFactory.logout = function() {
			SessionManager.removeSession();
		};

		// check if a user is logged in
		authFactory.isLoggedIn = function() {
			if (SessionManager.getToken())
				return true;
			else
				return false;
		};

		// get the user info
		authFactory.getCurrentUser = function() {
			var currentUser = JSON.parse(SessionManager.getCurrentUser());
          	return currentUser;
		};

		return authFactory;
	}])

	.factory("SessionManager", ['$window', '$location', function($window, $location) {
		var sessionManagerFactory = {};

		// get the token out of local storage
		sessionManagerFactory.getToken = function() {
			return $window.localStorage.getItem("token");
		}

		// get the current user out of local storage
		sessionManagerFactory.getCurrentUser = function() {
			return $window.localStorage.getItem("current_user");
		}

		// save token and user to local storage
		sessionManagerFactory.createSession = function(data) {
			$window.localStorage.setItem("token", data.token);
			$window.localStorage.setItem("current_user", JSON.stringify(data.user));
		};

		// remove token and user from local storage
		sessionManagerFactory.removeSession = function() {
			$window.localStorage.removeItem("current_user");
			$window.localStorage.removeItem("token");
			$location.path("/login");
		};

		return sessionManagerFactory;
	}])

	.factory("AuthInterceptor", ['$q', 'SessionManager', function($q, SessionManager) {
		var interceptorFactory = {};

		// attach the token to every request
		interceptorFactory.request = function(config) {
			var token = SessionManager.getToken();
			if (token) config.headers["x-access-token"] = token;
			return config;
		};

		// redirect if a token doesn't authenticate
		interceptorFactory.responseError = function(response) {
			if (response.status == 403)
				SessionManager.removeSession();

			return $q.reject(response);
		};

		return interceptorFactory;
	}]);