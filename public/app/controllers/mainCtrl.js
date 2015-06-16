angular.module("controllers")
  .controller("mainController", ['$location', 'Auth', 'User', 'flash', 'config', function($location, Auth, User, flash, config){
    var vm = this;
    vm.auth = Auth;

    vm.doLogin = function() {
      vm.processing = true;

      Auth.login(vm.loginData.email, vm.loginData.password)
        .success(function(data){
          vm.processing = false;

          if (!data.errors) {
            flash.setMessage("Welcome back, " + vm.loginData.email + "!");
            $location.path(config.main_path);
          } else
            flash.setErrors(data);
        });
    };

    vm.doLogout = function() {
      Auth.logout();
    };

  }]);
