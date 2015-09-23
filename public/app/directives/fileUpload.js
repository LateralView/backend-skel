angular.module("directives")
  .directive("fileUpload", ['$timeout', 'SessionManager', 'config', 'FileUploader',
    function($timeout, SessionManager, config, FileUploader) {
      return {
        restrict: 'E',
        templateUrl: '/app/views/fileUpload/input.html',
        scope: {
          formData: '=',
          uploader: '='
        },
        compile: function() {
          return {
            pre: function(scope, element, params) {
              scope.uploader.alias = params.alias;
              scope.uploader.headers = {
                'x-access-token': SessionManager.getToken()
              };
              scope.uploader.onBeforeUploadItem = function(item) {
                item.formData.push(scope.formData);
              };
              scope.uploader.onAfterAddingFile = function(item) {
                if (scope.uploader.queue.length > 1) {
                  scope.uploader.removeFromQueue(0);
                }
              };
              scope.$watch('formData', function(data) {
                if(data && data._id) {
                  scope.uploader.method = "PUT";
                }
              });
            }
          };
        }
      };
    }
  ]);
