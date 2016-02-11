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

    return {
      setMessage: function(message, type) {
				type = type || "success";
        queue.push({ type: type, msg: message });
      },
      setErrors: function(data) {
        $rootScope.alerts = [];
        for (e in data.errors) {
          $rootScope.alerts.push({ type: 'danger', msg: data.errors[e].message });
        };
      }
    };
  }]);
