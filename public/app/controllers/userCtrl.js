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

  .controller("userEditController", ['User', 'Auth', '$location', 'flash', 'config', 'FileUploader', function(User, Auth, $location, flash, config, FileUploader) {
    var vm = this;
    vm.uploader = new FileUploader({
      url: config.api_url + "/user"
    });

    //form population
    currentUser = Auth.getCurrentUser();
    /*
    vm.userData = {};
    vm.userData.firstname = currentUser.firstname;
    vm.userData.lastname = currentUser.lastname;
    */
    vm.userData = currentUser;
    function updateCompleted(data) {
      vm.processing = false;
      if (!data.errors) {
        Auth.updateCurrentUser(data);
        flash.setMessage(data.message);
        $location.path(config.main_path);
      } else
        flash.setErrors(data);
    }

    vm.saveUser = function() {
      vm.processing = true;
      if(vm.uploader.queue.length > 0) {
        vm.uploader.uploadAll();
        vm.uploader.onCompleteItem = function(item, response, status, headers) {
          updateCompleted(response);
        };
      }
      else {
        User.update(vm.userData).success(function(data) {
          updateCompleted(data);
        });
      }
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
