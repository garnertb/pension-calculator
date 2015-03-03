(function() {
  var module = angular.module('calc_service', []);

  //var service_ = null;
  var q_ = null;
  var apps_ = null;

  module.provider('calcService', function() {
    this.$get = function($rootScope, $q) {
      q_ = $q;
      return this;
    };

    this.getApps = function() {
      var deferredResponse = q_.defer();

      //TODO: get list of apps by asking the server to get a list of apps by in turn hitting the admin apps page as an admin
      apps_ = [];

      apps_.push({
        name: 'Drive',
        link: 'https://drive.google.com/?authuser=0',
        icon: '/assets/images/drive-64.png'
      });

      apps_.push({
        name: 'Mail',
        link: 'https://mail.google.com/mail/?authuser=0',
        icon: '/assets/images/googlemail-64.png'
      });

      apps_.push({
        name: 'Calendar',
        link: 'https://www.google.com/calendar?authuser=0',
        icon: '/assets/images/calendar-64.png'
      });

      apps_.push({
        name: 'Contacts SB',
        link: 'https://smartbook-contacts.appspot.com?authuser=0',
        icon: '/assets/images/planner-64.png'
      });

      apps_.push({
        name: 'Start Hangout',
        link: 'https://hangouts.google.com/start',
        icon: '/assets/images/hangouts-64.png'
      });

      //TODO: link to training material should be configurable
      apps_.push({
        name: 'Training',
        link: 'https://drive.google.com/a/findplango.com/folderview?id=0ByrOVPg5iAJofkYzNFhrNDBNcW94M0xJOWlSNkRTelVQcXV1djNNTzBoR0xESzczaXc2VW8&usp=sharing',
        icon: '/assets/images/play_books-64.png'
      });

      apps_.push({
        name: 'Voice',
        link: 'https://www.google.com/voice/b/0?pli=1#inbox',
        icon: '/assets/images/voice-64.png'
      });

      apps_.push({
        name: 'Maps',
        link: 'https://www.google.com/maps',
        icon: '/assets/images/maps-64.png'
      });

      // resolve as if we got all the apps
      deferredResponse.resolve(apps_);

      return deferredResponse.promise;
    };

  });
}());
