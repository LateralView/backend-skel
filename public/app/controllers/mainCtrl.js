angular.module("controllers")
  .controller("mainController", ['$rootScope', '$location', 'Auth', 'User', 'flash', function($rootScope, $location, Auth, User, flash){
    var vm = this;
    vm.loggedIn = Auth.isLoggedIn();
    vm.user = User.getCurrentUser();
    $rootScope.flash = flash;

    // detect route change
    $rootScope.$on("$routeChangeStart", function(){
      vm.loggedIn = Auth.isLoggedIn();
      vm.user = User.getCurrentUser();
    });

    vm.doLogin = function() {
      vm.processing = true;

      Auth.login(vm.loginData.email, vm.loginData.password)
        .success(function(data){
          vm.processing = false;

          if (!data.errors) {
            flash.setMessage("Welcome back, " + vm.loginData.email + "!");
            $rootScope.currentUser = User.getCurrentUser();
            $location.path("/apps");
          } else
            flash.setErrors(data.errors);
        });
    };

    vm.doLogout = function() {
      Auth.logout();
      vm.user = {};
      $location.path("/login");
    };
  }]);
