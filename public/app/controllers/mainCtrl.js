angular.module("controllers")
  .controller("mainController", ['$location', 'Auth', 'flash', 'config', function($location, Auth, flash, config){
    var vm = this;
    vm.auth = Auth;

    vm.doLogin = function() {
      vm.processing = true;

      Auth.login(vm.loginData.email, vm.loginData.password).then(function(response){
          vm.processing = false;
					flash.setMessage("Welcome back, " + vm.loginData.email + "!");
					$location.path(config.main_path);

        }, function(response) {
          vm.processing = false;
					flash.setErrors(response.data);
				});
    };

    vm.doLogout = function() {
      Auth.logout();
    };

  }]);
