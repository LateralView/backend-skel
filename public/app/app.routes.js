angular.module("app.routes", ["ngRoute"])
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    $routeProvider
      .when("/home", {
        templateUrl: "app/views/pages/home.html",
        authenticate: false
      })

      .when("/signup", {
        templateUrl: "app/views/users/new.html",
        controller: "userCreateController",
        controllerAs: "user",
        authenticate: false
      })

      .when("/login", {
        templateUrl: "app/views/pages/login.html",
        controller: "mainController",
        controllerAs: "login",
        authenticate: false
      })

      .when("/user", {
        templateUrl: "app/views/users/edit.html",
        controller: "userEditController",
        controllerAs: "user",
        authenticate: true
      })

      .when("/activate/:activation_token", {
        templateUrl: "app/views/users/activate.html",
        controller: "userActivationController",
        controllerAs: "user",
        authenticate: false
      })

      .otherwise({
          redirectTo: '/home'
      });

    $locationProvider.html5Mode(true);
  }])
