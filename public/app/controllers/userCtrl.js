angular.module("controllers")
  .controller("userCreateController", ['User', 'Auth', '$location', 'flash', function(User, Auth, $location, flash) {
    var vm = this;

    vm.saveUser = function() {
      vm.processing = true;

      User.create(vm.userData)
        .success(function(data) {
          vm.processing = false;
          if (!data.errors) {
            flash.setMessage("Please check your email and follow the activation instructions.");
            $location.path("/login");
          } else
            flash.setErrors(data);
        });
    };
  }])

  .controller("userEditController", ['User', 'Auth', '$location', 'flash', 'config', function(User, Auth, $location, flash, config) {
    var vm = this;

    //form population
    currentUser = Auth.getCurrentUser();
    vm.userData = {};
    vm.userData.firstname = currentUser.firstname;
    vm.userData.lastname = currentUser.lastname;

    vm.saveUser = function() {
      vm.processing = true;

      User.update(vm.userData)
        .success(function(data) {
          vm.processing = false;
          if (!data.errors) {
            Auth.updateCurrentUser(data);
            flash.setMessage(data.message);
            $location.path(config.main_path);
          } else
            flash.setErrors(data);
        });
    };
  }])

  .controller("userActivationController", ['User', '$location', 'flash', '$routeParams', function(User, $location, flash, $routeParams) {
    var vm = this;
    var userData = { activation_token: $routeParams.activation_token }

    User.activateAccount(userData)
      .success(function(data) {
        if (!data.errors) {
          flash.setMessage(data.message);
        }

        $location.path("/login");
      });
  }])