angular.module("controllers")
  .controller("userCreateController", ['User', 'Auth', '$location', 'flash', 'config', function(User, Auth, $location, flash, config) {
    var vm = this;

    vm.saveUser = function() {
      vm.processing = true;

      User.create(vm.userData)
        .success(function(data) {
          vm.processing = false;
          if (!data.errors) {
            Auth.login(vm.userData.email, vm.userData.password)
              .success(function(data){
                flash.setMessage("Welcome, " + vm.userData.email + "!");
                $location.path(config.main_path);
              });
          } else
            flash.setErrors(data);
        });
    };
  }])

  .controller("userEditController", ['User', '$location', 'flash', 'config', function(User, $location, flash, config) {
    var vm = this;

    vm.saveUser = function() {
      vm.processing = true;

      User.update(vm.userData)
        .success(function(data) {
          vm.processing = false;
          if (!data.errors) {
            flash.setMessage(data.message);
            $location.path(config.main_path);
          } else
            flash.setErrors(data);
        });
    };
  }])
