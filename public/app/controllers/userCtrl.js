angular.module("controllers")
  .controller("userCreateController", ['User', 'Auth', '$location', 'flash', function(User, Auth, $location, flash) {
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
                // TODO: Should we have this path in some config file?
                $location.path("/");
              });
          } else
            flash.setErrors(data.errors);
        });
    };
  }])

  .controller("userEditController", ['User', '$location', 'flash', function(User, $location, flash) {
    var vm = this;

    vm.saveUser = function() {
      vm.processing = true;

      User.update(vm.userData)
        .success(function(data) {
          vm.processing = false;
          if (!data.errors) {
            flash.setMessage(data.message);
            $location.path("/");
          } else
            flash.setErrors(data.errors);
        });
    };
  }])
