angular.module('benefitEquivalentCalculator', [
  'templates-app',
  'templates-common',
  'ui.bootstrap',
  'ui.utils.masks',
  'calc'
]).config(function($locationProvider, $logProvider) {
  //Without this the pension calculator will append "/" to the # in the IAFF routing
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false,
    rewriteLinks: false
  });

  //Set this to true to enabled debug logging
  $logProvider.debugEnabled(false);
}).run(function run() {
}).controller('AppCtrl', function AppCtrl($scope, calcService) {
  $scope.pageTitle = 'Benefit Equivalent Calculator';
  calcService.ComputeXValue();
});
