angular.module("controllers")
  .controller("userCreateController", ['User', 'Auth', '$location', 'flash', function(User, Auth, $location, flash) {
    var vm = this;

    vm.saveUser = function() {
      vm.processing = true;

      User.create(vm.userData)
        .then(function(response) {
          vm.processing = false;
					flash.setMessage("Please check your email and follow the activation instructions.");
					$location.path("/login");
        }, function(response) {
          vm.processing = false;
					flash.setErrors(response.data);
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
    vm.userData = currentUser;
    function updateCompleted(data) {
			Auth.updateCurrentUser(data);
			flash.setMessage(data.message);
			$location.path(config.main_path);
    }

    vm.saveUser = function() {
      vm.processing = true;
      if(vm.uploader.queue.length > 0) {
        vm.uploader.uploadAll();
        vm.uploader.onCompleteItem = function(item, response, status, headers) {
					vm.processing = false;
          updateCompleted(response);
        };
        vm.uploader.onErrorItem = function(item, response, status, headers) {
					vm.processing = false;
					flash.setErrors(response);
        };
      }
      else {
        User.update(vm.userData).then(function(response) {
					vm.processing = false;
          updateCompleted(response.data);
        }, function(response) {
					vm.processing = false;
					flash.setErrors(response.data);
				});
      }
    };
  }])

  .controller("userActivationController", ['User', '$location', 'flash', '$routeParams', function(User, $location, flash, $routeParams) {
    var vm = this;
    var userData = { activation_token: $routeParams.activation_token }

    User.activateAccount(userData).then(function(response) {
				flash.setMessage(response.data.message);
        $location.path("/login");
      }, function(response) {
				flash.setMessage(response.data.errors.user.message, "danger");
        $location.path("/login");
			});
  }])
