angular.module('ngBoilerplate', [
  'templates-app',
  'templates-common',
  'ngBoilerplate.home',
  'ngBoilerplate.defined-contribution',
  'ngBoilerplate.defined-benefit',
  'ngBoilerplate.benefit-reduction',
  'ngAnimate',
  'ui.router',
  'ui.bootstrap',
  'calc'
]).config(function myAppConfig($stateProvider, $urlRouterProvider, $tooltipProvider) {
  $tooltipProvider.setTriggers({
    'mouseenter': 'mouseleave',
    'click': 'click',
    'focus': 'blur',
    'hideonclick': 'click'
  });
  $urlRouterProvider.otherwise('/home');
  console.log('---- AppCtrl.config');
}).run(function run() {
  console.log('---- AppCtrl.run');
}).controller('AppCtrl', function AppCtrl($scope) {
  console.log('---- AppCtrl');
  $scope.$on('$stateChangeSuccess', function(event, toState) {
    if (angular.isDefined(toState.data.pageTitle)) {
      $scope.pageTitle = toState.data.pageTitle + ' | ngBoilerplate';
    }
  });
});
