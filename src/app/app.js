angular.module('benefitEquivalentCalculator', [
  'templates-app',
  'templates-common',
  'ui.bootstrap',
  'ui.utils.masks',
  'calc'
]).config(function myAppConfig() {
  console.log('---- AppCtrl.config');
}).run(function run() {
  console.log('---- AppCtrl.run');
}).controller('AppCtrl', function AppCtrl($scope, $location, calcService) {
  console.log('---- AppCtrl');
  $scope.pageTitle = 'Benefit Equivalent Calculator';
  calcService.ComputeXValue();
});
