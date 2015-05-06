angular.module('directives')
	.directive("successMessages", [
		function() {
			return {
				restrict: 'E',
				templateUrl: '/app/views/shared/successMessages.html'
			};
		}
	])

	.directive("errorMessages", [
		function() {
			return {
				restrict: 'E',
				scope: {
		            errors: '='
		        },
				templateUrl: '/app/views/shared/errorMessages.html'
			};
		}
	]);