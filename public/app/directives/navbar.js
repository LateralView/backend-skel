angular.module('directives')
  .directive("navbar", [
    function() {
      return {
        restrict: 'E',
        templateUrl: '/app/views/shared/navbar.html'
      };
    }
  ]);
