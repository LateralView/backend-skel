angular.module("services")
  .factory("flash", ['$rootScope', function($rootScope) {
    var queue = [];
    var currentMessage = "";
    var apiErrors;

    $rootScope.$on("$routeChangeSuccess", function() {
      apiErrors = null; // Delete old api errors
      currentMessage = queue.shift() || "";
    });

    $rootScope.$on("apiError", function(event, errors) {
      if (errors)
        apiErrors = errors;
      else
        apiErrors = null;
    });

    return {
      setMessage: function(message) {
        queue.push(message);
      },
      getMessage: function() {
        return currentMessage;
      },
      setErrors: function(errors) {
        apiErrors = errors;
      },
      getErrors: function() {
        return apiErrors;
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