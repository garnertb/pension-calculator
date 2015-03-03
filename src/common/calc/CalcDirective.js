(function() {
  var module = angular.module('calc_directive', []);

  module.directive('calc', function(calcService, $rootScope) {
    return {
      restrict: 'C',
      replace: false,
      templateUrl: 'calc/partial/calc.tpl.html',

      // The linking function will add behavior to the template
      link: function(scope, element) {
        scope.apps = null;

        scope.getApps = function() {
          // search my contacts
          calcService.getApps().then(function(apps) {
            scope.apps = apps;
          }, function(reject) {
            console.log('---- calcService.getApps error: ', reject);
            scope.apps = null;
          });
        };

        scope.getApps();
      }
    };
  });
}());
