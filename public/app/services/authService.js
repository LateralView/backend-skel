angular.module("services")
	.factory("Auth", ['$http', '$window', '$q', 'AuthToken', function($http, $window, $q, AuthToken) {
		var authFactory = {};

		// login
		authFactory.login = function(email, password) {
			return $http.post("/api/users/authenticate", {
				email: email,
				password: password
			})
				.success(function(data) {
					AuthToken.setToken(data.token);
					// Save user email in local storage
					$window.localStorage.setItem("email", email);
					return data;
				});
		};

		// logout
		authFactory.logout = function() {
			AuthToken.setToken(); // Clear the token
			$window.localStorage.removeItem("email");
		};

		// check if a user is logged in
		authFactory.isLoggedIn = function() {
			if (AuthToken.getToken())
				return true;
			else
				return false;
		};

		// get the user info
		authFactory.getUser = function() {
			if (AuthToken.getToken())
				return $http.get("/api/user");
			else
				return $q.reject({ message: "User has no token" });
		};

		return authFactory;
	}])

	.factory("AuthToken", ['$window', function($window) {
		var authTokenFactory = {};

		// get the token out of local storage
		authTokenFactory.getToken = function() {
			return $window.localStorage.getItem("token");
		}

		// set the token or clear the token
		authTokenFactory.setToken = function(token) {
			if (token)
				$window.localStorage.setItem("token", token);
			else
				$window.localStorage.removeItem("token");
		};

		return authTokenFactory;
	}])

	.factory("AuthInterceptor", ['$q', '$location', 'AuthToken', function($q, $location, AuthToken) {
		var interceptorFactory = {};

		// attach the token to every request
		interceptorFactory.request = function(config) {
			var token = AuthToken.getToken();
			if (token) config.headers["x-access-token"] = token;
			return config;
		};

		// redirect if a token doesn't authenticate
		interceptorFactory.responseError = function(response) {
			if (response.status == 403) {
				AuthToken.setToken();
				$location.path("/login");
			}

			return $q.reject(response);
		};

		return interceptorFactory;
	}]);