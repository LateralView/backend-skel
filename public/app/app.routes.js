angular.module("app.routes", ["ngRoute"])
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    $routeProvider
      .when("/", {
        templateUrl: "app/views/pages/home.html"
      })

      .when("/signup", {
        templateUrl: "app/views/users/new.html",
        controller: "userCreateController",
        controllerAs: "user"
      })

      .when("/login", {
        templateUrl: "app/views/pages/login.html",
        controller: "mainController",
        controllerAs: "login"
      })

      .when("/user", {
        templateUrl: "app/views/users/edit.html",
        controller: "userEditController",
        controllerAs: "user",
        resolve: {
            auth: isAuthenticated
          }
      })

      .otherwise({
          redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
  }])

  var isAuthenticated = function($q, $rootScope, $location) {
      var defer = $q.defer();
      if (!$rootScope.currentUser) {
          $location.path('/login');
      };
      defer.resolve();
      return defer.promise;
  };
