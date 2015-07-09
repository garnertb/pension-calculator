angular.module('benefitEquivalentCalculator', [
  'templates-app',
  'templates-common',
  'ui.bootstrap',
  'ui.utils.masks',
  'calc'
]).config(function myAppConfig() {
  console.log('---- AppCtrl.config');
}).config(function($locationProvider) {
  //Without this the pension calculator will append "/" to the # in the IAFF routing
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false,
    rewriteLinks: false
  });
}).run(function run() {
  console.log('---- AppCtrl.run');
}).controller('AppCtrl', function AppCtrl($scope, calcService) {
  console.log('---- AppCtrl');
  $scope.pageTitle = 'Benefit Equivalent Calculator';
  calcService.ComputeXValue();
});
