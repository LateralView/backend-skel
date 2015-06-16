angular.module("services")
	.factory("User", ['$http', '$window', function($http, $window) {
		var userFactory = {};

		// create a user
		userFactory.create = function(userData) {
			return $http.post("/api/users/", userData);
		};

		// update current user
		userFactory.update = function(userData) {
			return $http.put("/api/user/", userData);
		};

		return userFactory;
	}]);