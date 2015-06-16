angular.module("services")
  .factory("flash", ['$rootScope', function($rootScope) {
    $rootScope.alerts = [];
    var queue = [];

    $rootScope.$on("$routeChangeSuccess", function() {
      $rootScope.alerts = [];
      $rootScope.alerts = $rootScope.alerts.concat(queue);
      queue = [];
    });

    $rootScope.closeAlert = function(index) {
      $rootScope.alerts.splice(index, 1);
    };

    // $rootScope.$on("apiError", function(event, errors) {
    //   if (errors)
    //     apiErrors = errors;
    //   else
    //     apiErrors = null;
    // });

    return {
      setMessage: function(message) {
        queue.push({ type: 'success', msg: message });
      },
      setErrors: function(data) {
        $rootScope.alerts = [];
        for (e in data.errors) {
          $rootScope.alerts.push({ type: 'danger', msg: data.errors[e].message });
        };
      }
    };
  }]);

  // .factory("ResponseInterceptor", ['flash', '$rootScope', function(flash, $rootScope) {
  //   var interceptorFactory = {};

  //   // check if there're api errors in the response object and handle it.
  //   interceptorFactory.response = function(response) {
  //     if (response.data.errors){
  //       $rootScope.$emit("apiError", response.data.errors);
  //     } else {
  //       $rootScope.$emit("apiError");
  //     }

  //     return response;
  //   };

  //   return interceptorFactory;
  // }]);