(function() {
  var module = angular.module('calc_directive', ['ui.utils.masks', 'ui.bootstrap']);

  module.filter('absolute', function() {
    return function(input) {
      return Math.abs(input);
    };
  });

  module.directive('numberOnlyInput', function() {
    return {
      restrict: 'EC',
      replace: false,
      require: '?ngModel',
      link: function(scope, element, attrs, ngModel) {
        scope.$watch(function() {
          //use the $render method because the model may be retrieved and set using gettrs/setters
          return ngModel.$viewValue;
        }, function(newValue, oldValue) {

          if (newValue == null) {
            return;
          }

          if (typeof(newValue) === 'number') {
            newValue = newValue.toString();
          }
          //use the $setViewValue method because the model may be retrieved and set using gettrs/setters
          ngModel.$setViewValue(newValue.replace(/[^\d.-]/g, ''));
          ngModel.$render();
        });
      }
    };
  });

  module.directive('calc', function(calcService, $rootScope, $window) {
    return {
      restrict: 'C',
      replace: false,
      templateUrl: 'calc/partial/calc.tpl.html',
      // The linking function will add behavior to the template
      link: function(scope, element, window) {
        // activate help popovers
        $('[data-toggle="popover"]').popover();

        scope.definedContributionPercent = null;
        scope.definedBenefitPercent = null;
        scope.showInput = false;
        scope.showAssumptions = false;
        scope.showInputChangedByUser = false;
        scope.sexOptions = [
          'male',
          'female'
        ];
        scope.modes = [
          {key: 'none', value: '( None Selected )'},
          {key: 'db', value: 'Pension to 401k Equivalent'},
          {key: 'dc', value: '401k to Pension Equivalent'},
          {key: 'reduction', value: 'Pension vs 401k'}
        ];
        scope.modeSelected = scope.modes[0];

        scope.setDefaults = function(only_options) {
          // only_options: Boolean.  Controls whether all values are reset to their defaults or just the user options.

          scope.spouseAge = 3;
          scope.ageAtHire = 25;
          scope.ageAtRetire = 55;
          scope.wageAtHire = 20000;
          scope.wageAtRetire = 62374;
          scope.finalSalaryYears = 3;
          scope.interestRate = 4;
          scope.investReturn = 6;
          scope.sex = scope.sexOptions[0];

          // The client uses a getter/setter to access these because Angular 1.3 treats the HTML input type "range" as a string.
          // https://github.com/angular/angular.js/pull/9715
          scope._COLAAdjustment = 2;
          scope._survivor = 0;

          if (!only_options) {
            scope.definedContributionPercent = null;
            scope.definedBenefitPercent = null;
          }
        };

        scope.setDefaults();
        var computeDivSizes = function(animate) {
          var calcPanel = jQuery('.calc');
          var inputPanel = jQuery('.input-panel');
          var outputPanel = jQuery('.output-panel');

          var outputPanelVal = null;
          var inputPanelVal = null;
          var calcPanelWidth = 500;

          if (calcPanel.width() > 500) {
            calcPanelWidth = calcPanel.width();
          }

          if (scope.showInput) {
            outputPanelVal = {
              width: (calcPanelWidth - 400).toString().concat('px')
            };

            inputPanelVal = {
              width: (334).toString().concat('px')
            };
          } else {
            outputPanelVal = {
              width: (calcPanelWidth - 36).toString().concat('px')
            };

            inputPanelVal = {
              width: (14).toString().concat('px')
            };
          }

          console.log('computeDivSizes: ', inputPanelVal, outputPanelVal);

          if (animate) {
            outputPanel.animate(outputPanelVal);
            inputPanel.animate(inputPanelVal);
          } else {
            outputPanel.css(outputPanelVal);
            inputPanel.css(inputPanelVal);
          }
        };

        computeDivSizes(false);

        var w = angular.element($window);
        w.bind('resize', function() {
          computeDivSizes(false);
        });

        scope.toggleInput = function(show) {
          if (scope.showInput === show) {
            return;
          }

          if (show === true) {
            scope.showInput = true;
          } else if (show === false) {
            scope.showInput = false;
          } else {
            scope.showInput = !scope.showInput;
          }
          console.log('----- toggleInput: ', scope.showInput);
          computeDivSizes(true);
          /*
          if (scope.showInput) {
            inputPanelContent.addClass('animated fadeInRight').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
              $(this).removeClass('animated fadeInRight');
            });
          }
          */
        };

        scope.toggleInputByUser = function(show) {
          scope.showInputChangedByUser = true;
          scope.toggleInput(show);
        };

        scope.toggleInput(false);

        var delayedShowInput = function() {
          setTimeout(function() {
            scope.toggleInput(true);
          }, 1000);
        };

        scope.isInputsValid = function() {

          if (scope.modeSelected.key === 'dc') {
            if (scope.definedBenefitPercent != null && !isNaN(scope.definedBenefitPercent)) {
              if (scope.showInputChangedByUser === false) {
                delayedShowInput();
              }
              return true;
            }
          } else if (scope.modeSelected.key === 'db') {
            if (scope.definedContributionPercent != null && !isNaN(scope.definedContributionPercent)) {
              if (scope.showInputChangedByUser === false) {
                delayedShowInput();
              }
              return true;
            }
          } else if (scope.modeSelected.key === 'reduction') {
            if (scope.definedBenefitPercent != null &&
                scope.definedContributionPercent != null && !isNaN(scope.definedBenefitPercent) && !isNaN(scope.definedContributionPercent)) {
              if (scope.showInputChangedByUser === false) {
                delayedShowInput();
              }
              return true;
            }
          }

          return false;
        };

        scope.updateWageIncrease = function() {
          scope.wageIncrease = calcService.roundNumber(Math.pow(scope.wageAtRetire / scope.wageAtHire, 1 / (scope.ageAtRetire - scope.ageAtHire - 1)) - 1, 6);
        };

        // Watch of calculation parameters.
        scope.$watchGroup(['_survivor', 'spouseAge', 'ageAtHire', 'ageAtRetire', 'wageAtHire', 'wageAtRetire',
          'finalSalaryYears', 'investRate', 'investReturn', '_COLAAdjustment', 'definedContributionPercent',
          'definedBenefitPercent'], function(newValues, oldValues) {
          scope.updateWageIncrease();
          scope.calculateOutput();
        }, true);

        // A getter/setter to access COLAAdjustment because Angular 1.3 treats the HTML input type "range" as a string.
        scope.COLAAdjustment = function(value) {

          if (value === '') {
            value = 0;
          }

          if (typeof(value) !== 'undefined') {
            scope._COLAAdjustment = parseFloat(value, 10).toFixed(2);
          }
          return scope._COLAAdjustment.toString();
        };

        // A getter/setter to access survivor because Angular 1.3 treats the HTML input type "range" as a string.
        scope.survivor = function(value) {

          if (value === '') {
            value = 0;
          }

          if (typeof(value) !== 'undefined') {
            scope._survivor = parseFloat(value, 10).toFixed(2);
          }
          return scope._survivor.toString();
        };

        scope.xValue = 0;
        scope.yValue = 0;
        scope.zValue = 0;
        scope.lifeOnly = 0;
        scope.table = [
          [0.000447, 0.000373],
          [0.000301, 0.000241],
          [0.000233, 0.000186],
          [0.000177, 0.000150],
          [0.000161, 0.000133],
          [0.000150, 0.000121],
          [0.000139, 0.000112],
          [0.000123, 0.000104],
          [0.000105, 0.000098],
          [0.000091, 0.000094],
          [0.000096, 0.000098],
          [0.000135, 0.000114],
          [0.000217, 0.000143],
          [0.000332, 0.000183],
          [0.000456, 0.000229],
          [0.000579, 0.000274],
          [0.000709, 0.000314],
          [0.000843, 0.000347],
          [0.000977, 0.000374],
          [0.001118, 0.000402],
          [0.001250, 0.000431],
          [0.001342, 0.000458],
          [0.001382, 0.000482],
          [0.001382, 0.000504],
          [0.001370, 0.000527],
          [0.001364, 0.000551],
          [0.001362, 0.000575],
          [0.001373, 0.000602],
          [0.001393, 0.000630],
          [0.001419, 0.000662],
          [0.001445, 0.000699],
          [0.001478, 0.000739],
          [0.001519, 0.000780],
          [0.001569, 0.000827],
          [0.001631, 0.000879],
          [0.001709, 0.000943],
          [0.001807, 0.001020],
          [0.001927, 0.001114],
          [0.002070, 0.001224],
          [0.002234, 0.001345],
          [0.002420, 0.001477],
          [0.002628, 0.001624],
          [0.002860, 0.001789],
          [0.003117, 0.001968],
          [0.003396, 0.002161],
          [0.003703, 0.002364],
          [0.004051, 0.002578],
          [0.004444, 0.002800],
          [0.004878, 0.003032],
          [0.005347, 0.003289],
          [0.005838, 0.003559],
          [0.006337, 0.003819],
          [0.006837, 0.004059],
          [0.007347, 0.004296],
          [0.007905, 0.004556],
          [0.008508, 0.004862],
          [0.009116, 0.005222],
          [0.009723, 0.005646],
          [0.010354, 0.006136],
          [0.011046, 0.006696],
          [0.011835, 0.007315],
          [0.012728, 0.007976],
          [0.013743, 0.008676],
          [0.014885, 0.009435],
          [0.016182, 0.010298],
          [0.017612, 0.011281],
          [0.019138, 0.012370],
          [0.020752, 0.013572],
          [0.022497, 0.014908],
          [0.024488, 0.016440],
          [0.026747, 0.018162],
          [0.029212, 0.020019],
          [0.031885, 0.022003],
          [0.034832, 0.024173],
          [0.038217, 0.026706],
          [0.042059, 0.029603],
          [0.046261, 0.032718],
          [0.050826, 0.036034],
          [0.055865, 0.039683],
          [0.061620, 0.043899],
          [0.068153, 0.048807],
          [0.075349, 0.054374],
          [0.083230, 0.060661],
          [0.091933, 0.067751],
          [0.101625, 0.075729],
          [0.112448, 0.084673],
          [0.124502, 0.094645],
          [0.137837, 0.105694],
          [0.152458, 0.117853],
          [0.168352, 0.131146],
          [0.185486, 0.145585],
          [0.203817, 0.161175],
          [0.223298, 0.177910],
          [0.243867, 0.195774],
          [0.264277, 0.213849],
          [0.284168, 0.231865],
          [0.303164, 0.249525],
          [0.320876, 0.266514],
          [0.336919, 0.282504],
          [0.353765, 0.299455]
        ];

        scope.ComputeNextCap = function(number) {
          var nextCap = 100;
          if (number > nextCap) {
            nextCap = calcService.roundNumber(number, 2) + 100;
          }
          return nextCap;
        };

        scope.calculateOutput = function() {
          console.log('----- yoyo: ', scope.ageAtHire, scope.ageAtRetire, scope.wageAtHire, scope.xValue);
          if (scope.modeSelected.key == 'dc' || scope.modeSelected.key == 'reduction') {
            scope.xValue = calcService.ComputeXValue(scope.ageAtHire, scope.ageAtRetire, scope.wageAtHire, scope.definedBenefitPercent, scope.investReturn, scope.wageIncrease);
            scope.yValue = calcService.ComputeYValue(scope.ageAtHire, scope.ageAtRetire, scope.wageAtHire, scope.definedBenefitPercent, scope.investReturn);
            scope.zValue = calcService.ComputeZValue([scope.interestRate], 'spot', 'ownstatic', scope.table, 0, 55, 55, scope.sex, 0, 0, 52, 1, 1, 0, scope._COLAAdjustment, scope.ageAtRetire);
            scope.lifeOnly = Math.max(calcService.ComputeFinalValue(scope.wageAtRetire, scope.finalSalaryYears, scope.wageIncrease, scope.xValue, scope.yValue, scope.zValue), 0);
            scope.lifeCap = scope.ComputeNextCap(scope.lifeOnly);

            scope.zValue = calcService.ComputeZValue([scope.interestRate], 'spot', 'ownstatic', scope.table, 0, 55, 55, scope.sex, 0, 0, 52, 1, 1, 50, scope._COLAAdjustment, scope.ageAtRetire);
            scope.halfSurvivor = calcService.ComputeFinalValue(scope.wageAtRetire, scope.finalSalaryYears, scope.wageIncrease, scope.xValue, scope.yValue, scope.zValue);

            scope.zValue = calcService.ComputeZValue([scope.interestRate], 'spot', 'ownstatic', scope.table, 0, 55, 55, scope.sex, 0, 0, 52, 1, 1, scope._survivor, scope._COLAAdjustment, scope.ageAtRetire);
            scope.jointOutput = Math.max(calcService.ComputeFinalValue(scope.wageAtRetire, scope.finalSalaryYears, scope.wageIncrease, scope.xValue, scope.yValue, scope.zValue), 0);
            scope.jointCap = scope.ComputeNextCap(scope.jointOutput);
          }

          var yearsOfService = scope.ageAtRetire - scope.ageAtHire;
          var totalDefinedContribution = yearsOfService * scope.definedContributionPercent;
          if (scope.modeSelected.key == 'db' || scope.modeSelected.key == 'reduction') {
            var adjustedTotalWages = calcService.GenerateTotalWages(scope.sex, scope._COLAAdjustment, scope.ageAtRetire, scope.spouseAge, scope.wageAtRetire, scope.finalSalaryYears, totalDefinedContribution, scope.wageIncrease, scope.interestRate, 0);
            var adjustedTotalWagesJoint = calcService.GenerateTotalWages(scope.sex, scope._COLAAdjustment, scope.ageAtRetire, scope.spouseAge, scope.wageAtRetire, scope.finalSalaryYears, totalDefinedContribution, scope.wageIncrease, scope.interestRate, scope._survivor);
            scope.dbLifeOnly = Math.max(calcService.ComputeEmployeeContrib(scope.ageAtHire, scope.ageAtRetire, scope.wageAtHire, scope.investReturn, scope.wageIncrease, adjustedTotalWages) * 100, 0);
            scope.dbJointOutput = Math.max(calcService.ComputeEmployeeContrib(scope.ageAtHire, scope.ageAtRetire, scope.wageAtHire, scope.investReturn, scope.wageIncrease, adjustedTotalWagesJoint) * 100, 0);
            scope.dbLifeCap = scope.ComputeNextCap(scope.dbLifeOnly);
            scope.dbJointCap = scope.ComputeNextCap(scope.dbJointOutput);

          }

          if (scope.modeSelected.key == 'reduction') {
            if (scope.lifeOnly > totalDefinedContribution) {
              scope.benefitSpan = 'Benefit Gain';
              scope.reductionOutput = (scope.lifeOnly / totalDefinedContribution - 1) * 100;
              scope.reductionCap = scope.ComputeNextCap(scope.reductionOutput);
              scope.barStyle = { 'width': (scope.reductionOutput / scope.reductionCap * 100) + '%', 'background-color': '#3D9970'};
            } else {
              scope.benefitSpan = 'Benefit Cut';
              scope.reductionOutput = (1 - scope.lifeOnly / totalDefinedContribution) * 100;
              scope.reductionCap = scope.ComputeNextCap(scope.reductionOutput);
              scope.barStyle = { 'width': Math.abs(scope.reductionOutput / scope.reductionCap * 100) + '%', 'background-color': '#FF4136'};
            }
            var halfExpected = (scope.halfSurvivor / scope.lifeOnly) * totalDefinedContribution;
            var jointExpected = scope.jointOutput / scope.halfSurvivor * halfExpected;
            if (scope.jointOutput > jointExpected) {
              scope.benefitSpanJoint = 'Benefit Gain w/ Survivor';
              scope.reductionJointOutput = (scope.jointOutput / jointExpected - 1) * 100;
              scope.reductionJointCap = scope.ComputeNextCap(scope.reductionJointOutput);
              scope.jointStyle = { 'width': (scope.reductionJointOutput / scope.reductionJointCap * 100) + '%', 'background-color': '#3D9970'};
            } else {
              scope.benefitSpanJoint = 'Benefit Cut w/ Survivor';
              scope.reductionJointOutput = (1 - scope.jointOutput / jointExpected) * 100;
              scope.reductionJointCap = scope.ComputeNextCap(scope.reductionJointOutput);
              scope.jointStyle = { 'width': Math.abs(scope.reductionJointOutput / scope.reductionJointCap * 100) + '%', 'background-color': '#FF4136'};
            }
          }
        };
      }
    };
  });
}());
