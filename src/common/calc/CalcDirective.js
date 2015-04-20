(function() {
  var module = angular.module('calc_directive', []);

  module.filter('absolute', function() {
    return function(input) {
      return Math.abs(input);
    };
  });

  module.directive('calc', function(calcService, $rootScope, $window) {
    return {
      restrict: 'C',
      replace: false,
      templateUrl: 'calc/partial/calc.tpl.html',
      // The linking function will add behavior to the template
      link: function(scope, element, window) {
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

        var computeDivSizes = function(animate) {
          var calcPanel = jQuery('.calc');
          var inputPanel = jQuery('.input-panel');
          var outputPanel = jQuery('.output-panel');

          var outputPanelVal = null;
          var inputPanelVal = null;
          var calcPanelWidth = 700;

          if (calcPanel.width() > 700) {
            calcPanelWidth = calcPanel.width();
          }

          if (scope.showInput) {
            outputPanelVal = {
              width: (calcPanelWidth - 334).toString().concat('px')
            };

            inputPanelVal = {
              width: (334).toString().concat('px')
            };
          } else {
            outputPanelVal = {
              width: (calcPanelWidth - 14).toString().concat('px')
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

        scope.isInputsValid = function() {

          if (scope.modeSelected.key === 'dc') {
            if (scope.inputData.definedBenefitPercent != null && !isNaN(scope.inputData.definedBenefitPercent)) {
              if (scope.showInputChangedByUser === false) {
                scope.toggleInput(true);
              }
              return true;
            }
          } else if (scope.modeSelected.key === 'db') {
            if (scope.inputData.definedContributionPercent != null && !isNaN(scope.inputData.definedContributionPercent)) {
              if (scope.showInputChangedByUser === false) {
                scope.toggleInput(true);
              }
              return true;
            }
          } else if (scope.modeSelected.key === 'reduction') {
            if (scope.inputData.definedBenefitPercent != null &&
                scope.inputData.definedContributionPercent != null && !isNaN(scope.inputData.definedBenefitPercent) && !isNaN(scope.inputData.definedContributionPercent)) {
              if (scope.showInputChangedByUser === false) {
                scope.toggleInput(true);
              }
              return true;
            }
          }

          return false;
        };

        // Deep watch of input data object.
        scope.$watch('inputData', function(newValue, oldValue) {
          scope.calculateOutput();
        }, true);

        scope.inputData = {
          survivor: 0,
          spouseAge: 3,
          COLAAdjustment: 2,
          ageAtHire: 25,
          ageAtRetire: 55,
          wageAtHire: 20000,
          wageAtRetire: 62374,
          finalSalaryYears: 3,
          wageIncrease: 4,
          interestRate: 4,
          investReturn: 6
        };

        scope.inputData.sex = scope.sexOptions[0];

        scope.xValue = 0;
        scope.yValue = 0;
        scope.zValue = 0;
        scope.lifeOnly = 0;
        scope.table = [
          [
            0.000447,
            0.000373
          ],
          [
            0.000301,
            0.000241
          ],
          [
            0.000233,
            0.000186
          ],
          [
            0.000177,
            0.00015
          ],
          [
            0.000161,
            0.000133
          ],
          [
            0.00015,
            0.000121
          ],
          [
            0.000139,
            0.000112
          ],
          [
            0.000123,
            0.000104
          ],
          [
            0.000105,
            0.000098
          ],
          [
            0.000091,
            0.000094
          ],
          [
            0.000096,
            0.000098
          ],
          [
            0.000135,
            0.000114
          ],
          [
            0.000217,
            0.000143
          ],
          [
            0.000332,
            0.000183
          ],
          [
            0.000456,
            0.000229
          ],
          [
            0.000579,
            0.000274
          ],
          [
            0.000709,
            0.000314
          ],
          [
            0.000843,
            0.000347
          ],
          [
            0.000977,
            0.000374
          ],
          [
            0.001118,
            0.000402
          ],
          [
            0.00125,
            0.000431
          ],
          [
            0.001342,
            0.000458
          ],
          [
            0.001382,
            0.000482
          ],
          [
            0.001382,
            0.000504
          ],
          [
            0.00137,
            0.000527
          ],
          [
            0.001364,
            0.000551
          ],
          [
            0.001362,
            0.000575
          ],
          [
            0.001373,
            0.000602
          ],
          [
            0.001393,
            0.00063
          ],
          [
            0.001419,
            0.000662
          ],
          [
            0.001445,
            0.000699
          ],
          [
            0.001478,
            0.000739
          ],
          [
            0.001519,
            0.00078
          ],
          [
            0.001569,
            0.000827
          ],
          [
            0.001631,
            0.000879
          ],
          [
            0.001709,
            0.000943
          ],
          [
            0.001807,
            0.00102
          ],
          [
            0.001927,
            0.001114
          ],
          [
            0.00207,
            0.001224
          ],
          [
            0.002234,
            0.001345
          ],
          [
            0.00242,
            0.001477
          ],
          [
            0.002628,
            0.001624
          ],
          [
            0.00286,
            0.001789
          ],
          [
            0.003117,
            0.001968
          ],
          [
            0.003396,
            0.002161
          ],
          [
            0.003703,
            0.002364
          ],
          [
            0.004051,
            0.002578
          ],
          [
            0.004444,
            0.0028
          ],
          [
            0.004878,
            0.003032
          ],
          [
            0.005347,
            0.003289
          ],
          [
            0.005838,
            0.003559
          ],
          [
            0.006337,
            0.003819
          ],
          [
            0.006837,
            0.004059
          ],
          [
            0.007347,
            0.004296
          ],
          [
            0.007905,
            0.004556
          ],
          [
            0.008508,
            0.004862
          ],
          [
            0.009116,
            0.005222
          ],
          [
            0.009723,
            0.005646
          ],
          [
            0.010354,
            0.006136
          ],
          [
            0.011046,
            0.006696
          ],
          [
            0.011835,
            0.007315
          ],
          [
            0.012728,
            0.007976
          ],
          [
            0.013743,
            0.008676
          ],
          [
            0.014885,
            0.009435
          ],
          [
            0.016182,
            0.010298
          ],
          [
            0.017612,
            0.011281
          ],
          [
            0.019138,
            0.01237
          ],
          [
            0.020752,
            0.013572
          ],
          [
            0.022497,
            0.014908
          ],
          [
            0.024488,
            0.01644
          ],
          [
            0.026747,
            0.018162
          ],
          [
            0.029212,
            0.020019
          ],
          [
            0.031885,
            0.022003
          ],
          [
            0.034832,
            0.024173
          ],
          [
            0.038217,
            0.026706
          ],
          [
            0.042059,
            0.029603
          ],
          [
            0.046261,
            0.032718
          ],
          [
            0.050826,
            0.036034
          ],
          [
            0.055865,
            0.039683
          ],
          [
            0.06162,
            0.043899
          ],
          [
            0.068153,
            0.048807
          ],
          [
            0.075349,
            0.054374
          ],
          [
            0.08323,
            0.060661
          ],
          [
            0.091933,
            0.067751
          ],
          [
            0.101625,
            0.075729
          ],
          [
            0.112448,
            0.084673
          ],
          [
            0.124502,
            0.094645
          ],
          [
            0.137837,
            0.105694
          ],
          [
            0.152458,
            0.117853
          ],
          [
            0.168352,
            0.131146
          ],
          [
            0.185486,
            0.145585
          ],
          [
            0.203817,
            0.161175
          ],
          [
            0.223298,
            0.17791
          ],
          [
            0.243867,
            0.195774
          ],
          [
            0.264277,
            0.213849
          ],
          [
            0.284168,
            0.231865
          ],
          [
            0.303164,
            0.249525
          ],
          [
            0.320876,
            0.266514
          ],
          [
            0.336919,
            0.282504
          ],
          [
            0.353765,
            0.299455
          ],
          [
            0.371454,
            0.317422
          ],
          [
            0.390026,
            0.336467
          ],
          [
            0.409528,
            0.356655
          ],
          [
            0.430004,
            0.378055
          ],
          [
            0.451504,
            0.400738
          ],
          [
            0.474079,
            0.424782
          ]
        ];

        scope.calculateOutput = function() {
          console.log('----- yoyo: ', scope.inputData.ageAtHire, scope.inputData.ageAtRetire, scope.inputData.wageAtHire, scope.xValue);
          if (scope.modeSelected.key == 'dc' || scope.modeSelected.key == 'reduction') {
            scope.xValue = calcService.ComputeXValue(scope.inputData.ageAtHire, scope.inputData.ageAtRetire, scope.inputData.wageAtHire, scope.inputData.definedBenefitPercent, scope.inputData.investReturn, scope.inputData.wageIncrease);
            scope.yValue = calcService.ComputeYValue(scope.inputData.ageAtHire, scope.inputData.ageAtRetire, scope.inputData.wageAtHire, scope.inputData.definedBenefitPercent, scope.inputData.investReturn);
            scope.zValue = calcService.ComputeZValue([scope.inputData.interestRate], 'spot', 'ownstatic', scope.table, 0, 55, 55, scope.inputData.sex, 0, 0, 52, 1, 1, 0, scope.inputData.COLAAdjustment, scope.inputData.ageAtRetire);
            scope.lifeOnly = calcService.ComputeFinalValue(scope.inputData.wageAtRetire, scope.inputData.finalSalaryYears, scope.inputData.wageIncrease, scope.xValue, scope.yValue, scope.zValue);

            scope.zValue = calcService.ComputeZValue([scope.inputData.interestRate], 'spot', 'ownstatic', scope.table, 0, 55, 55, scope.inputData.sex, 0, 0, 52, 1, 1, scope.inputData.survivor, scope.inputData.COLAAdjustment, scope.inputData.ageAtRetire);
            scope.jointOutput = calcService.ComputeFinalValue(scope.inputData.wageAtRetire, scope.inputData.finalSalaryYears, scope.inputData.wageIncrease, scope.xValue, scope.yValue, scope.zValue);
          }

          if (scope.modeSelected.key == 'db' || scope.modeSelected.key == 'reduction') {
            var adjustedTotalWages = calcService.GenerateTotalWages(scope.inputData.sex, scope.inputData.COLAAdjustment, scope.inputData.ageAtRetire, scope.inputData.spouseAge, scope.inputData.wageAtRetire, scope.inputData.finalSalaryYears, scope.inputData.definedContributionPercent, scope.inputData.wageIncrease, scope.inputData.interestRate, 0);
            var adjustedTotalWagesJoint = calcService.GenerateTotalWages(scope.inputData.sex, scope.inputData.COLAAdjustment, scope.inputData.ageAtRetire, scope.inputData.spouseAge, scope.inputData.wageAtRetire, scope.inputData.finalSalaryYears, scope.inputData.definedContributionPercent, scope.inputData.wageIncrease, scope.inputData.interestRate, scope.inputData.survivor);
            scope.dbLifeOnly = calcService.ComputeEmployeeContrib(scope.inputData.ageAtHire, scope.inputData.ageAtRetire, scope.inputData.wageAtHire, scope.inputData.investReturn, scope.inputData.wageIncrease, adjustedTotalWages);
            scope.dbJointOutput = calcService.ComputeEmployeeContrib(scope.inputData.ageAtHire, scope.inputData.ageAtRetire, scope.inputData.wageAtHire, scope.inputData.investReturn, scope.inputData.wageIncrease, adjustedTotalWagesJoint);
          }

          if (scope.modeSelected.key == 'reduction') {
            scope.reductionOutput = scope.lifeOnly - scope.inputData.definedContributionPercent;
            scope.reductionJointOutput = scope.jointOutput - scope.inputData.definedContributionPercent;
            if (scope.reductionOutput > 0.0) {
              scope.barStyle = { 'width': scope.reductionOutput + '%', 'background-color': 'green'};
            } else {
              scope.barStyle = { 'width': Math.abs(scope.reductionOutput) + '%', 'background-color': 'red'};
            }
            if (scope.reductionJointOutput > 0.0) {
              scope.jointStyle = { 'width': scope.reductionJointOutput + '%', 'background-color': 'green'};
            } else {
              scope.jointStyle = { 'width': Math.abs(scope.reductionJointOutput) + '%', 'background-color': 'red'};
            }
          }
        };
      }
    };
  });
}());
