angular.module("app.routes", ["ngRoute"])
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    $routeProvider
      .when("/home", {
        templateUrl: "app/views/pages/home.html",
        resolve: {
            auth: isAuthenticated
          }
      })

      .when("/signup", {
        templateUrl: "app/views/users/new.html",
        controller: "userCreateController",
        controllerAs: "user",
        resolve: {
            auth: isAuthenticated
          }
      })

      .when("/login", {
        templateUrl: "app/views/pages/login.html",
        controller: "mainController",
        controllerAs: "login",
        resolve: {
            auth: isAuthenticated
          }
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
          redirectTo: '/home'
      });

    $locationProvider.html5Mode(true);
  }])

  var isAuthenticated = function($q, Auth, $location, config) {
      var defer = $q.defer();
      if (!Auth.isLoggedIn()) {
        if ($location.path().indexOf("signup") < 0)
            $location.path('/login');
      } else {
        if ($location.path().indexOf("login") > -1 || $location.path().indexOf("signup") > -1)
          $location.path(config.main_path);
      }
      defer.resolve();
      return defer.promise;
  };
