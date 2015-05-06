angular.module('directives')
	.directive("appIcon", [
		function() {
			return {
				restrict: 'E',
				scope: {
		            app: '='
		        },
				templateUrl: '/app/views/shared/appIcon.html'
			};
		}
	]);