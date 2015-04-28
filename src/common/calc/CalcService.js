(function() {
  var module = angular.module('calc_service', []);
  var service_ = null;
  //var q_ = null;
  module.provider('calcService', function() {
    this.$get = function($rootScope, $q) {
      service_ = this;
      //q_ = $q;
      return service_;
    };
    this.ComputeFinalValue = function(wageAtRetire, finalSalaryYears, wageIncrease, xValue, yValue, zValue) {
      var finalValue = 0;
      finalValue = xValue * yValue / zValue / Math.pow(wageAtRetire / (1 + wageIncrease), finalSalaryYears / 2 - 0.5);
      return finalValue;
    };
    this.ComputeXValue = function(ageAtHire, ageAtRetire, wageAtHire, definedContribution, investReturn, wageIncrease) {
      var xValue;
      investReturn = investReturn / 100;
      xValue = wageAtHire * definedContribution / (investReturn - wageIncrease) * (1 - Math.pow((1 + wageIncrease) / (1 + investReturn), ageAtRetire - ageAtHire));
      return xValue;
    };
    this.ComputeYValue = function(ageAtHire, ageAtRetire, wageAtHire, definedContribution, investReturn) {
      var yValue;
      investReturn = investReturn / 100;
      yValue = Math.pow(1 + investReturn, ageAtRetire - ageAtHire) * (1 + investReturn * 11 / 24);
      return yValue;
    };
    this.FillOwnStaticTable = function(employee_array, spouse_array, mortProjection, mortTable, mortTableLength, ARA, spouseARA, StartAge, EndAge) {
      StartAge = Math.trunc(StartAge);
      EndAge = Math.trunc(EndAge);
      for (x = StartAge; x < EndAge; x++) {
        var tableIndex = Math.trunc(x - StartAge);
        if (mortTableLength == 2) {
          employee_array[x] = mortTable[tableIndex][0];
          spouse_array[x] = mortTable[tableIndex][1];
        } else if (mortTableLength == 4) {
          employee_array[x] = mortTable[tableIndex][0] * Math.pow(1 - mortTable[tableIndex][2], mortProjection);
          spouse_array[x] = mortTable[tableIndex][1] * Math.pow(1 - mortTable[tableIndex][3], mortProjection);
        } else if (mortTableLength == 8) {
          if (x < ARA) {
            employee_array[x] = mortTable[tableIndex][0] * Math.pow(1 - mortTable[tableIndex][2], mortProjection);
          } else {
            employee_array[x] = mortTable[tableIndex][4] * Math.pow(1 - mortTable[tableIndex][6], mortProjection);
          }
          if (x < spouseARA) {
            spouse_array[x] = mortTable[tableIndex][1] * Math.pow(1 - mortTable[tableIndex][3], mortProjection);
          } else {
            spouse_array[x] = mortTable[tableIndex][5] * Math.pow(1 - mortTable[tableIndex][8], mortProjection);
          }
        }
      }
    };
    this.FillOwnGenerationalTable = function(employee_array, spouse_array, mortProjection, mortTable, mortTableLength, ARA, spouseARA, age, spouseAge, Startage, EndAge) {
      StartAge = Math.trunc(StartAge);
      EndAge = Math.trunc(EndAge);
      for (x = Startage; x < EndAge; x++) {
        var tableIndex = Math.trunc(x - Startage);
        var raisePower = mortProjection;
        if (mortTableLength == 4) {
          raisePower = mortProjection + x - age;
          employee_array[x] = mortTable[tableIndex][0] * Math.pow(1 - mortTable[tableIndex][2], raisePower);
          raisePower = mortProjection + x - spouseAge;
          spouse_array[x] = mortTable[tableIndex][1] * Math.pow(1 - mortTable[tableIndex][3], raisePower);
        } else if (mortTableLength == 8) {
          if (x < ARA) {
            raisePower = mortProjection + x - age;
            employee_array[x] = mortTable[tableIndex][0] * Math.pow(1 - mortTable[tableIndex][2], raisePower);
          } else {
            raisePower = mortProjection + x - age;
            employee_array[x] = mortTable[tableIndex][4] * Math.pow(1 - mortTable[tableIndex][6], raisePower);
          }
          if (x < spouseARA) {
            raisePower = mortProjection + x - spouseAge;
            spouse_array = mortTable[tableIndex][1] * Math.pow(1 - mortTable[tableIndex][3], raisePower);
          } else {
            raisePower = mortProjection + x - spouseAge;
            spouse_array = mortTable[tableIndex][5] * Math.pow(1 - mortTable[tableIndex][8], raisePower);
          }
        }
      }
    };
    this.FillPPATable = function(non_annuiant_array, annuitant_array, annuitant_age, annuitant_divisor, AA_Scale, Weight_Scale, mortProjection, output_NAnnuitant, output_Annuitant, output_Combined) {
      for (x = 0; x < 70; x++) {
        output_NAnnuitant[x] = non_annuiant_array[x] * Math.pow(1 - AA_Scale[x], mortProjection - 2000 + 15);
      }
      for (x = 79; x < 120; x++) {
        output_NAnnuitant[x] = annuitant_array[x] * Math.pow(1 - AA_Scale[x], mortProjection - 2000 + 7);
      }
      for (x = 70; x < 78; x++) {
        //TODO Possible Integer Division Issues
        output_NAnnuitant[x] = output_NAnnuitant[x - 1] + (output_NAnnuitant[79] - output_NAnnuitant[69]) * ((x - 70) / 55);
      }
      for (x = 0; x < annuitant_age; x++) {
        output_Annuitant[x] = output_NAnnuitant[x];
      }
      for (x = 49; x < 120; x++) {
        output_Annuitant[x] = annuitant_array[x] * Math.pow(1 - AA_Scale[x], mortProjection - 2000 + 7);
      }
      for (x = annuitant_age; x < 49; x++) {
        //TODO Possible Integer Division Issues
        output_Annuitant[x] = output_Annuitant[x - 1] + (output_Annuitant[50] - output_Annuitant[annuitant_age]) * ((x - annuitant_age) / annuitant_divisor);
      }
      for (x = 0; x < 120; x++) {
        output_Combined[x] = output_NAnnuitant[x] * (1 - Weight_Scale[x]) + output_Annuitant[x] * Weight_Scale[x];
      }
    };
    this.FillPPALS = function(combined_employee, combined_spouse, combined417_array, ARA, spouseARA, output_employee, output_spouse) {
      for (x = 0; x < 120; x++) {
        if (x < ARA) {
          output_employee[x] = combined_employee[x];
        } else {
          output_employee[x] = combined417_array[x];
        }
        if (x < spouseARA) {
          output_spouse[x] = combined_spouse[x];
        } else {
          output_spouse[x] = combined417_array[x];
        }
      }
    };
    this.FillPPA = function(combined_employee, combined_spouse, output_employee, output_spouse) {
      for (x = 0; x < 120; x++) {
        output_employee[x] = combined_employee[x];
        ouput_spouse[x] = combined_spouse[x];
      }
    };
    this.FillPPAGenerationalLS = function(NAnnuitant_array, combined417_array, AA_employee, AA_spouse, mortProjection, ARA, spouseARA, age, spouseAge, output_employee, output_spouse) {
      for (x = 0; x < 120; x++) {
        if (x < ARA) {
          output_employee[x] = NAnnuitant_array[x] * Math.pow(1 - AA_employee[x], mortProjection - 2000 + x - age);
        } else {
          output_employee[x] = combined417_array[x];
        }
        if (x < spouseARA) {
          output_spouse[x] = NAnnuitant_array[x] * Math.pow(1 - AA_spouse[x], mortProjection - 2000 + x - spouseAge);
        } else {
          output_spouse[x] = combined417_array[x];
        }
      }
    };
    this.PopulateMortalityTableMale = function(qn_m, qa_m, AA_m, Weight_m, qUP94_m, qGar94, qGam83_m) {
      qn_m = [
        0.000637,
        0.00043,
        0.000357,
        0.000278,
        0.000255,
        0.000244,
        0.000234,
        0.000216,
        0.000209,
        0.000212,
        0.000219,
        0.000228,
        0.00024,
        0.000254,
        0.000269,
        0.000284,
        0.000301,
        0.000316,
        0.000331,
        0.000345,
        0.000357,
        0.000366,
        0.000373,
        0.000376,
        0.000376,
        0.000378,
        0.000382,
        0.000393,
        0.000412,
        0.000444,
        0.000499,
        0.000562,
        0.000631,
        0.000702,
        0.000773,
        0.000841,
        0.000904,
        0.000964,
        0.001021,
        0.001079,
        0.001142,
        0.001215,
        0.001299,
        0.001397,
        0.001508,
        0.001616,
        0.001734,
        0.00186,
        0.001995,
        0.002138,
        0.002288,
        0.002448,
        0.002621,
        0.002812,
        0.003029,
        0.003306,
        0.003628,
        0.003997,
        0.004414,
        0.004878,
        0.005382,
        0.005918,
        0.006472,
        0.007028,
        0.007573,
        0.008099,
        0.008598,
        0.009069,
        0.00951,
        0.009922,
        0.010912,
        0.012892,
        0.015862,
        0.019821,
        0.024771,
        0.03071,
        0.03764,
        0.045559,
        0.054469,
        0.064368,
        0.072041,
        0.080486,
        0.089718,
        0.099779,
        0.110757,
        0.122797,
        0.136043,
        0.15059,
        0.16642,
        0.183408,
        0.199769,
        0.216605,
        0.233662,
        0.250693,
        0.267491,
        0.283905,
        0.299852,
        0.315296,
        0.330207,
        0.344556,
        0.358628,
        0.371685,
        0.38304,
        0.392003,
        0.397886,
        0.4,
        0.4,
        0.4,
        0.4,
        0.4,
        0.4,
        0.4,
        0.4,
        0.4,
        0.4,
        0.4,
        0.4,
        0.4,
        0.4,
        1
      ];
      qa_m = [
        0.000637,
        0.00043,
        0.000357,
        0.000278,
        0.000255,
        0.000244,
        0.000234,
        0.000216,
        0.000209,
        0.000212,
        0.000219,
        0.000228,
        0.00024,
        0.000254,
        0.000269,
        0.000284,
        0.000301,
        0.000316,
        0.000331,
        0.000345,
        0.000357,
        0.000366,
        0.000373,
        0.000376,
        0.000376,
        0.000378,
        0.000382,
        0.000393,
        0.000412,
        0.000444,
        0.000499,
        0.000562,
        0.000631,
        0.000702,
        0.000773,
        0.000841,
        0.000904,
        0.000964,
        0.001021,
        0.001079,
        0.001157,
        0.001312,
        0.001545,
        0.001855,
        0.002243,
        0.002709,
        0.003252,
        0.003873,
        0.004571,
        0.005347,
        0.005528,
        0.005644,
        0.005722,
        0.005797,
        0.005905,
        0.006124,
        0.006444,
        0.006895,
        0.007485,
        0.008196,
        0.009001,
        0.009915,
        0.010951,
        0.012117,
        0.013419,
        0.014868,
        0.01646,
        0.0182,
        0.020105,
        0.022206,
        0.02457,
        0.027281,
        0.030387,
        0.0339,
        0.037834,
        0.042169,
        0.046906,
        0.052123,
        0.057927,
        0.064368,
        0.072041,
        0.080486,
        0.089718,
        0.099779,
        0.110757,
        0.122797,
        0.136043,
        0.15059,
        0.16642,
        0.183408,
        0.199769,
        0.216605,
        0.233662,
        0.250693,
        0.267491,
        0.283905,
        0.299852,
        0.315296,
        0.330207,
        0.344556,
        0.358628,
        0.371685,
        0.38304,
        0.392003,
        0.397886,
        0.4,
        0.4,
        0.4,
        0.4,
        0.4,
        0.4,
        0.4,
        0.4,
        0.4,
        0.4,
        0.4,
        0.4,
        0.4,
        0.4,
        1
      ];
      AA_m = [
        0.02,
        0.02,
        0.02,
        0.02,
        0.02,
        0.02,
        0.02,
        0.02,
        0.02,
        0.02,
        0.02,
        0.02,
        0.02,
        0.019,
        0.019,
        0.019,
        0.019,
        0.019,
        0.019,
        0.019,
        0.018,
        0.017,
        0.015,
        0.013,
        0.01,
        0.006,
        0.005,
        0.005,
        0.005,
        0.005,
        0.005,
        0.005,
        0.005,
        0.005,
        0.005,
        0.005,
        0.005,
        0.006,
        0.007,
        0.008,
        0.009,
        0.01,
        0.011,
        0.012,
        0.013,
        0.014,
        0.015,
        0.016,
        0.017,
        0.018,
        0.019,
        0.02,
        0.02,
        0.02,
        0.019,
        0.018,
        0.017,
        0.016,
        0.016,
        0.016,
        0.015,
        0.015,
        0.014,
        0.014,
        0.014,
        0.013,
        0.013,
        0.014,
        0.014,
        0.015,
        0.015,
        0.015,
        0.015,
        0.015,
        0.014,
        0.014,
        0.013,
        0.012,
        0.011,
        0.01,
        0.009,
        0.008,
        0.008,
        0.007,
        0.007,
        0.007,
        0.006,
        0.005,
        0.005,
        0.004,
        0.004,
        0.003,
        0.003,
        0.003,
        0.002,
        0.002,
        0.002,
        0.001,
        0.001,
        0.001,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ];
      Weight_m = [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        0.0045,
        0.0091,
        0.0136,
        0.0181,
        0.0226,
        0.0272,
        0.0317,
        0.0362,
        0.0407,
        0.0453,
        0.0498,
        0.0686,
        0.0953,
        0.1288,
        0.2066,
        0.3173,
        0.378,
        0.4401,
        0.4986,
        0.5633,
        0.6338,
        0.7103,
        0.7902,
        0.8355,
        0.8832,
        0.9321,
        0.951,
        0.9639,
        0.9714,
        0.974,
        0.9766,
        0.9792,
        0.9818,
        0.9844,
        0.987,
        0.9896,
        0.9922,
        0.9948,
        0.9974,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ];
      qUP94_m = [
        0.000637,
        0.00043,
        0.000357,
        0.000278,
        0.000255,
        0.000244,
        0.000234,
        0.000216,
        0.000209,
        0.000212,
        0.000223,
        0.000243,
        0.000275,
        0.00032,
        0.000371,
        0.000421,
        0.000463,
        0.000495,
        0.000521,
        0.000545,
        0.00057,
        0.000598,
        0.000633,
        0.000671,
        0.000711,
        0.000749,
        0.000782,
        0.000811,
        0.000838,
        0.000862,
        0.000883,
        0.000902,
        0.000912,
        0.000913,
        0.000915,
        0.000927,
        0.000958,
        0.00101,
        0.001075,
        0.001153,
        0.001243,
        0.001346,
        0.001454,
        0.001568,
        0.001697,
        0.001852,
        0.002042,
        0.00226,
        0.002501,
        0.002773,
        0.003088,
        0.003455,
        0.003854,
        0.004278,
        0.004758,
        0.005322,
        0.006001,
        0.006774,
        0.007623,
        0.008576,
        0.009663,
        0.010911,
        0.012335,
        0.013914,
        0.015629,
        0.017462,
        0.019391,
        0.021354,
        0.023364,
        0.025516,
        0.027905,
        0.030625,
        0.033549,
        0.036614,
        0.040012,
        0.043933,
        0.04857,
        0.053991,
        0.060066,
        0.066696,
        0.07378,
        0.081217,
        0.088721,
        0.096358,
        0.104559,
        0.113755,
        0.124377,
        0.136537,
        0.149949,
        0.164442,
        0.179849,
        0.196001,
        0.213325,
        0.231936,
        0.251189,
        0.270441,
        0.289048,
        0.30675,
        0.323976,
        0.341116,
        0.35856,
        0.376699,
        0.396884,
        0.418855,
        0.440585,
        0.460043,
        0.4752,
        0.48567,
        0.492807,
        0.497189,
        0.499394,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        1
      ];
      qGar94 = [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0.000262,
        0.000296,
        0.000324,
        0.000343,
        0.000357,
        0.000368,
        0.000381,
        0.000396,
        0.000418,
        0.000441,
        0.000468,
        0.0005,
        0.000523,
        0.000543,
        0.000564,
        0.000588,
        0.000612,
        0.000633,
        0.000649,
        0.000661,
        0.000675,
        0.000695,
        0.000727,
        0.000768,
        0.000819,
        0.000879,
        0.000944,
        0.001014,
        0.001083,
        0.001151,
        0.001224,
        0.001312,
        0.001422,
        0.001554,
        0.001699,
        0.001869,
        0.002065,
        0.002302,
        0.002571,
        0.002854,
        0.003197,
        0.003614,
        0.004124,
        0.004712,
        0.005345,
        0.006062,
        0.006912,
        0.007846,
        0.008958,
        0.010151,
        0.011441,
        0.01287,
        0.014291,
        0.015614,
        0.017,
        0.018396,
        0.020025,
        0.022026,
        0.024187,
        0.026581,
        0.02931,
        0.032392,
        0.036288,
        0.040636,
        0.045463,
        0.050795,
        0.056655,
        0.063064,
        0.069481,
        0.076539,
        0.084129,
        0.092686,
        0.103014,
        0.114434,
        0.126925,
        0.14065,
        0.154664,
        0.17019,
        0.186631,
        0.203518,
        0.222123,
        0.240233,
        0.25938,
        0.278936,
        0.297614,
        0.31663,
        0.338758,
        0.35883,
        0.380735,
        0.404426,
        0.427883,
        0.449085,
        0.466012,
        0.478582,
        0.48814,
        0.494813,
        0.498724,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        1
      ];
      qGam83_m = [
        0,
        0,
        0,
        0,
        0.000342,
        0.000318,
        0.000302,
        0.000294,
        0.000292,
        0.000293,
        0.000298,
        0.000304,
        0.00031,
        0.000317,
        0.000325,
        0.000333,
        0.000343,
        0.000353,
        0.000365,
        0.000377,
        0.000392,
        0.000408,
        0.000424,
        0.000444,
        0.000464,
        0.000488,
        0.000513,
        0.000542,
        0.000572,
        0.000607,
        0.000645,
        0.000687,
        0.000734,
        0.000785,
        0.00086,
        0.000907,
        0.000966,
        0.001039,
        0.001128,
        0.001238,
        0.00137,
        0.001527,
        0.001715,
        0.001932,
        0.002183,
        0.002471,
        0.00279,
        0.003138,
        0.003513,
        0.003909,
        0.004324,
        0.004755,
        0.0052,
        0.00566,
        0.006131,
        0.006618,
        0.007139,
        0.007719,
        0.008384,
        0.009158,
        0.010064,
        0.011133,
        0.012391,
        0.013868,
        0.015592,
        0.017579,
        0.019804,
        0.022229,
        0.024817,
        0.02753,
        0.030354,
        0.03337,
        0.03668,
        0.040388,
        0.044597,
        0.049388,
        0.054758,
        0.060678,
        0.067125,
        0.07407,
        0.081484,
        0.08932,
        0.097525,
        0.106047,
        0.114836,
        0.12417,
        0.13387,
        0.144073,
        0.154859,
        0.166307,
        0.178214,
        0.19046,
        0.203007,
        0.217904,
        0.234086,
        0.248436,
        0.263954,
        0.280803,
        0.299154,
        0.319185,
        0.341086,
        0.365052,
        0.393102,
        0.427255,
        0.469531,
        0.521945,
        0.586518,
        0.665268,
        0.760215,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ];
    };
    this.PopulateMortalityTableFemale = function(qn_f, qa_f, AA_f, Weight_f, qUP94_f, qGam83_f) {
      qn_f = [
        0.000571,
        0.000372,
        0.000278,
        0.000208,
        0.000188,
        0.000176,
        0.000165,
        0.000147,
        0.00014,
        0.000141,
        0.000143,
        0.000148,
        0.000155,
        0.000162,
        0.00017,
        0.000177,
        0.000184,
        0.000188,
        0.00019,
        0.000191,
        0.000192,
        0.000194,
        0.000197,
        0.000201,
        0.000207,
        0.000214,
        0.000223,
        0.000235,
        0.000248,
        0.000264,
        0.000307,
        0.00035,
        0.000394,
        0.000435,
        0.000475,
        0.000514,
        0.000554,
        0.000598,
        0.000648,
        0.000706,
        0.000774,
        0.000852,
        0.000937,
        0.001029,
        0.001124,
        0.001223,
        0.001326,
        0.001434,
        0.00155,
        0.001676,
        0.001814,
        0.001967,
        0.002135,
        0.002321,
        0.002526,
        0.002756,
        0.00301,
        0.003291,
        0.003599,
        0.003931,
        0.004285,
        0.004656,
        0.005039,
        0.005429,
        0.005821,
        0.006207,
        0.006583,
        0.006945,
        0.007289,
        0.007613,
        0.008309,
        0.0097,
        0.011787,
        0.01457,
        0.018049,
        0.022224,
        0.027094,
        0.03266,
        0.038922,
        0.045879,
        0.05078,
        0.056294,
        0.062506,
        0.069517,
        0.077446,
        0.086376,
        0.096337,
        0.107303,
        0.119154,
        0.131682,
        0.144604,
        0.157618,
        0.170433,
        0.182799,
        0.194509,
        0.205379,
        0.21524,
        0.223947,
        0.231387,
        0.237467,
        0.244834,
        0.254498,
        0.266044,
        0.279055,
        0.293116,
        0.307811,
        0.322725,
        0.337441,
        0.351544,
        0.364617,
        0.376246,
        0.386015,
        0.393507,
        0.398308,
        0.4,
        0.4,
        0.4,
        0.4,
        0.4,
        1
      ];
      qa_f = [
        0.000571,
        0.000372,
        0.000278,
        0.000208,
        0.000188,
        0.000176,
        0.000165,
        0.000147,
        0.00014,
        0.000141,
        0.000143,
        0.000148,
        0.000155,
        0.000162,
        0.00017,
        0.000177,
        0.000184,
        0.000188,
        0.00019,
        0.000191,
        0.000192,
        0.000194,
        0.000197,
        0.000201,
        0.000207,
        0.000214,
        0.000223,
        0.000235,
        0.000248,
        0.000264,
        0.000307,
        0.00035,
        0.000394,
        0.000435,
        0.000475,
        0.000514,
        0.000554,
        0.000598,
        0.000648,
        0.000706,
        0.000774,
        0.000852,
        0.000937,
        0.001029,
        0.001124,
        0.001223,
        0.001335,
        0.001559,
        0.001896,
        0.002344,
        0.002459,
        0.002647,
        0.002895,
        0.00319,
        0.003531,
        0.003925,
        0.004385,
        0.004921,
        0.005531,
        0.0062,
        0.006919,
        0.007689,
        0.008509,
        0.009395,
        0.010364,
        0.011413,
        0.01254,
        0.013771,
        0.015153,
        0.016742,
        0.018579,
        0.020665,
        0.02297,
        0.025458,
        0.028106,
        0.030966,
        0.034105,
        0.037595,
        0.041506,
        0.045879,
        0.05078,
        0.056294,
        0.062506,
        0.069517,
        0.077446,
        0.086376,
        0.096337,
        0.107303,
        0.119154,
        0.131682,
        0.144604,
        0.157618,
        0.170433,
        0.182799,
        0.194509,
        0.205379,
        0.21524,
        0.223947,
        0.231387,
        0.237467,
        0.244834,
        0.254498,
        0.266044,
        0.279055,
        0.293116,
        0.307811,
        0.322725,
        0.337441,
        0.351544,
        0.364617,
        0.376246,
        0.386015,
        0.393507,
        0.398308,
        0.4,
        0.4,
        0.4,
        0.4,
        0.4,
        1
      ];
      AA_f = [
        0.02,
        0.02,
        0.02,
        0.02,
        0.02,
        0.02,
        0.02,
        0.02,
        0.02,
        0.02,
        0.02,
        0.02,
        0.02,
        0.018,
        0.016,
        0.015,
        0.014,
        0.014,
        0.015,
        0.016,
        0.017,
        0.017,
        0.016,
        0.015,
        0.014,
        0.012,
        0.012,
        0.012,
        0.012,
        0.01,
        0.008,
        0.008,
        0.009,
        0.01,
        0.011,
        0.012,
        0.013,
        0.014,
        0.015,
        0.015,
        0.015,
        0.015,
        0.015,
        0.015,
        0.016,
        0.017,
        0.018,
        0.018,
        0.018,
        0.017,
        0.016,
        0.014,
        0.012,
        0.01,
        0.008,
        0.006,
        0.005,
        0.005,
        0.005,
        0.005,
        0.005,
        0.005,
        0.005,
        0.005,
        0.005,
        0.005,
        0.005,
        0.005,
        0.005,
        0.005,
        0.006,
        0.006,
        0.007,
        0.007,
        0.008,
        0.008,
        0.007,
        0.007,
        0.007,
        0.007,
        0.007,
        0.007,
        0.007,
        0.007,
        0.006,
        0.005,
        0.004,
        0.004,
        0.003,
        0.003,
        0.003,
        0.003,
        0.002,
        0.002,
        0.002,
        0.002,
        0.001,
        0.001,
        0.001,
        0.001,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ];
      Weight_f = [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        0.0084,
        0.0167,
        0.0251,
        0.0335,
        0.0419,
        0.0502,
        0.0586,
        0.0744,
        0.0947,
        0.1189,
        0.1897,
        0.2857,
        0.3403,
        0.3878,
        0.436,
        0.4954,
        0.5805,
        0.6598,
        0.752,
        0.8043,
        0.8552,
        0.9118,
        0.9367,
        0.9523,
        0.9627,
        0.9661,
        0.9695,
        0.9729,
        0.9763,
        0.9797,
        0.983,
        0.9864,
        0.9898,
        0.9932,
        0.9966,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ];
      qUP94_f = [
        0.000571,
        0.000372,
        0.000278,
        0.000208,
        0.000188,
        0.000176,
        0.000165,
        0.000147,
        0.00014,
        0.000141,
        0.000148,
        0.000159,
        0.000177,
        0.000203,
        0.000233,
        0.000261,
        0.000281,
        0.000293,
        0.000301,
        0.000305,
        0.000308,
        0.000311,
        0.000313,
        0.000313,
        0.000313,
        0.000316,
        0.000324,
        0.000338,
        0.000356,
        0.000377,
        0.000401,
        0.000427,
        0.000454,
        0.000482,
        0.000514,
        0.00055,
        0.000593,
        0.000643,
        0.000701,
        0.000763,
        0.000826,
        0.000888,
        0.000943,
        0.000992,
        0.001046,
        0.001111,
        0.001196,
        0.001297,
        0.001408,
        0.001536,
        0.001686,
        0.001864,
        0.002051,
        0.002241,
        0.002466,
        0.002755,
        0.003139,
        0.003612,
        0.004154,
        0.004773,
        0.005476,
        0.006271,
        0.007179,
        0.008194,
        0.009286,
        0.010423,
        0.011574,
        0.012648,
        0.013665,
        0.014763,
        0.016079,
        0.017748,
        0.019724,
        0.021915,
        0.024393,
        0.027231,
        0.030501,
        0.034115,
        0.038024,
        0.042361,
        0.04726,
        0.052853,
        0.058986,
        0.065569,
        0.072836,
        0.081018,
        0.090348,
        0.100882,
        0.112467,
        0.125016,
        0.138442,
        0.15266,
        0.167668,
        0.183524,
        0.200229,
        0.217783,
        0.236188,
        0.255605,
        0.276035,
        0.297233,
        0.318956,
        0.34096,
        0.364586,
        0.389996,
        0.41518,
        0.438126,
        0.456824,
        0.471493,
        0.483473,
        0.492436,
        0.498054,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        1
      ];
      qGam83_f = [
        0,
        0,
        0,
        0,
        0.000171,
        0.00014,
        0.000118,
        0.000104,
        0.000097,
        0.000096,
        0.000104,
        0.000113,
        0.000121,
        0.000131,
        0.00014,
        0.000149,
        0.000159,
        0.000168,
        0.000179,
        0.000189,
        0.000201,
        0.000212,
        0.000225,
        0.000238,
        0.000253,
        0.000268,
        0.000283,
        0.000301,
        0.00032,
        0.000342,
        0.000364,
        0.000388,
        0.000414,
        0.000443,
        0.000476,
        0.000502,
        0.000535,
        0.000573,
        0.000617,
        0.000665,
        0.000716,
        0.000775,
        0.000841,
        0.000919,
        0.00101,
        0.001117,
        0.001237,
        0.001366,
        0.001505,
        0.001647,
        0.001793,
        0.001948,
        0.002119,
        0.002315,
        0.002541,
        0.002803,
        0.003103,
        0.003442,
        0.003821,
        0.004241,
        0.004702,
        0.00521,
        0.005769,
        0.006385,
        0.007064,
        0.007817,
        0.008681,
        0.009702,
        0.010921,
        0.012385,
        0.014128,
        0.016159,
        0.018481,
        0.021091,
        0.023992,
        0.027184,
        0.030672,
        0.034459,
        0.038549,
        0.042945,
        0.047655,
        0.052691,
        0.058071,
        0.063807,
        0.069918,
        0.07657,
        0.08387,
        0.091935,
        0.101354,
        0.11175,
        0.123076,
        0.13563,
        0.149577,
        0.165103,
        0.182419,
        0.201757,
        0.222043,
        0.243899,
        0.268185,
        0.295187,
        0.325225,
        0.358897,
        0.395842,
        0.43836,
        0.487816,
        0.545886,
        0.614309,
        0.694884,
        0.789474,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ];
    };
    this.FillPPAGenerational = function(NAnnuitant_employee, Annuitant_employee, NAnnuitant_spouse, Annuitant_spouse, AA_employee, AA_spouse, mortProjection, ARA, spouseARA, age, spouseAge, output_employee, output_spouse) {
      for (x = 0; x < 120; x++) {
        if (x < ARA) {
          output_employee[x] = NAnnuitant_employee[x] * Math.pow(1 - AA_employee[x], mortProjection - 2000 + x - age);
        } else {
          output_employee[x] = Annuitant_employee[x] * Math.pow(1 - AA_employee[x], mortProjection - 2000 + x - age);
        }
        if (x < spouseARA) {
          output_spouse[x] = NAnnuitant_spouse[x] * Math.pow(1 - AA_spouse[x], mortProjection - 2000 + x - spouseAge);
        } else {
          output_spouse[x] = Annuitant_spouse[x] * Math.pow(1 - AA_spouse[x], mortProjection - 2000 + x - spouseAge);
        }
      }
    };
    this.ComputeZValue = function(rates, rateStructure, mortName, mortTable, mortProjection, age, ARA, sex, certainPeriod, tempPeriod, spouseAge, pctEE, pctBoth, pctSpouse, COLApct, COLAStartAge) {
      var zValue = 0;
      var mortTableLength = 0;
      var x = 0, y = 0, z = 0;
      //counters for something
      var spouseARA = 0;
      var minJSq, maxJSq;
      //joint mortality table min and max
      var a_ee = 0, a_sp = 0, a_eesp = 0;
      var p_ee = [];
      p_ee[age] = 1;
      var p_sp = [];
      var p_eesp = [];
      p_eesp[age] = 1;
      var qn_m = [];
      //q for non-annuitant male
      var qn_f = [];
      //q for non-annuitant female
      var qa_m = [];
      //q for annuitant male
      var qa_f = [];
      //q for annuitant female
      var q417n_m = [];
      //'q for non-annuitant male 417(e)
      var q417n_f = [];
      //'q for non-annuitant female 417(e)
      var q417a_m = [];
      //'q for annuitant male 417(e)
      var q417a_f = [];
      //'q for annuitant female 417(e)
      var AA_m = [];
      //'Scale AA for males
      var AA_f = [];
      //'Scale AA for Females
      var q_m = [];
      //'q for males
      var q_f = [];
      //'q for females
      var q417_m = [];
      //'q for males 417(e)
      var q417_f = [];
      //'q for females 417(e)
      var q_ee = [];
      //'q for employee in a J&S calculation
      var q_sp = [];
      //'q for spouse in a J&S calculation
      var q417 = [];
      //'417(e) mortality table
      var q_eesp = [];
      //'q_ee and sp for J&S calculation
      var Weight_m = [];
      var Weight_f = [];
      var qUP94_m = [];
      var qUP94_f = [];
      var qGar94 = [];
      var qGam83_m = [];
      var qGam83_f = [];
      var DiscountValue_ee = [];
      var DiscountValue_sp = [];
      var DiscountValue_eesp = [];
      var AdjDiscountValue_ee = [];
      var AdjDiscountValue_sp = [];
      var AdjDiscountValue_eesp = [];
      var interest = [];
      var pvCertainPeriod = 0;
      var monthlyRate = 0;
      var Startage = 0;
      //'for mortality table
      var EndAge;
      //'for mortality table
      var v = [];
      //'interest discount for forward rates
      var COLAincrease = [];
      //Input validation
      if (rateStructure.localeCompare('spot', { ignorePunctuation: true }) === 0) {
        rateStructure = 'spot';
      } else if (rateStructure.localeCompare('forward', { ignorePunctuation: true }) === 0) {
        rateStructure = 'forward';
      } else if (rateStructure.localeCompare('pbgcls', { ignorePunctuation: true }) === 0) {
        rateStructure = 'pbgcls';
      } else {
        console.log('incorrect rateStructure');
        return zValue;
      }
      if (sex.localeCompare('male', { ignorePunctuation: true }) === 0 || sex.localeCompare('male', { ignorePunctuation: true }) === 0) {
        sex = 'male';
      } else {
        sex = 'female';
      }
      if (ARA < age) {
        certainPeriod = Math.max(certainPeriod - age + ARA, 0);
        tempPeriod = Math.max(tempPeriod - age + ARA, 0);
        ARA = age;
      }
      //Set mortality table start age and end age
      if (mortName == 'ownstatic' || mortName == 'owngenerational') {
        //TODO may need to make this a parameter now.
        Startage = 0;
        EndAge = Math.trunc(Math.min(mortTable.length + Startage - 1, 120));
      } else {
        Startage = 0;
        EndAge = 120;
      }
      if (!Array.isArray(rates)) {
        console.log('ERROR: Rates must be array');
        return -1;
      }
      //Figure out size of mortTable
      mortTableLength = mortTable[0].length;
      if (tempPeriod < 0.1) {
        //Calculates up to EndAge
        tempPeriod = 500;
      }
      //Setup spouse information
      if (spouseAge < 1) {
        spouseAge = age;
        spouseARA = ARA;
        pctEE = 1;
        pctBoth = 1;
        pctSpouse = 0;
      } else {
        spouseARA = ARA - age + spouseAge;
      }
      p_sp[spouseAge] = 1;
      //Set up interest array
      for (x = 0; x < age - 1; x++) {
        interest[x] = 0;
      }
      //convert values to percentages
      for (x = 0; x < rates.length; x++) {
        rates[x] = rates[x] / 100;
      }
      if (!Array.isArray(COLApct)) {
        COLApct = COLApct / 100;
      } else {
        for (x = 0; x < COLApct.length; x++) {
          COLApct[x] = COLApct[x] / 100;
        }
      }
      pctSpouse = pctSpouse / 100;
      console.log('----zValue Params---------');
      console.log('rateStructure = ', rateStructure);
      console.log('mortName = ', mortName);
      console.log('mortProjection = ', mortProjection);
      console.log('age = ', age);
      console.log('ARA = ', ARA);
      console.log('sex = ', sex);
      console.log('certainPeriod = ', certainPeriod);
      console.log('tempPeriod = ', tempPeriod);
      console.log('spouseAge = ', spouseAge);
      console.log('pctEE = ', pctEE);
      console.log('pctBoth = ', pctBoth);
      console.log('pctSpouse = ', pctSpouse);
      console.log('COLApct = ', COLApct);
      console.log('COLAStartAge = ', COLAStartAge);
      console.log('----zValue Params End---------');
      switch (rateStructure) {
        case 'spot':
          numRates = rates.length;
          if (numRates == 3) {
            for (x = age; x < age + 4; x++) {
              interest[x] = rates[0];
            }
            for (x = age + 5; x < age + 19; x++) {
              interest[x] = rates[1];
            }
            for (x = age + 20; x < 200; x++) {
              interest[x] = rates[2];
            }
          } else {
            for (x = age; x < age + numRates - 1; x++) {
              interest[x] = rates[x - age + 1];
            }
            for (x = age + numRates - 1; x < 200; x++) {
              interest[x] = rates[numRates - 1];
            }
          }
          break;
        case 'forward':
          var invalidRates = false;
          if (rates.length > 1) {
            z = 0;
            for (y = 0; y < rates.length; y++) {
              for (x = age + z; x < age + rates[y][0] - 1; x++) {
                interest[x] = rates[y][1];
              }
              z = rates[y][0];
            }
          }
          if (invalidRates) {
            z = 0;
            for (y = 0; y < rates.length; y += 2) {
              for (x = age + z; x < age + rates[y] - 1; x++) {
                interest[x] = rates[y + 1];
              }
              z = rates[y];
            }
          }
          break;
        case 'pbgcls':
          for (x = ARA; x < 200; x++) {
            interest[x] = rates[0];
          }
          for (x = ARA - 1; x > Math.max(ARA - 7, age); x--) {
            interest[x] = rates[1];
          }
          for (x = ARA - 8; x > Math.max(ARA - 15, age); x--) {
            interest[x] = rates[2];
          }
          for (x = ARA - 16; x > Math.max(ARA - 120, age); x--) {
            interest[x] = rates[3];
          }
          break;
      }
      //END INTEREST ARRAY WORK
      //Check for COLAWork
      var doCOLAWork = true;
      if (COLAStartAge < 1) {
        for (x = 0; x < 500; x++) {
          COLAincrease[x] = 1;
        }
        doCOLAWork = false;
      }
      if (doCOLAWork) {
        for (x = 0; x < COLAStartAge; x++) {
          COLAincrease[x] = 1;
        }
        if (COLApct === 0) {
          for (x = COLAStartAge; x < 500; x++) {
            COLAincrease[x] = 1;
          }
        } else {
          if (!Array.isArray(COLApct)) {
            for (x = COLAStartAge; x < 500; x++) {
              COLAincrease[x] = COLAincrease[x - 1] * (1 + COLApct);
            }
          } else {
          }
        }
      }
      //END COLAWork
      service_.PopulateMortalityTableMale(qn_m, qa_m, AA_m, Weight_m, qUP94_m, qGar94, qGam83_m);
      service_.PopulateMortalityTableFemale(qn_f, qa_f, AA_f, Weight_f, qUP94_f, qGam83_f);
      //MORTALITY TABLE WORK
      switch (mortName) {
        case 'ownstatic':
          if (sex == 'male') {
            service_.FillOwnStaticTable(q_ee, q_sp, mortProjection, mortTable, mortTableLength, ARA, spouseARA, Startage, EndAge);
          } else {
            service_.FillOwnStaticTable(q_sp, q_ee, mortProjection, mortTable, mortTableLength, ARA, spouseARA, Startage, EndAge);
          }
          break;
        case 'owngenerational':
          if (sex == 'male') {
            service_.FillOwnGenerationalTable(q_ee, q_sp, mortProjection, mortTable, mortTableLength, ARA, spouseARA, age, spouseAge, Startage, EndAge);
          } else {
            service_.FillOwnGenerationalTable(q_sp, q_ee, mortProjection, mortTable, mortTableLength, ARA, spouseARA, age, spouseAge, Startage, EndAge);
          }
          break;
        //DO NOT CHANGE ORDER OF CASE STATEMENTS BELOW//////////
        case 'ppa417e':
        case 'ppasmallls':
        case 'ppasmall':
        case 'ppastaticls':
        case 'ppastatic':
        case 'ppagenerational':
        case 'ppagenerationalls':
          sevice_.FillPPATable(qn_m, qa_m, 40, 55, AA_m, Weight_m, mortProjection, q417n_m, q417a_m, q417_m);
          sevice_.FillPPATable(qn_f, qa_f, 44, 21, AA_f, Weight_f, mortProjection, q417n_f, q417a_f, q417_f);
          for (x = 0; x < 120; x++) {
            q417[x] = q417_m[x] * 0.5 + q417_f[x] * 0.5;
          }
          if (mortName == 'ppa417e') {
            for (x = 0; x < 120; x++) {
              q_ee[x] = q417[x];
              q_sp[x] = q417[x];
            }
            //SWITCH STATEMENT BREAK////////
            //INTENTIONAL////////////
            break;
          }
          if (mortName == 'ppasmallls' || mortName == 'ppastaticls' || mortName == 'ppasmall' || mortName == 'ppastatic') {
            sevice_.FillPPATable(qn_m, qa_m, 40, 55, AA_m, Weight_m, mortProjection, qn_m, qa_m, q_m);
            sevice_.FillPPATable(qn_f, qa_f, 44, 21, AA_f, Weight_f, mortProjection, qn_f, qa_f, q_f);
            if (mortName == 'ppasmallls' || mortName == 'ppastaticls') {
              if (sex == 'male') {
                service_.FillPPALS(q_m, q_f, q417, ARA, spouseARA, q_ee, q_sp);
              } else if (sex == 'female') {
                service_.FillPPALS(q_f, q_m, q417, ARA, spouseARA, q_ee, q_sp);
              }
            } else if (mortName == 'ppasmall' || mortName == 'ppastatic') {
              if (sex == 'male') {
                service_.FillPPA(q_m, q_f, q_ee, q_sp);
              } else if (sex == 'female') {
                service_.FillPPA(q_f, q_m, q_ee, q_sp);
              }
            }
            //SWITCH STATEMENT BREAK////////
            //INTENTIONAL////////////
            break;
          }
          if (mortName == 'ppagenerationalls') {
            if (sex == 'male') {
              service_.FillPPAGenerationalLS(qn_m, q417, AA_m, AA_f, mortProjection, age, spouseAge, q_ee, q_sp);
            } else if (sex == 'female') {
              service_.FillPPAGenerationalLS(qn_f, q417, AA_f, AA_m, mortProjection, age, spouseAge, q_ee, q_sp);
            }
          } else if (mortName == 'ppagenerational') {
            if (sex == 'male') {
              service_.FillPPAGenerational(qn_m, qa_m, qn_f, qa_f, AA_m, AA_f, mortProjection, age, spouseAge, q_ee, q_sp);
            } else if (sex == 'female') {
              service_.FillPPAGenerational(qn_f, qa_f, qn_m, qn_f, AA_f, AA_m, mortProjection, age, spouseAge, q_ee, q_sp);
            }
          }
          break;
        case 'pbgcmort':
          if (sex == 'male') {
            for (x = 0; x < 120; x++) {
              q_ee[x] = qUP94_m[x] * Math.pow(1 - AA_m[x], mortProjection - 1994 + 10);
              q_sp[x] = qUP94_f[x] * Math.pow(1 - AA_f[x], mortProjection - 1994 + 10);
            }
          } else if (sex == 'female') {
            for (x = 0; x < 120; x++) {
              q_ee[x] = qUP94_f[x] * Math.pow(1 - AA_f[x], mortProjection - 1994 + 10);
              q_sp[x] = qUP94_m[x] * Math.pow(1 - AA_m[x], mortProjection - 1994 + 10);
            }
          }
          break;
        case 'gar94':
          for (x = 0; x < 120; x++) {
            q_ee[x] = qGar94[x];
            q_sp[x] = qGar94[x];
          }
          break;
        case 'gam83':
          if (sex == 'male') {
            for (x = 0; x < 120; x++) {
              q_ee[x] = qGam83_m[x];
              q_sp[x] = qGam83_f[x];
            }
          } else if (sex == 'female') {
            for (x = 0; x < 120; x++) {
              q_ee[x] = qGam83_f[x];
              q_sp[x] = qGam83_m[x];
            }
          }
          break;
      }
      //END SWITCH STATEMENT
      //END INDIVIDUAL MORT WORK
      //Joint table
      minJSq = Math.max(0, 1 - spouseAge + age);
      maxJSq = Math.min(120, 120 - spouseAge + age);
      for (x = minJSq; x < maxJSq; x++) {
        q_eesp[x] = 1 - (1 - q_ee[x]) * (1 - q_sp[x - age + spouseAge]);
      }
      //PV Calculation
      for (x = age + 1; x < 121; x++) {
        p_ee[x] = p_ee[x - 1] * (1 - q_ee[x - 1]);
      }
      for (x = spouseAge + 1; x < 121; x++) {
        p_sp[x] = p_sp[x - 1] * (1 - q_sp[x - 1]);
      }
      for (x = age + 1; x < 121; x++) {
        p_eesp[x] = p_eesp[x - 1] * (1 - q_eesp[x - 1]);
      }
      switch (rateStructure) {
        case 'spot':
          //Discount Values
          for (x = age; x < EndAge; x++) {
            if (x < ARA) {
              DiscountValue_ee[x] = 0;
            } else {
              DiscountValue_ee[x] = p_ee[x] * Math.pow(1 + interest[x], -(x - age));
            }
          }
          for (x = spouseAge; x < EndAge; x++) {
            if (x < spouseARA) {
              DiscountValue_sp[x] = 0;
            } else {
              DiscountValue_sp[x] = p_sp[x] * Math.pow(1 + interest[x - spouseAge + age], -(x - spouseAge));
            }
          }
          for (x = age; x < EndAge; x++) {
            if (x < ARA) {
              DiscountValue_eesp[x] = 0;
            } else {
              DiscountValue_eesp[x] = p_eesp[x] * Math.pow(1 + interest[x], -(x - age));
            }
          }
          //Adj Discount Values
          for (x = age; x < EndAge; x++) {
            if (x < ARA) {
              AdjDiscountValue_ee[x] = 0;
            } else {
              //TODO Possible Integer division issue
              AdjDiscountValue_ee[x] = (DiscountValue_ee[x] - (11 / 24 * p_ee[x] * Math.pow(1 + interest[x], -(x - age)) - 11 / 24 * p_ee[x + 1] * Math.pow(1 + interest[x], -(x - age + 1)))) * COLAincrease[x];
            }
          }
          for (x = spouseAge; x < EndAge; x++) {
            if (x < spouseARA) {
              AdjDiscountValue_sp[x] = 0;
            } else {
              //TODO Possible Integer division issue
              AdjDiscountValue_sp[x] = (DiscountValue_sp[x] - (11 / 24 * p_sp[x] * Math.pow(1 + interest[x - spouseAge + age], -(x - spouseAge)) - 11 / 24 * p_sp[x + 1] * Math.pow(1 + interest[x - spouseAge + age], -(x - spouseAge + 1)))) * COLAincrease[x];
            }
          }
          for (x = age; x < EndAge; x++) {
            if (x < ARA) {
              AdjDiscountValue_eesp[x] = 0;
            } else {
              //TODO Possible Integer division issue
              AdjDiscountValue_eesp[x] = (DiscountValue_eesp[x] - (11 / 24 * p_eesp[x] * Math.pow(1 + interest[x], -(x - age)) - 11 / 24 * p_eesp[x + 1] * Math.pow(1 + interest[x], -(x - age + 1)))) * COLAincrease[x];
            }
          }
          //Adjust for certain Period
          for (x = ARA; x < ARA + certainPeriod - 1; x++) {
            monthlyRate = Math.pow(1 + interest[x], 1 / 12) - 1;
            pvCertainPeriod = pvCertainPeriod + Math.pow(1 + interest[x], age - x) * ((1 - 1 / Math.pow(1 + monthlyRate, 12)) / monthlyRate / 12 * (1 + monthlyRate)) * p_ee[ARA] * COLAincrease[x];
          }
          break;
        case 'forward':
        case 'pbgcls':
          for (x = 0; x < age; x++) {
            v[x] = 1;
          }
          for (x = age; x < 200; x++) {
            v[x] = v[x - 1] / (1 + interest[x - 1]);
          }
          for (x = age; x < EndAge; x++) {
            if (x < ARA) {
              DiscountValue_ee[x] = 0;
            } else {
              DiscountValue_ee[x] = p_ee[x] * v[x];
            }
          }
          for (x = spouseAge; x < EndAge; x++) {
            if (x < spouseARA) {
              DiscountValue_sp[x] = 0;
            } else {
              DiscountValue_sp[x] = p_sp[x] * v[x - spouseAge + age];
            }
          }
          for (x = age; x < EndAge; x++) {
            if (x < ARA) {
              DiscountValue_eesp[x] = 0;
            } else {
              DiscountValue_eesp[x] = p_eesp[x] * v[x];
            }
          }
          for (x = age; x < EndAge; x++) {
            if (x < ARA) {
              AdjDiscountValue_ee[x] = 0;
            } else {
              //TODO Possible Integer division issue
              AdjDiscountValue_ee[x] = (DiscountValue_ee[x] - (11 / 24 * p_ee[x] * v[x] - 11 / 24 * p_ee[x + 1] * v[x])) * COLAincrease[x];
            }
          }
          for (x = spouseAge; x < EndAge; x++) {
            if (x < spouseARA) {
              AdjDiscountValue_sp[x] = 0;
            } else {
              //TODO Possible Integer division issue
              AdjDiscountValue_sp[x] = (DiscountValue_sp[x] - (11 / 24 * p_sp[x] * v[x - spouseAge + age] - 11 / 24 * p_sp[x + 1] * v[x - spouseAge + age])) * COLAincrease[x];
            }
          }
          for (x = age; x < EndAge; x++) {
            if (x < ARA) {
              AdjDiscountValue_eesp[x] = 0;
            } else {
              //TODO Possible Integer division issue
              AdjDiscountValue_eesp[x] = (DiscountValue_eesp[x] - (11 / 24 * p_eesp[x] * v[x] - 11 / 24 * p_eesp[x + 1] * v[x])) * COLAincrease[x];
            }
          }
          //Adjust for certain Period
          for (x = ARA; x < ARA + certainPeriod - 1; x++) {
            monthlyRate = Math.pow(1 + interest[x], 1 / 12) - 1;
            pvCertainPeriod = pvCertainPeriod + v[x] * ((1 - 1 / Math.pow(1 + monthlyRate, 12)) / monthlyRate / 12 * (1 + monthlyRate)) * p_ee[ARA] * COLAincrease[x];
          }
          break;
      }
      //DISCOUNT ADJUST SWITCH END
      var endSum = Math.min(ARA + tempPeriod - 1, EndAge);
      for (x = ARA + certainPeriod; x < endSum; x++) {
        a_ee = a_ee + AdjDiscountValue_ee[x];
      }
      endSum = Math.min(spouseARA + tempPeriod - 1, EndAge);
      for (x = spouseARA + certainPeriod; x < endSum; x++) {
        a_sp = a_sp + AdjDiscountValue_sp[x];
      }
      endSum = Math.min(ARA + tempPeriod - 1, EndAge);
      for (x = ARA + certainPeriod; x < endSum; x++) {
        a_eesp = a_eesp + AdjDiscountValue_eesp[x];
      }
      //Final value calculation
      zValue = pctEE * a_ee + pctSpouse * a_sp - (pctEE + pctSpouse - pctBoth) * a_eesp + pvCertainPeriod;
      return zValue;
    };  //Function END

    //Defined benefit functions begin here
    this.ComputeEmployeeContrib = function(ageAtHire, ageAtRetire, startSalary, investReturn, wageIncrease, adjustedTotalWages) {
      investReturn = investReturn / 100;
      var employeeContrib = adjustedTotalWages / ((Math.pow(1 + investReturn, ageAtRetire - ageAtHire) - Math.pow(1 + wageIncrease, ageAtRetire - ageAtHire)) / (investReturn - wageIncrease)) / (startSalary * (1 + (investReturn * 11 / 24)));
      return employeeContrib;
    };

    this.GenerateTotalWages = function(sex, COLApct, ageAtRetire, spouseAge, wageAtRetire, finalSalaryYears, incomeReplacement, wageIncrease, interestRate, survivorPct) {
      console.log('Total Wage Variables:', sex, ageAtRetire, spouseAge, wageAtRetire);
      var outputIncomeTable = [];
      var grossWages = 0;
      var adjustedWages = 0;
      var maleMortTable = service_.CreateMaleMortTable();
      var femaleMortTable = service_.CreateFemaleMortTable();
      interestRate = interestRate / 100;
      survivorPct = survivorPct / 100;
      COLApct = COLApct / 100;
      spouseAge = ageAtRetire - spouseAge;
      var spouseAgeAtRetire = spouseAge;
      outputIncomeTable[ageAtRetire] = {
        age: 0,
        spouseAge: 0,
        cashFlow: 0,
        mortalityReduction: 0,
        cashFlowReduced: 0
      };
      outputIncomeTable[ageAtRetire].age = ageAtRetire;
      outputIncomeTable[ageAtRetire].spouseAge = spouseAge;
      outputIncomeTable[ageAtRetire].cashFlow = wageAtRetire / Math.pow(1 + wageIncrease, finalSalaryYears / 2 - 0.5) * incomeReplacement;
      if (sex == 'male') {
        outputIncomeTable[ageAtRetire].mortalityReduction = maleMortTable[ageAtRetire][ageAtRetire + 2] * outputIncomeTable[ageAtRetire].cashFlow + (1 - maleMortTable[ageAtRetire][ageAtRetire + 2]) * femaleMortTable[spouseAge][spouseAgeAtRetire] * outputIncomeTable[ageAtRetire].cashFlow * survivorPct;
      } else {
        outputIncomeTable[ageAtRetire].mortalityReduction = femaleMortTable[ageAtRetire][ageAtRetire + 2] * outputIncomeTable[ageAtRetire].cashFlow + (1 - femaleMortTable[ageAtRetire][ageAtRetire + 2]) * maleMortTable[spouseAge][spouseAgeAtRetire] * outputIncomeTable[ageAtRetire].cashFlow * survivorPct;
      }
      outputIncomeTable[ageAtRetire].cashFlowReduced = outputIncomeTable[ageAtRetire].mortalityReduction / Math.pow(1 + interestRate, ageAtRetire - ageAtRetire);
      grossWages += outputIncomeTable[ageAtRetire].cashFlowReduced;

      for (var iAge = ageAtRetire + 1; iAge < 120; iAge++, spouseAge++) {
        outputIncomeTable[iAge] = {
          age: 0,
          spouseAge: 0,
          cashFlow: 0,
          mortalityReduction: 0,
          cashFlowReduced: 0
        };
        outputIncomeTable[iAge].age = iAge;
        outputIncomeTable[iAge].spouseAge = spouseAge;
        outputIncomeTable[iAge].cashFlow = outputIncomeTable[iAge - 1].cashFlow * (1 + COLApct);
        if (sex == 'male') {
          outputIncomeTable[iAge].mortalityReduction = maleMortTable[iAge][ageAtRetire + 2] * outputIncomeTable[iAge].cashFlow + (1 - maleMortTable[iAge][ageAtRetire + 2]) * femaleMortTable[spouseAge][spouseAgeAtRetire] * outputIncomeTable[iAge].cashFlow * survivorPct;
        } else {
          outputIncomeTable[iAge].mortalityReduction = femaleMortTable[iAge][ageAtRetire + 2] * outputIncomeTable[iAge].cashFlow + (1 - femaleMortTable[iAge][ageAtRetire + 2]) * maleMortTable[spouseAge][spouseAgeAtRetire] * outputIncomeTable[iAge].cashFlow * survivorPct;
        }
        outputIncomeTable[iAge].cashFlowReduced = outputIncomeTable[iAge].mortalityReduction / Math.pow(1 + interestRate, iAge - ageAtRetire);
        grossWages += outputIncomeTable[iAge].cashFlowReduced;
      }

      adjustedWages = (grossWages / outputIncomeTable[ageAtRetire].mortalityReduction - 13 / 24) * outputIncomeTable[ageAtRetire].mortalityReduction;
      console.log('Adjusted Wages = ', adjustedWages);
      return adjustedWages;
    };

    this.CreateMaleMortTable = function() {
      var mortTable = [
        [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.9, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.9, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.8, 99.8, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.8, 99.8, 99.9, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.8, 99.8, 99.9, 99.9, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.8, 99.8, 99.9, 99.9, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.8, 99.8, 99.8, 99.9, 99.9, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.8, 99.8, 99.8, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.8, 99.8, 99.8, 99.8, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.7, 99.7, 99.8, 99.8, 99.8, 99.8, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.7, 99.7, 99.7, 99.8, 99.8, 99.8, 99.8, 99.8, 99.8, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.6, 99.6, 99.7, 99.7, 99.7, 99.7, 99.8, 99.8, 99.8, 99.8, 99.8, 99.8, 99.8, 99.8, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.6, 99.6, 99.6, 99.6, 99.7, 99.7, 99.7, 99.7, 99.7, 99.7, 99.7, 99.7, 99.8, 99.8, 99.8, 99.8, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.5, 99.5, 99.5, 99.5, 99.6, 99.6, 99.6, 99.6, 99.6, 99.6, 99.7, 99.7, 99.7, 99.7, 99.7, 99.7, 99.8, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.4, 99.4, 99.4, 99.4, 99.5, 99.5, 99.5, 99.5, 99.5, 99.5, 99.6, 99.6, 99.6, 99.6, 99.6, 99.6, 99.7, 99.8, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [99.3, 99.3, 99.3, 99.3, 99.4, 99.4, 99.4, 99.4, 99.4, 99.4, 99.4, 99.5, 99.5, 99.5, 99.5, 99.5, 99.6, 99.7, 99.8, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.1, 99.1, 99.2, 99.2, 99.2, 99.3, 99.3, 99.3, 99.3, 99.3, 99.3, 99.3, 99.3, 99.4, 99.4, 99.4, 99.5, 99.6, 99.7, 99.8, 99.8, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.0, 99.0, 99.1, 99.1, 99.1, 99.1, 99.1, 99.2, 99.2, 99.2, 99.2, 99.2, 99.2, 99.2, 99.2, 99.3, 99.3, 99.4, 99.5, 99.6, 99.6, 99.7, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [98.9, 98.9, 98.9, 98.9, 99.0, 99.0, 99.0, 99.0, 99.0, 99.0, 99.1, 99.1, 99.1, 99.1, 99.1, 99.1, 99.2, 99.3, 99.4, 99.5, 99.5, 99.6, 99.7, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [98.7, 98.7, 98.8, 98.8, 98.8, 98.8, 98.9, 98.9, 98.9, 98.9, 98.9, 98.9, 98.9, 98.9, 99.0, 99.0, 99.0, 99.2, 99.3, 99.4, 99.4, 99.5, 99.6, 99.7, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [98.6, 98.6, 98.6, 98.7, 98.7, 98.7, 98.7, 98.7, 98.8, 98.8, 98.8, 98.8, 98.8, 98.8, 98.8, 98.9, 98.9, 99.0, 99.1, 99.2, 99.2, 99.3, 99.5, 99.6, 99.7, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [98.5, 98.5, 98.5, 98.5, 98.6, 98.6, 98.6, 98.6, 98.6, 98.6, 98.6, 98.7, 98.7, 98.7, 98.7, 98.7, 98.8, 98.9, 99.0, 99.1, 99.1, 99.2, 99.3, 99.5, 99.6, 99.7, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [98.3, 98.3, 98.4, 98.4, 98.4, 98.4, 98.5, 98.5, 98.5, 98.5, 98.5, 98.5, 98.5, 98.5, 98.6, 98.6, 98.6, 98.8, 98.9, 98.9, 98.9, 99.1, 99.2, 99.3, 99.5, 99.6, 99.7, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [98.2, 98.2, 98.2, 98.3, 98.3, 98.3, 98.3, 98.3, 98.4, 98.4, 98.4, 98.4, 98.4, 98.4, 98.4, 98.5, 98.5, 98.6, 98.7, 98.8, 98.8, 98.9, 99.0, 99.2, 99.3, 99.5, 99.6, 99.7, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [98.1, 98.1, 98.1, 98.1, 98.2, 98.2, 98.2, 98.2, 98.2, 98.2, 98.2, 98.2, 98.3, 98.3, 98.3, 98.3, 98.4, 98.5, 98.6, 98.7, 98.7, 98.8, 98.9, 99.0, 99.2, 99.3, 99.5, 99.6, 99.7, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [97.9, 97.9, 98.0, 98.0, 98.0, 98.0, 98.0, 98.1, 98.1, 98.1, 98.1, 98.1, 98.1, 98.1, 98.2, 98.2, 98.2, 98.4, 98.4, 98.5, 98.5, 98.6, 98.8, 98.9, 99.0, 99.2, 99.3, 99.4, 99.6, 99.7, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [97.8, 97.8, 97.8, 97.8, 97.9, 97.9, 97.9, 97.9, 97.9, 97.9, 98.0, 98.0, 98.0, 98.0, 98.0, 98.0, 98.1, 98.2, 98.3, 98.4, 98.4, 98.5, 98.6, 98.8, 98.9, 99.0, 99.2, 99.3, 99.4, 99.6, 99.7, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [97.6, 97.6, 97.7, 97.7, 97.7, 97.7, 97.8, 97.8, 97.8, 97.8, 97.8, 97.8, 97.8, 97.8, 97.9, 97.9, 97.9, 98.1, 98.2, 98.2, 98.2, 98.4, 98.5, 98.6, 98.7, 98.9, 99.0, 99.2, 99.3, 99.4, 99.6, 99.7, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [97.5, 97.5, 97.5, 97.6, 97.6, 97.6, 97.6, 97.6, 97.6, 97.7, 97.7, 97.7, 97.7, 97.7, 97.7, 97.7, 97.8, 97.9, 98.0, 98.1, 98.1, 98.2, 98.3, 98.5, 98.6, 98.7, 98.9, 99.0, 99.1, 99.3, 99.4, 99.6, 99.7, 99.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [97.3, 97.3, 97.4, 97.4, 97.4, 97.4, 97.5, 97.5, 97.5, 97.5, 97.5, 97.5, 97.5, 97.5, 97.6, 97.6, 97.6, 97.8, 97.8, 97.9, 97.9, 98.1, 98.2, 98.3, 98.4, 98.6, 98.7, 98.9, 99.0, 99.1, 99.3, 99.4, 99.5, 99.7, 99.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [97.2, 97.2, 97.2, 97.2, 97.3, 97.3, 97.3, 97.3, 97.3, 97.3, 97.4, 97.4, 97.4, 97.4, 97.4, 97.4, 97.5, 97.6, 97.7, 97.8, 97.8, 97.9, 98.0, 98.1, 98.3, 98.4, 98.6, 98.7, 98.8, 99.0, 99.1, 99.2, 99.4, 99.5, 99.7, 99.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [97.0, 97.0, 97.0, 97.1, 97.1, 97.1, 97.1, 97.1, 97.2, 97.2, 97.2, 97.2, 97.2, 97.2, 97.2, 97.3, 97.3, 97.4, 97.5, 97.6, 97.6, 97.7, 97.8, 98.0, 98.1, 98.3, 98.4, 98.5, 98.7, 98.8, 98.9, 99.1, 99.2, 99.4, 99.5, 99.7, 99.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [96.8, 96.8, 96.9, 96.9, 96.9, 96.9, 97.0, 97.0, 97.0, 97.0, 97.0, 97.0, 97.0, 97.0, 97.1, 97.1, 97.1, 97.3, 97.3, 97.4, 97.4, 97.5, 97.7, 97.8, 97.9, 98.1, 98.2, 98.3, 98.5, 98.6, 98.7, 98.9, 99.0, 99.2, 99.3, 99.5, 99.6, 99.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [96.6, 96.6, 96.7, 96.7, 96.7, 96.8, 96.8, 96.8, 96.8, 96.8, 96.8, 96.8, 96.8, 96.9, 96.9, 96.9, 97.0, 97.1, 97.2, 97.3, 97.3, 97.4, 97.5, 97.6, 97.7, 97.9, 98.0, 98.2, 98.3, 98.4, 98.6, 98.7, 98.8, 99.0, 99.1, 99.3, 99.5, 99.6, 99.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [96.4, 96.4, 96.5, 96.5, 96.5, 96.6, 96.6, 96.6, 96.6, 96.6, 96.6, 96.6, 96.6, 96.7, 96.7, 96.7, 96.7, 96.9, 97.0, 97.1, 97.1, 97.2, 97.3, 97.4, 97.5, 97.7, 97.8, 97.9, 98.1, 98.2, 98.4, 98.5, 98.6, 98.8, 98.9, 99.1, 99.3, 99.4, 99.6, 99.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [96.2, 96.2, 96.3, 96.3, 96.3, 96.3, 96.4, 96.4, 96.4, 96.4, 96.4, 96.4, 96.4, 96.4, 96.5, 96.5, 96.5, 96.7, 96.7, 96.8, 96.8, 96.9, 97.1, 97.2, 97.3, 97.5, 97.6, 97.7, 97.9, 98.0, 98.1, 98.3, 98.4, 98.6, 98.7, 98.9, 99.0, 99.2, 99.4, 99.6, 99.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [96.0, 96.0, 96.0, 96.1, 96.1, 96.1, 96.1, 96.1, 96.2, 96.2, 96.2, 96.2, 96.2, 96.2, 96.2, 96.3, 96.3, 96.4, 96.5, 96.6, 96.6, 96.7, 96.8, 97.0, 97.1, 97.2, 97.4, 97.5, 97.6, 97.8, 97.9, 98.0, 98.2, 98.3, 98.5, 98.6, 98.8, 99.0, 99.1, 99.3, 99.5, 99.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [95.7, 95.7, 95.8, 95.8, 95.8, 95.9, 95.9, 95.9, 95.9, 95.9, 95.9, 95.9, 95.9, 96.0, 96.0, 96.0, 96.0, 96.2, 96.3, 96.3, 96.3, 96.5, 96.6, 96.7, 96.8, 97.0, 97.1, 97.2, 97.4, 97.5, 97.6, 97.8, 97.9, 98.1, 98.2, 98.4, 98.5, 98.7, 98.9, 99.1, 99.3, 99.5, 99.7, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [95.5, 95.5, 95.5, 95.5, 95.6, 95.6, 95.6, 95.6, 95.6, 95.6, 95.6, 95.7, 95.7, 95.7, 95.7, 95.7, 95.8, 95.9, 96.0, 96.1, 96.1, 96.2, 96.3, 96.4, 96.6, 96.7, 96.8, 97.0, 97.1, 97.2, 97.4, 97.5, 97.6, 97.8, 97.9, 98.1, 98.2, 98.4, 98.6, 98.8, 99.0, 99.2, 99.5, 99.7, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [95.2, 95.2, 95.2, 95.2, 95.3, 95.3, 95.3, 95.3, 95.3, 95.3, 95.3, 95.4, 95.4, 95.4, 95.4, 95.4, 95.5, 95.6, 95.7, 95.8, 95.8, 95.9, 96.0, 96.1, 96.3, 96.4, 96.5, 96.7, 96.8, 96.9, 97.1, 97.2, 97.3, 97.5, 97.6, 97.8, 97.9, 98.1, 98.3, 98.5, 98.7, 98.9, 99.1, 99.4, 99.7, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [94.8, 94.8, 94.9, 94.9, 94.9, 95.0, 95.0, 95.0, 95.0, 95.0, 95.0, 95.0, 95.0, 95.1, 95.1, 95.1, 95.1, 95.3, 95.4, 95.4, 95.4, 95.6, 95.7, 95.8, 95.9, 96.1, 96.2, 96.3, 96.5, 96.6, 96.7, 96.9, 97.0, 97.1, 97.3, 97.4, 97.6, 97.8, 98.0, 98.1, 98.3, 98.6, 98.8, 99.1, 99.3, 99.7, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [94.5, 94.5, 94.5, 94.6, 94.6, 94.6, 94.6, 94.6, 94.6, 94.7, 94.7, 94.7, 94.7, 94.7, 94.7, 94.8, 94.8, 94.9, 95.0, 95.1, 95.1, 95.2, 95.3, 95.4, 95.6, 95.7, 95.8, 96.0, 96.1, 96.2, 96.4, 96.5, 96.6, 96.8, 96.9, 97.1, 97.2, 97.4, 97.6, 97.8, 98.0, 98.2, 98.4, 98.7, 99.0, 99.3, 99.6, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [94.1, 94.1, 94.2, 94.2, 94.2, 94.2, 94.2, 94.3, 94.3, 94.3, 94.3, 94.3, 94.3, 94.3, 94.3, 94.4, 94.4, 94.5, 94.6, 94.7, 94.7, 94.8, 94.9, 95.1, 95.2, 95.3, 95.5, 95.6, 95.7, 95.8, 96.0, 96.1, 96.3, 96.4, 96.5, 96.7, 96.9, 97.0, 97.2, 97.4, 97.6, 97.8, 98.0, 98.3, 98.6, 98.9, 99.2, 99.6, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [93.7, 93.7, 93.7, 93.8, 93.8, 93.8, 93.8, 93.8, 93.8, 93.9, 93.9, 93.9, 93.9, 93.9, 93.9, 94.0, 94.0, 94.1, 94.2, 94.3, 94.3, 94.4, 94.5, 94.6, 94.8, 94.9, 95.0, 95.2, 95.3, 95.4, 95.6, 95.7, 95.8, 96.0, 96.1, 96.3, 96.4, 96.6, 96.8, 97.0, 97.2, 97.4, 97.6, 97.9, 98.1, 98.4, 98.8, 99.2, 99.6, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [93.2, 93.2, 93.3, 93.3, 93.3, 93.3, 93.4, 93.4, 93.4, 93.4, 93.4, 93.4, 93.4, 93.4, 93.5, 93.5, 93.5, 93.7, 93.7, 93.8, 93.8, 93.9, 94.0, 94.2, 94.3, 94.4, 94.6, 94.7, 94.8, 95.0, 95.1, 95.2, 95.4, 95.5, 95.6, 95.8, 96.0, 96.1, 96.3, 96.5, 96.7, 96.9, 97.1, 97.4, 97.7, 98.0, 98.3, 98.7, 99.1, 99.5, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [92.7, 92.7, 92.8, 92.8, 92.8, 92.8, 92.9, 92.9, 92.9, 92.9, 92.9, 92.9, 92.9, 92.9, 93.0, 93.0, 93.0, 93.2, 93.2, 93.3, 93.3, 93.4, 93.5, 93.7, 93.8, 93.9, 94.1, 94.2, 94.3, 94.4, 94.6, 94.7, 94.8, 95.0, 95.1, 95.3, 95.4, 95.6, 95.8, 96.0, 96.2, 96.4, 96.6, 96.9, 97.1, 97.4, 97.8, 98.1, 98.5, 99.0, 99.5, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [92.2, 92.2, 92.2, 92.3, 92.3, 92.3, 92.3, 92.3, 92.3, 92.4, 92.4, 92.4, 92.4, 92.4, 92.4, 92.4, 92.5, 92.6, 92.7, 92.8, 92.8, 92.9, 93.0, 93.1, 93.3, 93.4, 93.5, 93.6, 93.8, 93.9, 94.0, 94.2, 94.3, 94.4, 94.6, 94.7, 94.9, 95.0, 95.2, 95.4, 95.6, 95.8, 96.0, 96.3, 96.6, 96.9, 97.2, 97.6, 98.0, 98.4, 98.9, 99.4, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [91.6, 91.6, 91.7, 91.7, 91.7, 91.7, 91.7, 91.8, 91.8, 91.8, 91.8, 91.8, 91.8, 91.8, 91.8, 91.9, 91.9, 92.0, 92.1, 92.2, 92.2, 92.3, 92.4, 92.5, 92.7, 92.8, 92.9, 93.0, 93.2, 93.3, 93.4, 93.6, 93.7, 93.8, 94.0, 94.1, 94.3, 94.4, 94.6, 94.8, 95.0, 95.2, 95.4, 95.7, 96.0, 96.3, 96.6, 96.9, 97.3, 97.8, 98.3, 98.8, 99.4, 100.0, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [91.0, 91.0, 91.0, 91.1, 91.1, 91.1, 91.1, 91.1, 91.1, 91.1, 91.2, 91.2, 91.2, 91.2, 91.2, 91.2, 91.3, 91.4, 91.5, 91.6, 91.6, 91.7, 91.8, 91.9, 92.0, 92.2, 92.3, 92.4, 92.5, 92.7, 92.8, 92.9, 93.1, 93.2, 93.3, 93.5, 93.6, 93.8, 94.0, 94.1, 94.3, 94.6, 94.8, 95.0, 95.3, 95.6, 95.9, 96.3, 96.7, 97.1, 97.6, 98.1, 98.7, 99.3, 100.0, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [90.3, 90.3, 90.4, 90.4, 90.4, 90.4, 90.4, 90.5, 90.5, 90.5, 90.5, 90.5, 90.5, 90.5, 90.5, 90.6, 90.6, 90.7, 90.8, 90.9, 90.9, 91.0, 91.1, 91.2, 91.4, 91.5, 91.6, 91.7, 91.9, 92.0, 92.1, 92.2, 92.4, 92.5, 92.7, 92.8, 92.9, 93.1, 93.3, 93.5, 93.7, 93.9, 94.1, 94.3, 94.6, 94.9, 95.2, 95.6, 96.0, 96.4, 96.9, 97.4, 98.0, 98.6, 99.3, 100.0, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [89.6, 89.6, 89.6, 89.7, 89.7, 89.7, 89.7, 89.7, 89.8, 89.8, 89.8, 89.8, 89.8, 89.8, 89.8, 89.8, 89.9, 90.0, 90.1, 90.2, 90.2, 90.3, 90.4, 90.5, 90.6, 90.8, 90.9, 91.0, 91.1, 91.3, 91.4, 91.5, 91.6, 91.8, 91.9, 92.1, 92.2, 92.4, 92.5, 92.7, 92.9, 93.1, 93.3, 93.6, 93.9, 94.2, 94.5, 94.8, 95.2, 95.6, 96.1, 96.6, 97.2, 97.8, 98.5, 99.2, 100.0, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [88.8, 88.8, 88.9, 88.9, 88.9, 88.9, 89.0, 89.0, 89.0, 89.0, 89.0, 89.0, 89.0, 89.0, 89.1, 89.1, 89.1, 89.2, 89.3, 89.4, 89.4, 89.5, 89.6, 89.7, 89.9, 90.0, 90.1, 90.2, 90.4, 90.5, 90.6, 90.7, 90.9, 91.0, 91.1, 91.3, 91.4, 91.6, 91.8, 91.9, 92.1, 92.3, 92.5, 92.8, 93.1, 93.4, 93.7, 94.0, 94.4, 94.8, 95.3, 95.8, 96.4, 97.0, 97.6, 98.4, 99.1, 100.0, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [88.0, 88.0, 88.1, 88.1, 88.1, 88.1, 88.2, 88.2, 88.2, 88.2, 88.2, 88.2, 88.2, 88.2, 88.2, 88.3, 88.3, 88.4, 88.5, 88.6, 88.6, 88.7, 88.8, 88.9, 89.0, 89.2, 89.3, 89.4, 89.5, 89.7, 89.8, 89.9, 90.0, 90.2, 90.3, 90.4, 90.6, 90.8, 90.9, 91.1, 91.3, 91.5, 91.7, 91.9, 92.2, 92.5, 92.8, 93.2, 93.5, 94.0, 94.4, 94.9, 95.5, 96.1, 96.8, 97.5, 98.2, 99.1, 1.0000, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [87.2, 87.2, 87.2, 87.2, 87.3, 87.3, 87.3, 87.3, 87.3, 87.3, 87.3, 87.3, 87.4, 87.4, 87.4, 87.4, 87.5, 87.6, 87.6, 87.7, 87.7, 87.8, 87.9, 88.1, 88.2, 88.3, 88.4, 88.5, 88.7, 88.8, 88.9, 89.0, 89.2, 89.3, 89.4, 89.6, 89.7, 89.9, 90.0, 90.2, 90.4, 90.6, 90.8, 91.1, 91.3, 91.6, 91.9, 92.3, 92.6, 93.0, 93.5, 94.0, 94.6, 95.2, 95.8, 96.5, 97.3, 98.1, 0.9903, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [86.3, 86.3, 86.3, 86.3, 86.4, 86.4, 86.4, 86.4, 86.4, 86.4, 86.4, 86.4, 86.5, 86.5, 86.5, 86.5, 86.5, 86.7, 86.7, 86.8, 86.8, 86.9, 87.0, 87.1, 87.3, 87.4, 87.5, 87.6, 87.7, 87.9, 88.0, 88.1, 88.2, 88.4, 88.5, 88.6, 88.8, 88.9, 89.1, 89.3, 89.5, 89.7, 89.9, 90.1, 90.4, 90.7, 91.0, 91.3, 91.7, 92.1, 92.5, 93.0, 93.6, 94.2, 94.8, 95.5, 96.3, 97.1, 0.9800, 99.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [85.3, 85.3, 85.4, 85.4, 85.4, 85.4, 85.4, 85.4, 85.5, 85.5, 85.5, 85.5, 85.5, 85.5, 85.5, 85.6, 85.6, 85.7, 85.8, 85.9, 85.9, 86.0, 86.1, 86.2, 86.3, 86.4, 86.5, 86.7, 86.8, 86.9, 87.0, 87.1, 87.3, 87.4, 87.5, 87.7, 87.8, 88.0, 88.1, 88.3, 88.5, 88.7, 88.9, 89.1, 89.4, 89.7, 90.0, 90.3, 90.7, 91.1, 91.5, 92.0, 92.5, 93.1, 93.8, 94.5, 95.2, 96.0, 0.9692, 97.9, 98.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [84.3, 84.3, 84.4, 84.4, 84.4, 84.4, 84.4, 84.4, 84.4, 84.5, 84.5, 84.5, 84.5, 84.5, 84.5, 84.5, 84.6, 84.7, 84.8, 84.8, 84.8, 84.9, 85.0, 85.2, 85.3, 85.4, 85.5, 85.6, 85.7, 85.9, 86.0, 86.1, 86.2, 86.4, 86.5, 86.6, 86.8, 86.9, 87.1, 87.2, 87.4, 87.6, 87.8, 88.1, 88.3, 88.6, 88.9, 89.2, 89.6, 90.0, 90.4, 90.9, 91.4, 92.0, 92.7, 93.3, 94.1, 94.9, 0.9577, 96.7, 97.7, 98.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [83.2, 83.2, 83.3, 83.3, 83.3, 83.3, 83.3, 83.4, 83.4, 83.4, 83.4, 83.4, 83.4, 83.4, 83.4, 83.5, 83.5, 83.6, 83.7, 83.8, 83.8, 83.9, 84.0, 84.1, 84.2, 84.3, 84.4, 84.5, 84.7, 84.8, 84.9, 85.0, 85.1, 85.3, 85.4, 85.5, 85.7, 85.8, 86.0, 86.1, 86.3, 86.5, 86.7, 86.9, 87.2, 87.5, 87.8, 88.1, 88.4, 88.8, 89.3, 89.8, 90.3, 90.9, 91.5, 92.2, 92.9, 93.7, 0.9455, 95.5, 96.5, 97.6, 98.7, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [82.1, 82.1, 82.1, 82.2, 82.2, 82.2, 82.2, 82.2, 82.2, 82.2, 82.2, 82.3, 82.3, 82.3, 82.3, 82.3, 82.4, 82.5, 82.5, 82.6, 82.6, 82.7, 82.8, 82.9, 83.0, 83.1, 83.3, 83.4, 83.5, 83.6, 83.7, 83.8, 84.0, 84.1, 84.2, 84.3, 84.5, 84.6, 84.8, 84.9, 85.1, 85.3, 85.5, 85.7, 86.0, 86.3, 86.6, 86.9, 87.2, 87.6, 88.0, 88.5, 89.0, 89.6, 90.2, 90.9, 91.6, 92.4, 0.9325, 94.2, 95.2, 96.2, 97.4, 98.6, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [80.9, 80.9, 80.9, 80.9, 81.0, 81.0, 81.0, 81.0, 81.0, 81.0, 81.0, 81.0, 81.0, 81.0, 81.1, 81.1, 81.1, 81.2, 81.3, 81.4, 81.4, 81.5, 81.6, 81.7, 81.8, 81.9, 82.0, 82.1, 82.2, 82.4, 82.5, 82.6, 82.7, 82.8, 83.0, 83.1, 83.2, 83.4, 83.5, 83.7, 83.9, 84.0, 84.2, 84.5, 84.7, 85.0, 85.3, 85.6, 85.9, 86.3, 86.7, 87.2, 87.7, 88.3, 88.9, 89.5, 90.3, 91.0, 0.9187, 92.8, 93.7, 94.8, 95.9, 97.2, 98.5, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [79.6, 79.6, 79.6, 79.6, 79.6, 79.7, 79.7, 79.7, 79.7, 79.7, 79.7, 79.7, 79.7, 79.7, 79.8, 79.8, 79.8, 79.9, 80.0, 80.1, 80.1, 80.2, 80.3, 80.4, 80.5, 80.6, 80.7, 80.8, 80.9, 81.0, 81.1, 81.3, 81.4, 81.5, 81.6, 81.7, 81.9, 82.0, 82.2, 82.3, 82.5, 82.7, 82.9, 83.1, 83.3, 83.6, 83.9, 84.2, 84.5, 84.9, 85.3, 85.8, 86.3, 86.8, 87.4, 88.1, 88.8, 89.6, 0.9038, 91.3, 92.2, 93.3, 94.4, 95.6, 96.9, 98.4, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [78.2, 78.2, 78.2, 78.2, 78.2, 78.3, 78.3, 78.3, 78.3, 78.3, 78.3, 78.3, 78.3, 78.3, 78.3, 78.4, 78.4, 78.5, 78.6, 78.7, 78.7, 78.7, 78.8, 78.9, 79.1, 79.2, 79.3, 79.4, 79.5, 79.6, 79.7, 79.8, 79.9, 80.1, 80.2, 80.3, 80.4, 80.6, 80.7, 80.9, 81.0, 81.2, 81.4, 81.6, 81.9, 82.1, 82.4, 82.7, 83.1, 83.4, 83.8, 84.3, 84.8, 85.3, 85.9, 86.5, 87.2, 88.0, 0.8879, 89.7, 90.6, 91.6, 92.7, 93.9, 95.2, 96.6, 98.2, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [76.7, 76.7, 76.7, 76.7, 76.7, 76.8, 76.8, 76.8, 76.8, 76.8, 76.8, 76.8, 76.8, 76.8, 76.9, 76.9, 76.9, 77.0, 77.1, 77.2, 77.2, 77.2, 77.3, 77.4, 77.5, 77.7, 77.8, 77.9, 78.0, 78.1, 78.2, 78.3, 78.4, 78.5, 78.6, 78.8, 78.9, 79.0, 79.2, 79.3, 79.5, 79.7, 79.9, 80.1, 80.3, 80.6, 80.8, 81.1, 81.5, 81.8, 82.2, 82.7, 83.2, 83.7, 84.3, 84.9, 85.6, 86.3, 0.8709, 87.9, 88.9, 89.9, 90.9, 92.1, 93.4, 94.8, 96.4, 98.1, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [75.1, 75.1, 75.1, 75.1, 75.2, 75.2, 75.2, 75.2, 75.2, 75.2, 75.2, 75.2, 75.2, 75.2, 75.3, 75.3, 75.3, 75.4, 75.5, 75.5, 75.5, 75.6, 75.7, 75.8, 75.9, 76.0, 76.1, 76.2, 76.4, 76.5, 76.6, 76.7, 76.8, 76.9, 77.0, 77.1, 77.3, 77.4, 77.5, 77.7, 77.8, 78.0, 78.2, 78.4, 78.6, 78.9, 79.2, 79.4, 79.8, 80.1, 80.5, 81.0, 81.4, 81.9, 82.5, 83.1, 83.8, 84.5, 0.8528, 86.1, 87.0, 88.0, 89.0, 90.2, 91.5, 92.8, 94.4, 96.1, 97.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [73.4, 73.4, 73.4, 73.4, 73.5, 73.5, 73.5, 73.5, 73.5, 73.5, 73.5, 73.5, 73.5, 73.5, 73.6, 73.6, 73.6, 73.7, 73.8, 73.8, 73.8, 73.9, 74.0, 74.1, 74.2, 74.3, 74.4, 74.5, 74.6, 74.7, 74.8, 74.9, 75.1, 75.2, 75.3, 75.4, 75.5, 75.7, 75.8, 75.9, 76.1, 76.3, 76.4, 76.7, 76.9, 77.1, 77.4, 77.7, 78.0, 78.3, 78.7, 79.1, 79.6, 80.1, 80.7, 81.3, 81.9, 82.6, 0.8336, 84.2, 85.1, 86.0, 87.0, 88.2, 89.4, 90.7, 92.2, 93.9, 95.7, 97.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [71.6, 71.6, 71.6, 71.6, 71.7, 71.7, 71.7, 71.7, 71.7, 71.7, 71.7, 71.7, 71.7, 71.7, 71.8, 71.8, 71.8, 71.9, 72.0, 72.0, 72.0, 72.1, 72.2, 72.3, 72.4, 72.5, 72.6, 72.7, 72.8, 72.9, 73.0, 73.1, 73.2, 73.3, 73.4, 73.6, 73.7, 73.8, 73.9, 74.1, 74.2, 74.4, 74.6, 74.8, 75.0, 75.2, 75.5, 75.8, 76.1, 76.4, 76.8, 77.2, 77.6, 78.1, 78.7, 79.3, 79.9, 80.6, 0.8132, 82.1, 83.0, 83.9, 84.9, 86.0, 87.2, 88.5, 90.0, 91.6, 93.4, 95.4, 97.6, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [69.7, 69.7, 69.7, 69.7, 69.7, 69.8, 69.8, 69.8, 69.8, 69.8, 69.8, 69.8, 69.8, 69.8, 69.8, 69.9, 69.9, 70.0, 70.0, 70.1, 70.1, 70.2, 70.3, 70.4, 70.5, 70.6, 70.7, 70.8, 70.9, 71.0, 71.1, 71.2, 71.3, 71.4, 71.5, 71.6, 71.7, 71.8, 72.0, 72.1, 72.2, 72.4, 72.6, 72.8, 73.0, 73.2, 73.5, 73.7, 74.0, 74.4, 74.7, 75.1, 75.6, 76.1, 76.6, 77.1, 77.8, 78.4, 0.7915, 79.9, 80.8, 81.7, 82.6, 83.7, 84.9, 86.2, 87.6, 89.1, 90.9, 92.8, 94.9, 97.3, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [67.6, 67.6, 67.7, 67.7, 67.7, 67.7, 67.7, 67.7, 67.7, 67.8, 67.8, 67.8, 67.8, 67.8, 67.8, 67.8, 67.9, 67.9, 68.0, 68.1, 68.1, 68.1, 68.2, 68.3, 68.4, 68.5, 68.6, 68.7, 68.8, 68.9, 69.0, 69.1, 69.2, 69.3, 69.4, 69.5, 69.6, 69.7, 69.9, 70.0, 70.1, 70.3, 70.5, 70.6, 70.9, 71.1, 71.3, 71.6, 71.9, 72.2, 72.5, 72.9, 73.4, 73.8, 74.3, 74.9, 75.5, 76.1, 0.7683, 77.6, 78.4, 79.3, 80.2, 81.3, 82.4, 83.6, 85.0, 86.5, 88.2, 90.1, 92.2, 94.5, 97.1, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [65.5, 65.5, 65.5, 65.5, 65.5, 65.6, 65.6, 65.6, 65.6, 65.6, 65.6, 65.6, 65.6, 65.6, 65.6, 65.7, 65.7, 65.8, 65.8, 65.9, 65.9, 66.0, 66.1, 66.1, 66.2, 66.3, 66.4, 66.5, 66.6, 66.7, 66.8, 66.9, 67.0, 67.1, 67.2, 67.3, 67.4, 67.5, 67.6, 67.8, 67.9, 68.1, 68.2, 68.4, 68.6, 68.8, 69.0, 69.3, 69.6, 69.9, 70.2, 70.6, 71.0, 71.5, 72.0, 72.5, 73.1, 73.7, 0.7438, 75.1, 75.9, 76.7, 77.7, 78.7, 79.8, 81.0, 82.3, 83.8, 85.4, 87.2, 89.2, 91.5, 94.0, 96.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [63.2, 63.2, 63.2, 63.3, 63.3, 63.3, 63.3, 63.3, 63.3, 63.3, 63.3, 63.3, 63.3, 63.3, 63.4, 63.4, 63.4, 63.5, 63.5, 63.6, 63.6, 63.7, 63.8, 63.8, 63.9, 64.0, 64.1, 64.2, 64.3, 64.4, 64.5, 64.5, 64.6, 64.7, 64.8, 64.9, 65.0, 65.2, 65.3, 65.4, 65.5, 65.7, 65.8, 66.0, 66.2, 66.4, 66.6, 66.9, 67.2, 67.5, 67.8, 68.1, 68.6, 69.0, 69.5, 70.0, 70.5, 71.1, 0.7179, 72.5, 73.3, 74.1, 75.0, 75.9, 77.0, 78.2, 79.4, 80.9, 82.4, 84.2, 86.1, 88.3, 90.7, 93.4, 96.5, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [60.8, 60.8, 60.8, 60.8, 60.8, 60.9, 60.9, 60.9, 60.9, 60.9, 60.9, 60.9, 60.9, 60.9, 60.9, 61.0, 61.0, 61.1, 61.1, 61.2, 61.2, 61.2, 61.3, 61.4, 61.5, 61.6, 61.7, 61.7, 61.8, 61.9, 62.0, 62.1, 62.2, 62.3, 62.4, 62.5, 62.6, 62.7, 62.8, 62.9, 63.0, 63.2, 63.3, 63.5, 63.7, 63.9, 64.1, 64.3, 64.6, 64.9, 65.2, 65.5, 65.9, 66.4, 66.8, 67.3, 67.8, 68.4, 0.6905, 69.7, 70.5, 71.2, 72.1, 73.0, 74.0, 75.2, 76.4, 77.8, 79.3, 81.0, 82.8, 84.9, 87.2, 89.9, 92.8, 96.2, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [58.2, 58.2, 58.3, 58.3, 58.3, 58.3, 58.3, 58.3, 58.3, 58.3, 58.3, 58.3, 58.3, 58.4, 58.4, 58.4, 58.4, 58.5, 58.5, 58.6, 58.6, 58.7, 58.7, 58.8, 58.9, 59.0, 59.1, 59.1, 59.2, 59.3, 59.4, 59.5, 59.6, 59.6, 59.7, 59.8, 59.9, 60.0, 60.1, 60.3, 60.4, 60.5, 60.7, 60.8, 61.0, 61.2, 61.4, 61.6, 61.9, 62.1, 62.5, 62.8, 63.2, 63.6, 64.0, 64.5, 65.0, 65.5, 0.6615, 66.8, 67.5, 68.2, 69.1, 70.0, 70.9, 72.0, 73.2, 74.5, 76.0, 77.6, 79.3, 81.3, 83.6, 86.1, 88.9, 92.1, 95.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [55.5, 55.5, 55.6, 55.6, 55.6, 55.6, 55.6, 55.6, 55.6, 55.6, 55.6, 55.6, 55.6, 55.7, 55.7, 55.7, 55.7, 55.8, 55.8, 55.9, 55.9, 55.9, 56.0, 56.1, 56.2, 56.2, 56.3, 56.4, 56.5, 56.6, 56.6, 56.7, 56.8, 56.9, 57.0, 57.1, 57.2, 57.3, 57.4, 57.5, 57.6, 57.7, 57.9, 58.0, 58.2, 58.4, 58.6, 58.8, 59.0, 59.3, 59.6, 59.9, 60.2, 60.6, 61.0, 61.5, 62.0, 62.5, 0.6309, 63.7, 64.4, 65.1, 65.9, 66.7, 67.6, 68.7, 69.8, 71.1, 72.4, 74.0, 75.7, 77.6, 79.7, 82.1, 84.8, 87.9, 91.4, 95.4, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [52.7, 52.7, 52.7, 52.8, 52.8, 52.8, 52.8, 52.8, 52.8, 52.8, 52.8, 52.8, 52.8, 52.8, 52.8, 52.9, 52.9, 52.9, 53.0, 53.0, 53.0, 53.1, 53.2, 53.2, 53.3, 53.4, 53.5, 53.5, 53.6, 53.7, 53.8, 53.8, 53.9, 54.0, 54.1, 54.2, 54.2, 54.3, 54.4, 54.5, 54.7, 54.8, 54.9, 55.1, 55.2, 55.4, 55.6, 55.8, 56.0, 56.3, 56.5, 56.8, 57.2, 57.5, 57.9, 58.4, 58.8, 59.3, 0.5988, 60.5, 61.1, 61.8, 62.5, 63.3, 64.2, 65.2, 66.3, 67.4, 68.8, 70.2, 71.8, 73.6, 75.7, 77.9, 80.5, 83.4, 86.7, 90.5, 94.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [49.8, 49.8, 49.8, 49.8, 49.8, 49.8, 49.8, 49.8, 49.8, 49.9, 49.9, 49.9, 49.9, 49.9, 49.9, 49.9, 49.9, 50.0, 50.0, 50.1, 50.1, 50.1, 50.2, 50.3, 50.3, 50.4, 50.5, 50.5, 50.6, 50.7, 50.8, 50.8, 50.9, 51.0, 51.1, 51.1, 51.2, 51.3, 51.4, 51.5, 51.6, 51.7, 51.8, 52.0, 52.1, 52.3, 52.5, 52.7, 52.9, 53.1, 53.4, 53.7, 54.0, 54.3, 54.7, 55.1, 55.5, 56.0, 0.5653, 57.1, 57.7, 58.3, 59.0, 59.8, 60.6, 61.5, 62.6, 63.7, 64.9, 66.3, 67.8, 69.5, 71.4, 73.6, 76.0, 78.7, 81.9, 85.5, 89.6, 94.4, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [46.7, 46.7, 46.7, 46.7, 46.7, 46.8, 46.8, 46.8, 46.8, 46.8, 46.8, 46.8, 46.8, 46.8, 46.8, 46.8, 46.9, 46.9, 47.0, 47.0, 47.0, 47.0, 47.1, 47.2, 47.2, 47.3, 47.4, 47.4, 47.5, 47.6, 47.6, 47.7, 47.8, 47.8, 47.9, 48.0, 48.1, 48.1, 48.2, 48.3, 48.4, 48.5, 48.7, 48.8, 48.9, 49.1, 49.2, 49.4, 49.6, 49.8, 50.1, 50.4, 50.7, 51.0, 51.3, 51.7, 52.1, 52.6, 0.5305, 53.6, 54.1, 54.7, 55.4, 56.1, 56.9, 57.7, 58.7, 59.7, 60.9, 62.2, 63.6, 65.2, 67.0, 69.0, 71.3, 73.9, 76.8, 80.2, 84.1, 88.6, 93.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [43.5, 43.5, 43.5, 43.6, 43.6, 43.6, 43.6, 43.6, 43.6, 43.6, 43.6, 43.6, 43.6, 43.6, 43.6, 43.6, 43.7, 43.7, 43.8, 43.8, 43.8, 43.8, 43.9, 44.0, 44.0, 44.1, 44.1, 44.2, 44.3, 44.3, 44.4, 44.4, 44.5, 44.6, 44.6, 44.7, 44.8, 44.9, 44.9, 45.0, 45.1, 45.2, 45.3, 45.5, 45.6, 45.7, 45.9, 46.1, 46.2, 46.4, 46.7, 46.9, 47.2, 47.5, 47.8, 48.2, 48.6, 49.0, 0.4943, 49.9, 50.4, 51.0, 51.6, 52.3, 53.0, 53.8, 54.7, 55.7, 56.8, 58.0, 59.3, 60.8, 62.5, 64.3, 66.5, 68.9, 71.6, 74.7, 78.4, 82.6, 87.4, 93.2, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [40.2, 40.2, 40.3, 40.3, 40.3, 40.3, 40.3, 40.3, 40.3, 40.3, 40.3, 40.3, 40.3, 40.3, 40.3, 40.3, 40.4, 40.4, 40.5, 40.5, 40.5, 40.5, 40.6, 40.6, 40.7, 40.8, 40.8, 40.9, 40.9, 41.0, 41.0, 41.1, 41.2, 41.2, 41.3, 41.3, 41.4, 41.5, 41.6, 41.6, 41.7, 41.8, 41.9, 42.0, 42.1, 42.3, 42.4, 42.6, 42.8, 42.9, 43.2, 43.4, 43.6, 43.9, 44.2, 44.6, 44.9, 45.3, 0.4571, 46.2, 46.6, 47.2, 47.7, 48.3, 49.0, 49.8, 50.6, 51.5, 52.5, 53.6, 54.8, 56.2, 57.8, 59.5, 61.5, 63.7, 66.2, 69.1, 72.5, 76.3, 80.9, 86.2, 92.5, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [36.9, 36.9, 36.9, 36.9, 36.9, 36.9, 36.9, 36.9, 37.0, 37.0, 37.0, 37.0, 37.0, 37.0, 37.0, 37.0, 37.0, 37.1, 37.1, 37.1, 37.1, 37.2, 37.2, 37.3, 37.3, 37.4, 37.4, 37.5, 37.5, 37.6, 37.6, 37.7, 37.7, 37.8, 37.8, 37.9, 38.0, 38.0, 38.1, 38.2, 38.3, 38.3, 38.4, 38.5, 38.6, 38.8, 38.9, 39.0, 39.2, 39.4, 39.6, 39.8, 40.0, 40.3, 40.5, 40.8, 41.2, 41.5, 0.4191, 42.3, 42.8, 43.2, 43.8, 44.3, 44.9, 45.6, 46.4, 47.2, 48.1, 49.1, 50.3, 51.5, 52.9, 54.5, 56.3, 58.4, 60.7, 63.4, 66.4, 70.0, 74.1, 79.0, 84.8, 91.7, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [33.5, 33.5, 33.5, 33.5, 33.5, 33.5, 33.5, 33.5, 33.6, 33.6, 33.6, 33.6, 33.6, 33.6, 33.6, 33.6, 33.6, 33.6, 33.7, 33.7, 33.7, 33.7, 33.8, 33.8, 33.9, 33.9, 34.0, 34.0, 34.1, 34.1, 34.2, 34.2, 34.3, 34.3, 34.4, 34.4, 34.5, 34.5, 34.6, 34.7, 34.7, 34.8, 34.9, 35.0, 35.1, 35.2, 35.3, 35.5, 35.6, 35.8, 35.9, 36.1, 36.3, 36.6, 36.8, 37.1, 37.4, 37.7, 0.3805, 38.4, 38.8, 39.3, 39.7, 40.2, 40.8, 41.4, 42.1, 42.9, 43.7, 44.6, 45.6, 46.8, 48.1, 49.5, 51.2, 53.0, 55.1, 57.5, 60.3, 63.5, 67.3, 71.7, 77.0, 83.2, 90.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [30.1, 30.1, 30.1, 30.1, 30.1, 30.1, 30.1, 30.1, 30.1, 30.1, 30.2, 30.2, 30.2, 30.2, 30.2, 30.2, 30.2, 30.2, 30.3, 30.3, 30.3, 30.3, 30.4, 30.4, 30.4, 30.5, 30.5, 30.6, 30.6, 30.6, 30.7, 30.7, 30.8, 30.8, 30.9, 30.9, 31.0, 31.0, 31.1, 31.1, 31.2, 31.3, 31.4, 31.4, 31.5, 31.6, 31.7, 31.8, 32.0, 32.1, 32.3, 32.5, 32.6, 32.8, 33.1, 33.3, 33.6, 33.9, 0.3419, 34.5, 34.9, 35.3, 35.7, 36.2, 36.7, 37.2, 37.8, 38.5, 39.3, 40.1, 41.0, 42.0, 43.2, 44.5, 46.0, 47.6, 49.5, 51.7, 54.2, 57.1, 60.5, 64.4, 69.2, 74.8, 81.6, 89.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [26.7, 26.7, 26.7, 26.7, 26.7, 26.7, 26.7, 26.8, 26.8, 26.8, 26.8, 26.8, 26.8, 26.8, 26.8, 26.8, 26.8, 26.8, 26.9, 26.9, 26.9, 26.9, 26.9, 27.0, 27.0, 27.1, 27.1, 27.1, 27.2, 27.2, 27.2, 27.3, 27.3, 27.4, 27.4, 27.4, 27.5, 27.5, 27.6, 27.6, 27.7, 27.8, 27.8, 27.9, 28.0, 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 28.8, 29.0, 29.2, 29.4, 29.6, 29.8, 30.1, 0.3034, 30.6, 31.0, 31.3, 31.7, 32.1, 32.5, 33.0, 33.6, 34.2, 34.8, 35.6, 36.4, 37.3, 38.3, 39.5, 40.8, 42.3, 43.9, 45.9, 48.1, 50.7, 53.7, 57.2, 61.4, 66.4, 72.4, 79.7, 88.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [23.4, 23.4, 23.4, 23.4, 23.4, 23.4, 23.4, 23.4, 23.4, 23.4, 23.4, 23.4, 23.4, 23.4, 23.4, 23.4, 23.5, 23.5, 23.5, 23.5, 23.5, 23.6, 23.6, 23.6, 23.7, 23.7, 23.7, 23.8, 23.8, 23.8, 23.8, 23.9, 23.9, 24.0, 24.0, 24.0, 24.1, 24.1, 24.2, 24.2, 24.2, 24.3, 24.4, 24.4, 24.5, 24.6, 24.7, 24.7, 24.8, 25.0, 25.1, 25.2, 25.4, 25.5, 25.7, 25.9, 26.1, 26.3, 0.2656, 26.8, 27.1, 27.4, 27.7, 28.1, 28.5, 28.9, 29.4, 29.9, 30.5, 31.1, 31.9, 32.7, 33.6, 34.6, 35.7, 37.0, 38.5, 40.2, 42.1, 44.4, 47.0, 50.1, 53.7, 58.1, 63.4, 69.8, 77.7, 87.5, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [20.2, 20.2, 20.2, 20.2, 20.2, 20.2, 20.2, 20.2, 20.2, 20.2, 20.2, 20.2, 20.2, 20.2, 20.2, 20.2, 20.2, 20.3, 20.3, 20.3, 20.3, 20.3, 20.3, 20.4, 20.4, 20.4, 20.4, 20.5, 20.5, 20.5, 20.6, 20.6, 20.6, 20.7, 20.7, 20.7, 20.7, 20.8, 20.8, 20.9, 20.9, 21.0, 21.0, 21.1, 21.1, 21.2, 21.3, 21.3, 21.4, 21.5, 21.6, 21.7, 21.9, 22.0, 22.2, 22.3, 22.5, 22.7, 0.2290, 23.1, 23.4, 23.6, 23.9, 24.2, 24.6, 24.9, 25.3, 25.8, 26.3, 26.9, 27.5, 28.2, 28.9, 29.8, 30.8, 31.9, 33.2, 34.6, 36.3, 38.2, 40.5, 43.2, 46.3, 50.1, 54.7, 60.2, 67.0, 75.5, 86.2, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [17.1, 17.1, 17.1, 17.1, 17.1, 17.1, 17.1, 17.1, 17.1, 17.1, 17.1, 17.1, 17.1, 17.1, 17.1, 17.1, 17.1, 17.2, 17.2, 17.2, 17.2, 17.2, 17.2, 17.3, 17.3, 17.3, 17.3, 17.4, 17.4, 17.4, 17.4, 17.5, 17.5, 17.5, 17.5, 17.6, 17.6, 17.6, 17.6, 17.7, 17.7, 17.8, 17.8, 17.8, 17.9, 18.0, 18.0, 18.1, 18.2, 18.2, 18.3, 18.4, 18.5, 18.7, 18.8, 18.9, 19.1, 19.2, 0.1941, 19.6, 19.8, 20.0, 20.3, 20.5, 20.8, 21.1, 21.5, 21.9, 22.3, 22.8, 23.3, 23.9, 24.5, 25.3, 26.1, 27.0, 28.1, 29.3, 30.8, 32.4, 34.3, 36.6, 39.3, 42.5, 46.3, 51.0, 56.8, 64.0, 73.1, 84.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [14.2, 14.2, 14.2, 14.2, 14.2, 14.2, 14.2, 14.2, 14.2, 14.2, 14.2, 14.2, 14.2, 14.2, 14.2, 14.2, 14.3, 14.3, 14.3, 14.3, 14.3, 14.3, 14.3, 14.4, 14.4, 14.4, 14.4, 14.4, 14.5, 14.5, 14.5, 14.5, 14.5, 14.6, 14.6, 14.6, 14.6, 14.7, 14.7, 14.7, 14.7, 14.8, 14.8, 14.8, 14.9, 14.9, 15.0, 15.0, 15.1, 15.2, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.9, 16.0, 0.1614, 16.3, 16.5, 16.7, 16.9, 17.1, 17.3, 17.6, 17.9, 18.2, 18.5, 18.9, 19.4, 19.9, 20.4, 21.0, 21.7, 22.5, 23.4, 24.4, 25.6, 27.0, 28.6, 30.4, 32.7, 35.3, 38.5, 42.4, 47.2, 53.2, 60.8, 70.5, 83.2, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 11.7, 11.7, 11.7, 11.7, 11.7, 11.7, 11.8, 11.8, 11.8, 11.8, 11.8, 11.8, 11.9, 11.9, 11.9, 11.9, 11.9, 12.0, 12.0, 12.0, 12.0, 12.1, 12.1, 12.1, 12.2, 12.2, 12.2, 12.3, 12.4, 12.4, 12.5, 12.6, 12.6, 12.7, 12.8, 12.9, 13.0, 0.1315, 13.3, 13.4, 13.6, 13.7, 13.9, 14.1, 14.3, 14.5, 14.8, 15.1, 15.4, 15.8, 16.2, 16.6, 17.1, 17.7, 18.3, 19.0, 19.9, 20.8, 22.0, 23.3, 24.8, 26.6, 28.8, 31.4, 34.6, 38.5, 43.3, 49.5, 57.4, 67.7, 81.5, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [9.2, 9.2, 9.2, 9.2, 9.2, 9.2, 9.2, 9.2, 9.2, 9.2, 9.2, 9.2, 9.2, 9.2, 9.2, 9.2, 9.2, 9.3, 9.3, 9.3, 9.3, 9.3, 9.3, 9.3, 9.3, 9.3, 9.3, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4, 9.5, 9.5, 9.5, 9.5, 9.5, 9.5, 9.6, 9.6, 9.6, 9.6, 9.7, 9.7, 9.7, 9.8, 9.8, 9.8, 9.9, 9.9, 10.0, 10.1, 10.1, 10.2, 10.3, 10.4, 0.1047, 10.6, 10.7, 10.8, 10.9, 11.1, 11.2, 11.4, 11.6, 11.8, 12.0, 12.3, 12.6, 12.9, 13.2, 13.6, 14.1, 14.6, 15.2, 15.8, 16.6, 17.5, 18.5, 19.7, 21.2, 22.9, 25.0, 27.5, 30.6, 34.5, 39.4, 45.7, 53.9, 64.9, 79.6, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.3, 7.3, 7.3, 7.3, 7.3, 7.3, 7.3, 7.3, 7.3, 7.3, 7.4, 7.4, 7.4, 7.4, 7.4, 7.4, 7.4, 7.5, 7.5, 7.5, 7.5, 7.5, 7.6, 7.6, 7.6, 7.7, 7.7, 7.8, 7.8, 7.9, 7.9, 8.0, 8.1, 0.0813, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.9, 9.0, 9.2, 9.3, 9.5, 9.8, 10.0, 10.3, 10.6, 10.9, 11.3, 11.8, 12.3, 12.9, 13.6, 14.4, 15.3, 16.4, 17.8, 19.4, 21.4, 23.8, 26.8, 30.6, 35.5, 41.9, 50.4, 61.8, 77.7, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 5.6, 5.6, 5.6, 5.6, 5.6, 5.6, 5.6, 5.6, 5.6, 5.7, 5.7, 5.7, 5.7, 5.7, 5.8, 5.8, 5.8, 5.8, 5.9, 5.9, 5.9, 6.0, 6.0, 6.1, 0.0615, 6.2, 6.3, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 7.1, 7.2, 7.4, 7.6, 7.8, 8.0, 8.3, 8.6, 8.9, 9.3, 9.7, 10.3, 10.9, 11.6, 12.4, 13.5, 14.7, 16.2, 18.0, 20.3, 23.1, 26.8, 31.7, 38.1, 46.8, 58.7, 75.6, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.1, 4.1, 4.1, 4.1, 4.1, 4.1, 4.1, 4.1, 4.1, 4.1, 4.1, 4.1, 4.1, 4.1, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.3, 4.3, 4.3, 4.3, 4.3, 4.4, 4.4, 4.4, 4.5, 0.0452, 4.6, 4.6, 4.7, 4.7, 4.8, 4.9, 4.9, 5.0, 5.1, 5.2, 5.3, 5.4, 5.6, 5.7, 5.9, 6.1, 6.3, 6.6, 6.8, 7.2, 7.6, 8.0, 8.5, 9.2, 9.9, 10.8, 11.9, 13.2, 14.9, 17.0, 19.8, 23.3, 28.0, 34.4, 43.2, 55.6, 73.6, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.1, 3.1, 3.1, 3.1, 3.1, 3.2, 3.2, 3.2, 0.0324, 3.3, 3.3, 3.3, 3.4, 3.4, 3.5, 3.5, 3.6, 3.6, 3.7, 3.8, 3.9, 4.0, 4.1, 4.2, 4.4, 4.5, 4.7, 4.9, 5.1, 5.4, 5.7, 6.1, 6.6, 7.1, 7.7, 8.5, 9.5, 10.7, 12.2, 14.1, 16.7, 20.1, 24.6, 30.9, 39.8, 52.7, 71.6, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.1, 2.1, 2.1, 2.1, 2.1, 2.1, 2.1, 2.1, 2.1, 2.1, 2.1, 2.1, 2.1, 2.1, 2.2, 2.2, 2.2, 2.2, 2.2, 2.2, 0.0226, 2.3, 2.3, 2.3, 2.4, 2.4, 2.4, 2.5, 2.5, 2.5, 2.6, 2.6, 2.7, 2.8, 2.9, 2.9, 3.0, 3.1, 3.3, 3.4, 3.6, 3.8, 4.0, 4.3, 4.6, 4.9, 5.4, 5.9, 6.6, 7.4, 8.5, 9.9, 11.6, 14.0, 17.2, 21.6, 27.7, 36.7, 49.9, 69.7, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [1.3, 1.3, 1.3, 1.3, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 0.0153, 1.5, 1.6, 1.6, 1.6, 1.6, 1.6, 1.7, 1.7, 1.7, 1.8, 1.8, 1.8, 1.9, 1.9, 2.0, 2.1, 2.1, 2.2, 2.3, 2.4, 2.6, 2.7, 2.9, 3.1, 3.4, 3.7, 4.0, 4.5, 5.1, 5.8, 6.7, 7.9, 9.5, 11.7, 14.6, 18.8, 24.9, 33.9, 47.3, 67.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0102, 1.0, 1.0, 1.0, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.2, 1.2, 1.2, 1.2, 1.3, 1.3, 1.4, 1.4, 1.5, 1.5, 1.6, 1.7, 1.8, 1.9, 2.1, 2.2, 2.4, 2.7, 3.0, 3.3, 3.8, 4.4, 5.2, 6.3, 7.7, 9.7, 12.5, 16.5, 22.5, 31.4, 45.0, 66.3, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.7, 0.0066, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.8, 0.8, 0.8, 0.8, 0.8, 0.9, 0.9, 0.9, 1.0, 1.0, 1.0, 1.1, 1.2, 1.2, 1.3, 1.4, 1.6, 1.7, 1.9, 2.2, 2.5, 2.9, 3.4, 4.1, 5.0, 6.3, 8.1, 10.7, 14.5, 20.3, 29.1, 42.9, 64.6, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.0041, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.6, 0.6, 0.6, 0.6, 0.7, 0.7, 0.7, 0.8, 0.8, 0.9, 1.0, 1.1, 1.2, 1.4, 1.6, 1.8, 2.1, 2.6, 3.1, 3.9, 5.1, 6.7, 9.1, 12.7, 18.3, 26.9, 40.6, 62.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.0025, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.5, 0.5, 0.6, 0.6, 0.7, 0.7, 0.8, 0.9, 1.1, 1.3, 1.6, 1.9, 2.4, 3.1, 4.1, 5.6, 7.8, 11.2, 16.4, 24.8, 38.3, 61.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.0015, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3, 0.3, 0.3, 0.3, 0.4, 0.4, 0.4, 0.5, 0.6, 0.6, 0.8, 0.9, 1.1, 1.4, 1.8, 2.4, 3.3, 4.6, 6.6, 9.7, 14.6, 22.6, 36.0, 59.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.0008, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3, 0.3, 0.4, 0.4, 0.5, 0.6, 0.8, 1.0, 1.4, 1.9, 2.6, 3.8, 5.5, 8.3, 12.9, 20.5, 33.7, 57.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0005, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.2, 0.2, 0.2, 0.2, 0.3, 0.4, 0.4, 0.6, 0.8, 1.0, 1.4, 2.1, 3.0, 4.6, 7.1, 11.3, 18.5, 31.3, 54.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0002, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.2, 0.2, 0.2, 0.3, 0.4, 0.5, 0.8, 1.1, 1.6, 2.4, 3.7, 5.9, 9.7, 16.4, 28.8, 52.6, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0001, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.1, 0.1, 0.1, 0.2, 0.2, 0.3, 0.4, 0.5, 0.8, 1.2, 1.9, 3.0, 4.9, 8.3, 14.5, 26.4, 50.2, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0001, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.1, 0.1, 0.2, 0.3, 0.4, 0.6, 0.9, 1.4, 2.3, 3.9, 6.9, 12.6, 24.0, 47.7, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0000, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.1, 0.2, 0.3, 0.4, 0.6, 1.1, 1.8, 3.1, 5.7, 10.8, 21.5, 45.1, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0000, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.2, 0.3, 0.4, 0.8, 1.3, 2.4, 4.6, 9.1, 19.1, 42.4, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0000, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.2, 0.3, 0.5, 1.0, 1.8, 3.6, 7.6, 16.7, 39.5, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.2, 0.3, 0.7, 1.3, 2.8, 6.1, 14.4, 36.5, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.2, 0.4, 0.9, 2.0, 4.8, 12.1, 33.3, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.3, 0.6, 1.4, 3.6, 10.0, 30.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.2, 0.4, 1.0, 2.6, 7.9, 26.5, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.2, 0.6, 1.8, 6.0, 22.8, 100.0, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.3, 1.1, 4.3, 18.9, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.2, 0.6, 2.8, 14.9, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.3, 1.6, 10.6, 10.6]
      ];

      for (var x = 0; x < mortTable.length; x++) {
        for (var y = 0; y < mortTable[x].length; y++) {
          mortTable[x][y] = mortTable[x][y] / 100;
        }
      }
      return mortTable;
    };

    this.CreateFemaleMortTable = function() {
      var mortTable = [
        [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.4, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.4, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.4, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.3, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.3, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.3, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.3, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.3, 99.9, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.3, 99.9, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.3, 99.8, 99.9, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.3, 99.8, 99.9, 99.9, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.3, 99.8, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.2, 99.8, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.2, 99.8, 99.8, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.2, 99.8, 99.8, 99.8, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.2, 99.8, 99.8, 99.8, 99.8, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.2, 99.7, 99.8, 99.8, 99.8, 99.8, 99.8, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.1, 99.7, 99.7, 99.8, 99.8, 99.8, 99.8, 99.8, 99.8, 99.8, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.1, 99.7, 99.7, 99.7, 99.7, 99.8, 99.8, 99.8, 99.8, 99.8, 99.8, 99.8, 99.8, 99.9, 99.9, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.1, 99.6, 99.7, 99.7, 99.7, 99.7, 99.7, 99.8, 99.8, 99.8, 99.8, 99.8, 99.8, 99.8, 99.8, 99.8, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.0, 99.6, 99.6, 99.7, 99.7, 99.7, 99.7, 99.7, 99.7, 99.7, 99.7, 99.8, 99.8, 99.8, 99.8, 99.8, 99.8, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [99.0, 99.5, 99.6, 99.6, 99.6, 99.6, 99.7, 99.7, 99.7, 99.7, 99.7, 99.7, 99.7, 99.7, 99.7, 99.8, 99.8, 99.8, 99.8, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [98.9, 99.5, 99.5, 99.6, 99.6, 99.6, 99.6, 99.6, 99.6, 99.6, 99.7, 99.7, 99.7, 99.7, 99.7, 99.7, 99.7, 99.8, 99.8, 99.8, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [98.9, 99.5, 99.5, 99.5, 99.5, 99.5, 99.6, 99.6, 99.6, 99.6, 99.6, 99.6, 99.6, 99.6, 99.7, 99.7, 99.7, 99.7, 99.8, 99.8, 99.8, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [98.8, 99.4, 99.4, 99.5, 99.5, 99.5, 99.5, 99.5, 99.5, 99.5, 99.6, 99.6, 99.6, 99.6, 99.6, 99.6, 99.6, 99.7, 99.7, 99.7, 99.8, 99.8, 99.9, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [98.8, 99.4, 99.4, 99.4, 99.4, 99.4, 99.5, 99.5, 99.5, 99.5, 99.5, 99.5, 99.5, 99.5, 99.5, 99.6, 99.6, 99.6, 99.6, 99.7, 99.7, 99.8, 99.8, 99.8, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [98.7, 99.3, 99.3, 99.4, 99.4, 99.4, 99.4, 99.4, 99.4, 99.4, 99.4, 99.5, 99.5, 99.5, 99.5, 99.5, 99.5, 99.6, 99.6, 99.6, 99.7, 99.7, 99.7, 99.8, 99.8, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [98.7, 99.2, 99.3, 99.3, 99.3, 99.3, 99.3, 99.4, 99.4, 99.4, 99.4, 99.4, 99.4, 99.4, 99.4, 99.5, 99.5, 99.5, 99.5, 99.6, 99.6, 99.6, 99.7, 99.7, 99.8, 99.8, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [98.6, 99.2, 99.2, 99.2, 99.3, 99.3, 99.3, 99.3, 99.3, 99.3, 99.3, 99.3, 99.4, 99.4, 99.4, 99.4, 99.4, 99.4, 99.5, 99.5, 99.5, 99.6, 99.6, 99.7, 99.7, 99.8, 99.8, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [98.6, 99.1, 99.2, 99.2, 99.2, 99.2, 99.2, 99.2, 99.2, 99.3, 99.3, 99.3, 99.3, 99.3, 99.3, 99.3, 99.4, 99.4, 99.4, 99.4, 99.5, 99.5, 99.6, 99.6, 99.7, 99.7, 99.8, 99.8, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [98.5, 99.1, 99.1, 99.1, 99.1, 99.1, 99.2, 99.2, 99.2, 99.2, 99.2, 99.2, 99.2, 99.2, 99.2, 99.3, 99.3, 99.3, 99.3, 99.4, 99.4, 99.5, 99.5, 99.5, 99.6, 99.6, 99.7, 99.8, 99.8, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [98.4, 99.0, 99.0, 99.0, 99.1, 99.1, 99.1, 99.1, 99.1, 99.1, 99.1, 99.1, 99.2, 99.2, 99.2, 99.2, 99.2, 99.2, 99.3, 99.3, 99.3, 99.4, 99.4, 99.5, 99.5, 99.6, 99.6, 99.7, 99.7, 99.8, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [98.3, 98.9, 98.9, 99.0, 99.0, 99.0, 99.0, 99.0, 99.0, 99.1, 99.1, 99.1, 99.1, 99.1, 99.1, 99.1, 99.1, 99.2, 99.2, 99.2, 99.3, 99.3, 99.4, 99.4, 99.5, 99.5, 99.6, 99.6, 99.7, 99.7, 99.8, 99.9, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [98.3, 98.8, 98.9, 98.9, 98.9, 98.9, 98.9, 99.0, 99.0, 99.0, 99.0, 99.0, 99.0, 99.0, 99.0, 99.0, 99.1, 99.1, 99.1, 99.2, 99.2, 99.2, 99.3, 99.3, 99.4, 99.4, 99.5, 99.5, 99.6, 99.6, 99.7, 99.8, 99.8, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [98.2, 98.8, 98.8, 98.8, 98.8, 98.8, 98.9, 98.9, 98.9, 98.9, 98.9, 98.9, 98.9, 98.9, 98.9, 99.0, 99.0, 99.0, 99.0, 99.1, 99.1, 99.2, 99.2, 99.2, 99.3, 99.3, 99.4, 99.4, 99.5, 99.6, 99.6, 99.7, 99.8, 99.8, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [98.1, 98.7, 98.7, 98.7, 98.7, 98.8, 98.8, 98.8, 98.8, 98.8, 98.8, 98.8, 98.8, 98.8, 98.9, 98.9, 98.9, 98.9, 99.0, 99.0, 99.0, 99.1, 99.1, 99.2, 99.2, 99.3, 99.3, 99.4, 99.4, 99.5, 99.5, 99.6, 99.7, 99.8, 99.8, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [98.0, 98.6, 98.6, 98.6, 98.7, 98.7, 98.7, 98.7, 98.7, 98.7, 98.7, 98.7, 98.7, 98.8, 98.8, 98.8, 98.8, 98.8, 98.9, 98.9, 98.9, 99.0, 99.0, 99.1, 99.1, 99.2, 99.2, 99.3, 99.3, 99.4, 99.4, 99.5, 99.6, 99.7, 99.7, 99.8, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [97.9, 98.5, 98.5, 98.5, 98.6, 98.6, 98.6, 98.6, 98.6, 98.6, 98.6, 98.6, 98.6, 98.7, 98.7, 98.7, 98.7, 98.7, 98.8, 98.8, 98.8, 98.9, 98.9, 99.0, 99.0, 99.1, 99.1, 99.2, 99.2, 99.3, 99.3, 99.4, 99.5, 99.6, 99.6, 99.7, 99.8, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [97.8, 98.4, 98.4, 98.4, 98.4, 98.5, 98.5, 98.5, 98.5, 98.5, 98.5, 98.5, 98.5, 98.5, 98.6, 98.6, 98.6, 98.6, 98.7, 98.7, 98.7, 98.8, 98.8, 98.9, 98.9, 99.0, 99.0, 99.1, 99.1, 99.2, 99.2, 99.3, 99.4, 99.4, 99.5, 99.6, 99.7, 99.8, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [97.7, 98.2, 98.3, 98.3, 98.3, 98.3, 98.3, 98.4, 98.4, 98.4, 98.4, 98.4, 98.4, 98.4, 98.4, 98.5, 98.5, 98.5, 98.5, 98.6, 98.6, 98.6, 98.7, 98.7, 98.8, 98.8, 98.9, 98.9, 99.0, 99.1, 99.1, 99.2, 99.2, 99.3, 99.4, 99.5, 99.6, 99.7, 99.8, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [97.5, 98.1, 98.1, 98.2, 98.2, 98.2, 98.2, 98.2, 98.2, 98.2, 98.3, 98.3, 98.3, 98.3, 98.3, 98.3, 98.3, 98.4, 98.4, 98.4, 98.5, 98.5, 98.6, 98.6, 98.6, 98.7, 98.7, 98.8, 98.9, 98.9, 99.0, 99.0, 99.1, 99.2, 99.3, 99.3, 99.4, 99.5, 99.6, 99.7, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [97.4, 98.0, 98.0, 98.0, 98.0, 98.1, 98.1, 98.1, 98.1, 98.1, 98.1, 98.1, 98.1, 98.1, 98.2, 98.2, 98.2, 98.2, 98.3, 98.3, 98.3, 98.4, 98.4, 98.5, 98.5, 98.6, 98.6, 98.7, 98.7, 98.8, 98.8, 98.9, 99.0, 99.0, 99.1, 99.2, 99.3, 99.4, 99.5, 99.6, 99.7, 99.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [97.2, 97.8, 97.8, 97.9, 97.9, 97.9, 97.9, 97.9, 97.9, 97.9, 98.0, 98.0, 98.0, 98.0, 98.0, 98.0, 98.0, 98.1, 98.1, 98.1, 98.2, 98.2, 98.2, 98.3, 98.3, 98.4, 98.4, 98.5, 98.6, 98.6, 98.7, 98.7, 98.8, 98.9, 99.0, 99.0, 99.1, 99.2, 99.3, 99.4, 99.6, 99.7, 99.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [97.1, 97.6, 97.7, 97.7, 97.7, 97.7, 97.7, 97.7, 97.8, 97.8, 97.8, 97.8, 97.8, 97.8, 97.8, 97.8, 97.9, 97.9, 97.9, 98.0, 98.0, 98.0, 98.1, 98.1, 98.2, 98.2, 98.3, 98.3, 98.4, 98.4, 98.5, 98.6, 98.6, 98.7, 98.8, 98.9, 99.0, 99.0, 99.1, 99.3, 99.4, 99.5, 99.7, 99.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [96.9, 97.4, 97.5, 97.5, 97.5, 97.5, 97.5, 97.6, 97.6, 97.6, 97.6, 97.6, 97.6, 97.6, 97.6, 97.6, 97.7, 97.7, 97.7, 97.8, 97.8, 97.8, 97.9, 97.9, 98.0, 98.0, 98.1, 98.1, 98.2, 98.2, 98.3, 98.4, 98.4, 98.5, 98.6, 98.7, 98.8, 98.8, 99.0, 99.1, 99.2, 99.3, 99.5, 99.6, 99.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [96.7, 97.2, 97.3, 97.3, 97.3, 97.3, 97.3, 97.3, 97.4, 97.4, 97.4, 97.4, 97.4, 97.4, 97.4, 97.4, 97.5, 97.5, 97.5, 97.6, 97.6, 97.6, 97.7, 97.7, 97.8, 97.8, 97.9, 97.9, 98.0, 98.0, 98.1, 98.2, 98.2, 98.3, 98.4, 98.5, 98.5, 98.6, 98.7, 98.8, 99.0, 99.1, 99.2, 99.4, 99.6, 99.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [96.4, 97.0, 97.0, 97.1, 97.1, 97.1, 97.1, 97.1, 97.1, 97.1, 97.1, 97.2, 97.2, 97.2, 97.2, 97.2, 97.2, 97.3, 97.3, 97.3, 97.4, 97.4, 97.4, 97.5, 97.5, 97.6, 97.6, 97.7, 97.7, 97.8, 97.9, 97.9, 98.0, 98.1, 98.1, 98.2, 98.3, 98.4, 98.5, 98.6, 98.7, 98.9, 99.0, 99.2, 99.4, 99.5, 99.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [96.2, 96.7, 96.8, 96.8, 96.8, 96.8, 96.9, 96.9, 96.9, 96.9, 96.9, 96.9, 96.9, 96.9, 96.9, 97.0, 97.0, 97.0, 97.0, 97.1, 97.1, 97.1, 97.2, 97.2, 97.3, 97.3, 97.4, 97.4, 97.5, 97.5, 97.6, 97.7, 97.7, 97.8, 97.9, 98.0, 98.1, 98.1, 98.2, 98.4, 98.5, 98.6, 98.8, 98.9, 99.1, 99.3, 99.5, 99.7, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [95.9, 96.5, 96.5, 96.5, 96.6, 96.6, 96.6, 96.6, 96.6, 96.6, 96.6, 96.6, 96.6, 96.7, 96.7, 96.7, 96.7, 96.7, 96.8, 96.8, 96.8, 96.9, 96.9, 97.0, 97.0, 97.1, 97.1, 97.2, 97.2, 97.3, 97.3, 97.4, 97.5, 97.5, 97.6, 97.7, 97.8, 97.9, 98.0, 98.1, 98.2, 98.3, 98.5, 98.6, 98.8, 99.0, 99.2, 99.5, 99.7, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [95.6, 96.2, 96.2, 96.2, 96.3, 96.3, 96.3, 96.3, 96.3, 96.3, 96.3, 96.3, 96.3, 96.4, 96.4, 96.4, 96.4, 96.4, 96.5, 96.5, 96.5, 96.6, 96.6, 96.7, 96.7, 96.8, 96.8, 96.9, 96.9, 97.0, 97.0, 97.1, 97.2, 97.2, 97.3, 97.4, 97.5, 97.6, 97.7, 97.8, 97.9, 98.0, 98.2, 98.3, 98.5, 98.7, 98.9, 99.2, 99.4, 99.7, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [95.3, 95.9, 95.9, 95.9, 95.9, 96.0, 96.0, 96.0, 96.0, 96.0, 96.0, 96.0, 96.0, 96.0, 96.1, 96.1, 96.1, 96.1, 96.2, 96.2, 96.2, 96.3, 96.3, 96.3, 96.4, 96.4, 96.5, 96.5, 96.6, 96.7, 96.7, 96.8, 96.9, 96.9, 97.0, 97.1, 97.2, 97.3, 97.4, 97.5, 97.6, 97.7, 97.9, 98.0, 98.2, 98.4, 98.6, 98.8, 99.1, 99.4, 99.7, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [95.0, 95.5, 95.6, 95.6, 95.6, 95.6, 95.6, 95.6, 95.7, 95.7, 95.7, 95.7, 95.7, 95.7, 95.7, 95.7, 95.8, 95.8, 95.8, 95.8, 95.9, 95.9, 96.0, 96.0, 96.0, 96.1, 96.1, 96.2, 96.3, 96.3, 96.4, 96.4, 96.5, 96.6, 96.7, 96.7, 96.8, 96.9, 97.0, 97.1, 97.2, 97.4, 97.5, 97.7, 97.8, 98.0, 98.3, 98.5, 98.7, 99.0, 99.3, 99.6, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [94.6, 95.2, 95.2, 95.2, 95.2, 95.3, 95.3, 95.3, 95.3, 95.3, 95.3, 95.3, 95.3, 95.3, 95.3, 95.4, 95.4, 95.4, 95.4, 95.5, 95.5, 95.6, 95.6, 95.6, 95.7, 95.7, 95.8, 95.8, 95.9, 95.9, 96.0, 96.1, 96.1, 96.2, 96.3, 96.4, 96.4, 96.5, 96.6, 96.7, 96.9, 97.0, 97.1, 97.3, 97.5, 97.7, 97.9, 98.1, 98.4, 98.6, 98.9, 99.3, 99.6, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [94.2, 94.8, 94.8, 94.8, 94.9, 94.9, 94.9, 94.9, 94.9, 94.9, 94.9, 94.9, 94.9, 94.9, 95.0, 95.0, 95.0, 95.0, 95.1, 95.1, 95.1, 95.2, 95.2, 95.2, 95.3, 95.3, 95.4, 95.4, 95.5, 95.6, 95.6, 95.7, 95.7, 95.8, 95.9, 96.0, 96.1, 96.1, 96.2, 96.4, 96.5, 96.6, 96.7, 96.9, 97.1, 97.3, 97.5, 97.7, 98.0, 98.2, 98.5, 98.9, 99.2, 99.6, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [93.8, 94.4, 94.4, 94.4, 94.4, 94.5, 94.5, 94.5, 94.5, 94.5, 94.5, 94.5, 94.5, 94.5, 94.6, 94.6, 94.6, 94.6, 94.6, 94.7, 94.7, 94.8, 94.8, 94.8, 94.9, 94.9, 95.0, 95.0, 95.1, 95.1, 95.2, 95.3, 95.3, 95.4, 95.5, 95.6, 95.6, 95.7, 95.8, 95.9, 96.1, 96.2, 96.3, 96.5, 96.7, 96.8, 97.1, 97.3, 97.5, 97.8, 98.1, 98.4, 98.8, 99.2, 99.6, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [93.4, 93.9, 94.0, 94.0, 94.0, 94.0, 94.0, 94.1, 94.1, 94.1, 94.1, 94.1, 94.1, 94.1, 94.1, 94.1, 94.2, 94.2, 94.2, 94.3, 94.3, 94.3, 94.4, 94.4, 94.5, 94.5, 94.6, 94.6, 94.7, 94.7, 94.8, 94.8, 94.9, 95.0, 95.0, 95.1, 95.2, 95.3, 95.4, 95.5, 95.6, 95.7, 95.9, 96.0, 96.2, 96.4, 96.6, 96.8, 97.1, 97.4, 97.7, 98.0, 98.3, 98.7, 99.1, 99.5, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [92.9, 93.5, 93.5, 93.5, 93.6, 93.6, 93.6, 93.6, 93.6, 93.6, 93.6, 93.6, 93.6, 93.7, 93.7, 93.7, 93.7, 93.7, 93.8, 93.8, 93.8, 93.9, 93.9, 93.9, 94.0, 94.0, 94.1, 94.1, 94.2, 94.3, 94.3, 94.4, 94.4, 94.5, 94.6, 94.7, 94.7, 94.8, 94.9, 95.0, 95.2, 95.3, 95.4, 95.6, 95.8, 95.9, 96.1, 96.4, 96.6, 96.9, 97.2, 97.5, 97.9, 98.2, 98.6, 99.1, 99.5, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [92.5, 93.0, 93.0, 93.1, 93.1, 93.1, 93.1, 93.1, 93.1, 93.1, 93.1, 93.1, 93.2, 93.2, 93.2, 93.2, 93.2, 93.2, 93.3, 93.3, 93.3, 93.4, 93.4, 93.5, 93.5, 93.6, 93.6, 93.7, 93.7, 93.8, 93.8, 93.9, 93.9, 94.0, 94.1, 94.2, 94.3, 94.3, 94.4, 94.5, 94.7, 94.8, 94.9, 95.1, 95.3, 95.4, 95.6, 95.9, 96.1, 96.4, 96.7, 97.0, 97.3, 97.7, 98.1, 98.5, 99.0, 99.5, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [91.9, 92.5, 92.5, 92.5, 92.5, 92.6, 92.6, 92.6, 92.6, 92.6, 92.6, 92.6, 92.6, 92.6, 92.7, 92.7, 92.7, 92.7, 92.7, 92.8, 92.8, 92.8, 92.9, 92.9, 93.0, 93.0, 93.1, 93.1, 93.2, 93.2, 93.3, 93.4, 93.4, 93.5, 93.6, 93.6, 93.7, 93.8, 93.9, 94.0, 94.1, 94.3, 94.4, 94.5, 94.7, 94.9, 95.1, 95.3, 95.6, 95.8, 96.1, 96.5, 96.8, 97.2, 97.6, 98.0, 98.4, 98.9, 99.4, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [91.4, 91.9, 91.9, 92.0, 92.0, 92.0, 92.0, 92.0, 92.0, 92.0, 92.0, 92.0, 92.1, 92.1, 92.1, 92.1, 92.1, 92.1, 92.2, 92.2, 92.2, 92.3, 92.3, 92.4, 92.4, 92.5, 92.5, 92.6, 92.6, 92.7, 92.7, 92.8, 92.8, 92.9, 93.0, 93.1, 93.1, 93.2, 93.3, 93.4, 93.5, 93.7, 93.8, 94.0, 94.1, 94.3, 94.5, 94.7, 95.0, 95.3, 95.5, 95.9, 96.2, 96.6, 97.0, 97.4, 97.8, 98.3, 98.8, 99.4, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [90.8, 91.3, 91.3, 91.3, 91.4, 91.4, 91.4, 91.4, 91.4, 91.4, 91.4, 91.4, 91.4, 91.5, 91.5, 91.5, 91.5, 91.5, 91.6, 91.6, 91.6, 91.7, 91.7, 91.7, 91.8, 91.8, 91.9, 91.9, 92.0, 92.0, 92.1, 92.2, 92.2, 92.3, 92.4, 92.4, 92.5, 92.6, 92.7, 92.8, 92.9, 93.0, 93.2, 93.3, 93.5, 93.7, 93.9, 94.1, 94.4, 94.6, 94.9, 95.2, 95.6, 95.9, 96.3, 96.7, 97.2, 97.7, 98.2, 98.7, 99.3, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [90.1, 90.6, 90.7, 90.7, 90.7, 90.7, 90.7, 90.7, 90.7, 90.7, 90.8, 90.8, 90.8, 90.8, 90.8, 90.8, 90.8, 90.9, 90.9, 90.9, 91.0, 91.0, 91.0, 91.1, 91.1, 91.2, 91.2, 91.3, 91.3, 91.4, 91.4, 91.5, 91.5, 91.6, 91.7, 91.8, 91.8, 91.9, 92.0, 92.1, 92.2, 92.4, 92.5, 92.7, 92.8, 93.0, 93.2, 93.4, 93.7, 93.9, 94.2, 94.5, 94.9, 95.2, 95.6, 96.0, 96.5, 96.9, 97.4, 98.0, 98.6, 99.3, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [89.4, 89.9, 89.9, 90.0, 90.0, 90.0, 90.0, 90.0, 90.0, 90.0, 90.0, 90.0, 90.0, 90.1, 90.1, 90.1, 90.1, 90.1, 90.2, 90.2, 90.2, 90.3, 90.3, 90.3, 90.4, 90.4, 90.5, 90.5, 90.6, 90.6, 90.7, 90.8, 90.8, 90.9, 91.0, 91.0, 91.1, 91.2, 91.3, 91.4, 91.5, 91.6, 91.8, 91.9, 92.1, 92.3, 92.5, 92.7, 92.9, 93.2, 93.5, 93.8, 94.1, 94.5, 94.9, 95.3, 95.7, 96.2, 96.7, 97.2, 97.8, 98.5, 99.2, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [88.6, 89.1, 89.1, 89.2, 89.2, 89.2, 89.2, 89.2, 89.2, 89.2, 89.3, 89.3, 89.3, 89.3, 89.3, 89.3, 89.3, 89.4, 89.4, 89.4, 89.4, 89.5, 89.5, 89.6, 89.6, 89.6, 89.7, 89.7, 89.8, 89.9, 89.9, 90.0, 90.0, 90.1, 90.2, 90.2, 90.3, 90.4, 90.5, 90.6, 90.7, 90.8, 91.0, 91.1, 91.3, 91.5, 91.7, 91.9, 92.1, 92.4, 92.7, 93.0, 93.3, 93.6, 94.0, 94.4, 94.9, 95.3, 95.8, 96.4, 97.0, 97.6, 98.3, 99.1, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [87.8, 88.3, 88.3, 88.3, 88.3, 88.4, 88.4, 88.4, 88.4, 88.4, 88.4, 88.4, 88.4, 88.4, 88.4, 88.5, 88.5, 88.5, 88.5, 88.6, 88.6, 88.6, 88.7, 88.7, 88.8, 88.8, 88.8, 88.9, 88.9, 89.0, 89.1, 89.1, 89.2, 89.2, 89.3, 89.4, 89.5, 89.6, 89.6, 89.7, 89.9, 90.0, 90.1, 90.3, 90.4, 90.6, 90.8, 91.0, 91.2, 91.5, 91.8, 92.1, 92.4, 92.8, 93.1, 93.5, 94.0, 94.4, 94.9, 95.5, 96.1, 96.7, 97.4, 98.2, 99.1, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [86.9, 87.4, 87.4, 87.4, 87.4, 87.4, 87.5, 87.5, 87.5, 87.5, 87.5, 87.5, 87.5, 87.5, 87.5, 87.6, 87.6, 87.6, 87.6, 87.7, 87.7, 87.7, 87.8, 87.8, 87.8, 87.9, 87.9, 88.0, 88.0, 88.1, 88.1, 88.2, 88.3, 88.3, 88.4, 88.5, 88.5, 88.6, 88.7, 88.8, 88.9, 89.0, 89.2, 89.3, 89.5, 89.7, 89.9, 90.1, 90.3, 90.6, 90.8, 91.1, 91.5, 91.8, 92.2, 92.6, 93.0, 93.5, 93.9, 94.5, 95.1, 95.7, 96.4, 97.2, 98.0, 99.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [85.9, 86.4, 86.4, 86.4, 86.4, 86.5, 86.5, 86.5, 86.5, 86.5, 86.5, 86.5, 86.5, 86.5, 86.6, 86.6, 86.6, 86.6, 86.6, 86.7, 86.7, 86.7, 86.8, 86.8, 86.9, 86.9, 86.9, 87.0, 87.0, 87.1, 87.1, 87.2, 87.3, 87.3, 87.4, 87.5, 87.5, 87.6, 87.7, 87.8, 87.9, 88.0, 88.2, 88.3, 88.5, 88.7, 88.8, 89.1, 89.3, 89.5, 89.8, 90.1, 90.4, 90.8, 91.1, 91.5, 92.0, 92.4, 92.9, 93.4, 94.0, 94.6, 95.3, 96.1, 96.9, 97.9, 98.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [84.8, 85.3, 85.3, 85.4, 85.4, 85.4, 85.4, 85.4, 85.4, 85.4, 85.4, 85.4, 85.5, 85.5, 85.5, 85.5, 85.5, 85.5, 85.6, 85.6, 85.6, 85.7, 85.7, 85.7, 85.8, 85.8, 85.9, 85.9, 86.0, 86.0, 86.1, 86.1, 86.2, 86.3, 86.3, 86.4, 86.5, 86.5, 86.6, 86.7, 86.8, 87.0, 87.1, 87.2, 87.4, 87.6, 87.7, 88.0, 88.2, 88.4, 88.7, 89.0, 89.3, 89.6, 90.0, 90.4, 90.8, 91.3, 91.7, 92.3, 92.8, 93.5, 94.1, 94.9, 95.7, 96.6, 97.6, 98.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [83.7, 84.2, 84.2, 84.2, 84.2, 84.2, 84.2, 84.3, 84.3, 84.3, 84.3, 84.3, 84.3, 84.3, 84.3, 84.3, 84.4, 84.4, 84.4, 84.4, 84.5, 84.5, 84.5, 84.6, 84.6, 84.7, 84.7, 84.7, 84.8, 84.8, 84.9, 85.0, 85.0, 85.1, 85.1, 85.2, 85.3, 85.4, 85.5, 85.6, 85.7, 85.8, 85.9, 86.0, 86.2, 86.4, 86.6, 86.8, 87.0, 87.2, 87.5, 87.8, 88.1, 88.4, 88.8, 89.2, 89.6, 90.0, 90.5, 91.0, 91.6, 92.2, 92.9, 93.6, 94.4, 95.3, 96.3, 97.4, 98.6, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [82.4, 82.9, 82.9, 82.9, 83.0, 83.0, 83.0, 83.0, 83.0, 83.0, 83.0, 83.0, 83.0, 83.1, 83.1, 83.1, 83.1, 83.1, 83.1, 83.2, 83.2, 83.2, 83.3, 83.3, 83.4, 83.4, 83.4, 83.5, 83.5, 83.6, 83.6, 83.7, 83.8, 83.8, 83.9, 83.9, 84.0, 84.1, 84.2, 84.3, 84.4, 84.5, 84.6, 84.8, 84.9, 85.1, 85.3, 85.5, 85.7, 85.9, 86.2, 86.5, 86.8, 87.1, 87.5, 87.8, 88.2, 88.7, 89.1, 89.7, 90.2, 90.8, 91.5, 92.2, 93.0, 93.9, 94.9, 96.0, 97.2, 98.5, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [81.1, 81.5, 81.6, 81.6, 81.6, 81.6, 81.6, 81.6, 81.6, 81.7, 81.7, 81.7, 81.7, 81.7, 81.7, 81.7, 81.7, 81.8, 81.8, 81.8, 81.8, 81.9, 81.9, 81.9, 82.0, 82.0, 82.1, 82.1, 82.2, 82.2, 82.3, 82.3, 82.4, 82.4, 82.5, 82.6, 82.6, 82.7, 82.8, 82.9, 83.0, 83.1, 83.2, 83.4, 83.5, 83.7, 83.9, 84.1, 84.3, 84.5, 84.8, 85.1, 85.4, 85.7, 86.0, 86.4, 86.8, 87.2, 87.7, 88.2, 88.7, 89.3, 90.0, 90.7, 91.5, 92.4, 93.3, 94.4, 95.6, 96.9, 98.4, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [79.6, 80.1, 80.1, 80.1, 80.1, 80.1, 80.1, 80.2, 80.2, 80.2, 80.2, 80.2, 80.2, 80.2, 80.2, 80.2, 80.2, 80.3, 80.3, 80.3, 80.4, 80.4, 80.4, 80.5, 80.5, 80.5, 80.6, 80.6, 80.7, 80.7, 80.8, 80.8, 80.9, 80.9, 81.0, 81.1, 81.1, 81.2, 81.3, 81.4, 81.5, 81.6, 81.7, 81.9, 82.0, 82.2, 82.3, 82.5, 82.7, 83.0, 83.2, 83.5, 83.8, 84.1, 84.5, 84.8, 85.2, 85.6, 86.1, 86.6, 87.1, 87.7, 88.3, 89.1, 89.8, 90.7, 91.6, 92.7, 93.8, 95.1, 96.6, 98.2, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [78.0, 78.5, 78.5, 78.5, 78.5, 78.5, 78.5, 78.5, 78.6, 78.6, 78.6, 78.6, 78.6, 78.6, 78.6, 78.6, 78.6, 78.7, 78.7, 78.7, 78.7, 78.8, 78.8, 78.8, 78.9, 78.9, 79.0, 79.0, 79.1, 79.1, 79.2, 79.2, 79.3, 79.3, 79.4, 79.4, 79.5, 79.6, 79.7, 79.8, 79.9, 80.0, 80.1, 80.2, 80.4, 80.5, 80.7, 80.9, 81.1, 81.3, 81.6, 81.8, 82.1, 82.4, 82.8, 83.1, 83.5, 83.9, 84.4, 84.8, 85.4, 85.9, 86.6, 87.3, 88.0, 88.9, 89.8, 90.8, 92.0, 93.2, 94.6, 96.2, 98.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [76.3, 76.7, 76.8, 76.8, 76.8, 76.8, 76.8, 76.8, 76.8, 76.8, 76.8, 76.9, 76.9, 76.9, 76.9, 76.9, 76.9, 76.9, 77.0, 77.0, 77.0, 77.0, 77.1, 77.1, 77.1, 77.2, 77.2, 77.3, 77.3, 77.4, 77.4, 77.5, 77.5, 77.6, 77.6, 77.7, 77.8, 77.8, 77.9, 78.0, 78.1, 78.2, 78.3, 78.4, 78.6, 78.7, 78.9, 79.1, 79.3, 79.5, 79.8, 80.0, 80.3, 80.6, 81.0, 81.3, 81.7, 82.1, 82.5, 83.0, 83.5, 84.1, 84.7, 85.4, 86.1, 86.9, 87.8, 88.8, 89.9, 91.2, 92.6, 94.1, 95.8, 97.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [74.4, 74.9, 74.9, 74.9, 74.9, 74.9, 75.0, 75.0, 75.0, 75.0, 75.0, 75.0, 75.0, 75.0, 75.0, 75.0, 75.1, 75.1, 75.1, 75.1, 75.1, 75.2, 75.2, 75.2, 75.3, 75.3, 75.4, 75.4, 75.4, 75.5, 75.5, 75.6, 75.6, 75.7, 75.8, 75.8, 75.9, 76.0, 76.0, 76.1, 76.2, 76.3, 76.4, 76.6, 76.7, 76.8, 77.0, 77.2, 77.4, 77.6, 77.8, 78.1, 78.4, 78.7, 79.0, 79.3, 79.7, 80.1, 80.5, 81.0, 81.5, 82.0, 82.6, 83.3, 84.0, 84.8, 85.7, 86.7, 87.8, 89.0, 90.3, 91.8, 93.5, 95.4, 97.6, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [72.5, 72.9, 72.9, 72.9, 72.9, 72.9, 73.0, 73.0, 73.0, 73.0, 73.0, 73.0, 73.0, 73.0, 73.0, 73.0, 73.0, 73.1, 73.1, 73.1, 73.1, 73.2, 73.2, 73.2, 73.3, 73.3, 73.3, 73.4, 73.4, 73.5, 73.5, 73.6, 73.6, 73.7, 73.7, 73.8, 73.9, 73.9, 74.0, 74.1, 74.2, 74.3, 74.4, 74.5, 74.6, 74.8, 75.0, 75.1, 75.3, 75.5, 75.8, 76.0, 76.3, 76.6, 76.9, 77.2, 77.6, 78.0, 78.4, 78.8, 79.3, 79.8, 80.4, 81.1, 81.8, 82.6, 83.4, 84.4, 85.4, 86.6, 87.9, 89.4, 91.0, 92.9, 95.0, 97.3, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [70.3, 70.7, 70.7, 70.8, 70.8, 70.8, 70.8, 70.8, 70.8, 70.8, 70.8, 70.8, 70.8, 70.8, 70.9, 70.9, 70.9, 70.9, 70.9, 70.9, 71.0, 71.0, 71.0, 71.1, 71.1, 71.1, 71.2, 71.2, 71.3, 71.3, 71.3, 71.4, 71.4, 71.5, 71.5, 71.6, 71.7, 71.7, 71.8, 71.9, 72.0, 72.1, 72.2, 72.3, 72.4, 72.6, 72.7, 72.9, 73.1, 73.3, 73.5, 73.8, 74.0, 74.3, 74.6, 74.9, 75.3, 75.6, 76.0, 76.5, 76.9, 77.5, 78.0, 78.7, 79.4, 80.1, 80.9, 81.9, 82.9, 84.0, 85.3, 86.7, 88.3, 90.1, 92.2, 94.4, 97.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [68.0, 68.4, 68.4, 68.4, 68.5, 68.5, 68.5, 68.5, 68.5, 68.5, 68.5, 68.5, 68.5, 68.5, 68.5, 68.5, 68.6, 68.6, 68.6, 68.6, 68.7, 68.7, 68.7, 68.7, 68.8, 68.8, 68.8, 68.9, 68.9, 69.0, 69.0, 69.1, 69.1, 69.2, 69.2, 69.3, 69.3, 69.4, 69.5, 69.5, 69.6, 69.7, 69.8, 69.9, 70.1, 70.2, 70.4, 70.5, 70.7, 70.9, 71.1, 71.3, 71.6, 71.9, 72.2, 72.5, 72.8, 73.2, 73.6, 74.0, 74.4, 74.9, 75.5, 76.1, 76.8, 77.5, 78.3, 79.2, 80.2, 81.3, 82.5, 83.9, 85.4, 87.2, 89.1, 91.4, 93.9, 96.7, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [65.6, 65.9, 66.0, 66.0, 66.0, 66.0, 66.0, 66.0, 66.0, 66.0, 66.0, 66.0, 66.0, 66.1, 66.1, 66.1, 66.1, 66.1, 66.1, 66.2, 66.2, 66.2, 66.2, 66.3, 66.3, 66.3, 66.4, 66.4, 66.4, 66.5, 66.5, 66.6, 66.6, 66.7, 66.7, 66.8, 66.8, 66.9, 67.0, 67.0, 67.1, 67.2, 67.3, 67.4, 67.5, 67.7, 67.8, 68.0, 68.2, 68.3, 68.6, 68.8, 69.0, 69.3, 69.6, 69.9, 70.2, 70.5, 70.9, 71.3, 71.7, 72.2, 72.8, 73.3, 74.0, 74.7, 75.5, 76.3, 77.3, 78.4, 79.5, 80.9, 82.4, 84.0, 85.9, 88.1, 90.5, 93.2, 96.4, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [63.0, 63.3, 63.3, 63.4, 63.4, 63.4, 63.4, 63.4, 63.4, 63.4, 63.4, 63.4, 63.4, 63.4, 63.4, 63.5, 63.5, 63.5, 63.5, 63.5, 63.6, 63.6, 63.6, 63.6, 63.7, 63.7, 63.7, 63.8, 63.8, 63.8, 63.9, 63.9, 64.0, 64.0, 64.1, 64.1, 64.2, 64.2, 64.3, 64.4, 64.5, 64.5, 64.6, 64.7, 64.9, 65.0, 65.1, 65.3, 65.4, 65.6, 65.8, 66.0, 66.3, 66.5, 66.8, 67.1, 67.4, 67.7, 68.1, 68.5, 68.9, 69.4, 69.9, 70.4, 71.1, 71.7, 72.5, 73.3, 74.2, 75.2, 76.4, 77.7, 79.1, 80.7, 82.5, 84.6, 86.9, 89.5, 92.6, 96.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [60.2, 60.5, 60.6, 60.6, 60.6, 60.6, 60.6, 60.6, 60.6, 60.6, 60.6, 60.6, 60.6, 60.7, 60.7, 60.7, 60.7, 60.7, 60.7, 60.7, 60.8, 60.8, 60.8, 60.8, 60.9, 60.9, 60.9, 61.0, 61.0, 61.0, 61.1, 61.1, 61.2, 61.2, 61.3, 61.3, 61.4, 61.4, 61.5, 61.5, 61.6, 61.7, 61.8, 61.9, 62.0, 62.1, 62.3, 62.4, 62.6, 62.8, 62.9, 63.1, 63.4, 63.6, 63.9, 64.2, 64.4, 64.8, 65.1, 65.5, 65.9, 66.3, 66.8, 67.3, 67.9, 68.6, 69.3, 70.1, 71.0, 71.9, 73.0, 74.2, 75.6, 77.2, 78.9, 80.9, 83.1, 85.6, 88.5, 91.8, 95.6, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [57.3, 57.6, 57.6, 57.6, 57.6, 57.6, 57.6, 57.7, 57.7, 57.7, 57.7, 57.7, 57.7, 57.7, 57.7, 57.7, 57.7, 57.7, 57.8, 57.8, 57.8, 57.8, 57.8, 57.9, 57.9, 57.9, 58.0, 58.0, 58.0, 58.1, 58.1, 58.1, 58.2, 58.2, 58.3, 58.3, 58.4, 58.4, 58.5, 58.5, 58.6, 58.7, 58.8, 58.9, 59.0, 59.1, 59.2, 59.4, 59.5, 59.7, 59.9, 60.1, 60.3, 60.5, 60.8, 61.0, 61.3, 61.6, 61.9, 62.3, 62.7, 63.1, 63.5, 64.1, 64.6, 65.2, 65.9, 66.7, 67.5, 68.4, 69.5, 70.6, 71.9, 73.4, 75.1, 76.9, 79.0, 81.4, 84.2, 87.3, 90.9, 95.1, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [54.1, 54.5, 54.5, 54.5, 54.5, 54.5, 54.5, 54.5, 54.5, 54.5, 54.5, 54.5, 54.5, 54.6, 54.6, 54.6, 54.6, 54.6, 54.6, 54.6, 54.7, 54.7, 54.7, 54.7, 54.8, 54.8, 54.8, 54.8, 54.9, 54.9, 54.9, 55.0, 55.0, 55.1, 55.1, 55.1, 55.2, 55.2, 55.3, 55.4, 55.4, 55.5, 55.6, 55.7, 55.8, 55.9, 56.0, 56.1, 56.3, 56.4, 56.6, 56.8, 57.0, 57.2, 57.5, 57.7, 58.0, 58.3, 58.6, 58.9, 59.3, 59.7, 60.1, 60.6, 61.1, 61.7, 62.3, 63.0, 63.8, 64.7, 65.7, 66.8, 68.0, 69.4, 71.0, 72.7, 74.7, 77.0, 79.6, 82.6, 86.0, 89.9, 94.6, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [50.9, 51.2, 51.2, 51.2, 51.2, 51.2, 51.2, 51.2, 51.2, 51.2, 51.2, 51.2, 51.2, 51.2, 51.3, 51.3, 51.3, 51.3, 51.3, 51.3, 51.3, 51.4, 51.4, 51.4, 51.4, 51.5, 51.5, 51.5, 51.5, 51.6, 51.6, 51.6, 51.7, 51.7, 51.8, 51.8, 51.8, 51.9, 51.9, 52.0, 52.1, 52.1, 52.2, 52.3, 52.4, 52.5, 52.6, 52.7, 52.9, 53.0, 53.2, 53.4, 53.5, 53.8, 54.0, 54.2, 54.5, 54.7, 55.0, 55.3, 55.7, 56.0, 56.4, 56.9, 57.4, 57.9, 58.5, 59.2, 60.0, 60.8, 61.7, 62.7, 63.9, 65.2, 66.7, 68.3, 70.2, 72.3, 74.8, 77.6, 80.8, 84.5, 88.8, 93.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [47.4, 47.7, 47.7, 47.7, 47.7, 47.7, 47.7, 47.7, 47.7, 47.8, 47.8, 47.8, 47.8, 47.8, 47.8, 47.8, 47.8, 47.8, 47.8, 47.8, 47.9, 47.9, 47.9, 47.9, 47.9, 48.0, 48.0, 48.0, 48.1, 48.1, 48.1, 48.1, 48.2, 48.2, 48.2, 48.3, 48.3, 48.4, 48.4, 48.5, 48.5, 48.6, 48.7, 48.8, 48.8, 48.9, 49.0, 49.2, 49.3, 49.4, 49.6, 49.7, 49.9, 50.1, 50.3, 50.5, 50.8, 51.0, 51.3, 51.6, 51.9, 52.2, 52.6, 53.0, 53.5, 54.0, 54.6, 55.2, 55.9, 56.7, 57.5, 58.5, 59.6, 60.8, 62.2, 63.7, 65.4, 67.4, 69.7, 72.3, 75.3, 78.8, 82.8, 87.6, 93.2, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [43.8, 44.1, 44.1, 44.1, 44.1, 44.1, 44.1, 44.1, 44.1, 44.1, 44.1, 44.1, 44.1, 44.2, 44.2, 44.2, 44.2, 44.2, 44.2, 44.2, 44.2, 44.3, 44.3, 44.3, 44.3, 44.3, 44.4, 44.4, 44.4, 44.4, 44.5, 44.5, 44.5, 44.6, 44.6, 44.6, 44.7, 44.7, 44.8, 44.8, 44.9, 44.9, 45.0, 45.1, 45.1, 45.2, 45.3, 45.4, 45.6, 45.7, 45.8, 46.0, 46.1, 46.3, 46.5, 46.7, 46.9, 47.1, 47.4, 47.7, 48.0, 48.3, 48.6, 49.0, 49.5, 49.9, 50.4, 51.0, 51.7, 52.4, 53.2, 54.1, 55.1, 56.2, 57.4, 58.9, 60.5, 62.3, 64.4, 66.8, 69.6, 72.8, 76.5, 80.9, 86.2, 92.4, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [40.1, 40.3, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.4, 40.5, 40.5, 40.5, 40.5, 40.5, 40.5, 40.6, 40.6, 40.6, 40.6, 40.7, 40.7, 40.7, 40.7, 40.8, 40.8, 40.8, 40.9, 40.9, 40.9, 41.0, 41.0, 41.1, 41.1, 41.2, 41.2, 41.3, 41.4, 41.5, 41.6, 41.7, 41.8, 41.9, 42.1, 42.2, 42.4, 42.6, 42.7, 42.9, 43.2, 43.4, 43.6, 43.9, 44.2, 44.5, 44.9, 45.3, 45.7, 46.2, 46.7, 47.3, 47.9, 48.7, 49.5, 50.4, 51.4, 52.6, 53.9, 55.4, 57.0, 59.0, 61.2, 63.7, 66.6, 70.1, 74.1, 78.9, 84.6, 91.5, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [36.3, 36.5, 36.5, 36.5, 36.6, 36.6, 36.6, 36.6, 36.6, 36.6, 36.6, 36.6, 36.6, 36.6, 36.6, 36.6, 36.6, 36.6, 36.6, 36.6, 36.7, 36.7, 36.7, 36.7, 36.7, 36.7, 36.8, 36.8, 36.8, 36.8, 36.8, 36.9, 36.9, 36.9, 37.0, 37.0, 37.0, 37.1, 37.1, 37.1, 37.2, 37.2, 37.3, 37.3, 37.4, 37.5, 37.6, 37.7, 37.8, 37.9, 38.0, 38.1, 38.2, 38.4, 38.5, 38.7, 38.9, 39.1, 39.3, 39.5, 39.7, 40.0, 40.3, 40.6, 41.0, 41.4, 41.8, 42.3, 42.8, 43.4, 44.1, 44.8, 45.6, 46.6, 47.6, 48.8, 50.1, 51.6, 53.4, 55.4, 57.7, 60.3, 63.4, 67.1, 71.4, 76.6, 82.9, 90.5, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [32.5, 32.7, 32.7, 32.7, 32.7, 32.7, 32.7, 32.7, 32.7, 32.7, 32.7, 32.7, 32.7, 32.7, 32.7, 32.7, 32.7, 32.8, 32.8, 32.8, 32.8, 32.8, 32.8, 32.8, 32.8, 32.9, 32.9, 32.9, 32.9, 32.9, 33.0, 33.0, 33.0, 33.0, 33.0, 33.1, 33.1, 33.1, 33.2, 33.2, 33.2, 33.3, 33.3, 33.4, 33.5, 33.5, 33.6, 33.7, 33.8, 33.9, 34.0, 34.1, 34.2, 34.3, 34.5, 34.6, 34.8, 34.9, 35.1, 35.3, 35.5, 35.8, 36.0, 36.3, 36.7, 37.0, 37.4, 37.8, 38.3, 38.8, 39.4, 40.1, 40.8, 41.6, 42.6, 43.6, 44.8, 46.2, 47.8, 49.5, 51.6, 54.0, 56.7, 60.0, 63.9, 68.5, 74.1, 81.0, 89.4, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [28.6, 28.8, 28.8, 28.8, 28.8, 28.8, 28.8, 28.8, 28.9, 28.9, 28.9, 28.9, 28.9, 28.9, 28.9, 28.9, 28.9, 28.9, 28.9, 28.9, 28.9, 28.9, 28.9, 29.0, 29.0, 29.0, 29.0, 29.0, 29.0, 29.1, 29.1, 29.1, 29.1, 29.1, 29.2, 29.2, 29.2, 29.2, 29.3, 29.3, 29.3, 29.4, 29.4, 29.5, 29.5, 29.6, 29.6, 29.7, 29.8, 29.9, 30.0, 30.1, 30.2, 30.3, 30.4, 30.5, 30.7, 30.8, 31.0, 31.2, 31.4, 31.6, 31.8, 32.1, 32.3, 32.6, 33.0, 33.4, 33.8, 34.2, 34.8, 35.3, 36.0, 36.7, 37.6, 38.5, 39.5, 40.7, 42.1, 43.7, 45.5, 47.6, 50.0, 52.9, 56.3, 60.4, 65.4, 71.4, 78.9, 88.2, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [24.9, 25.0, 25.0, 25.1, 25.1, 25.1, 25.1, 25.1, 25.1, 25.1, 25.1, 25.1, 25.1, 25.1, 25.1, 25.1, 25.1, 25.1, 25.1, 25.1, 25.1, 25.1, 25.1, 25.2, 25.2, 25.2, 25.2, 25.2, 25.2, 25.2, 25.3, 25.3, 25.3, 25.3, 25.3, 25.4, 25.4, 25.4, 25.4, 25.5, 25.5, 25.5, 25.6, 25.6, 25.6, 25.7, 25.7, 25.8, 25.9, 25.9, 26.0, 26.1, 26.2, 26.3, 26.4, 26.5, 26.7, 26.8, 26.9, 27.1, 27.2, 27.4, 27.6, 27.8, 28.1, 28.4, 28.7, 29.0, 29.3, 29.7, 30.2, 30.7, 31.3, 31.9, 32.6, 33.4, 34.4, 35.4, 36.6, 38.0, 39.5, 41.4, 43.5, 46.0, 48.9, 52.5, 56.8, 62.1, 68.5, 76.6, 86.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [21.3, 21.4, 21.4, 21.4, 21.4, 21.4, 21.4, 21.4, 21.4, 21.4, 21.4, 21.4, 21.4, 21.4, 21.4, 21.4, 21.4, 21.4, 21.5, 21.5, 21.5, 21.5, 21.5, 21.5, 21.5, 21.5, 21.5, 21.5, 21.6, 21.6, 21.6, 21.6, 21.6, 21.6, 21.6, 21.7, 21.7, 21.7, 21.7, 21.7, 21.8, 21.8, 21.8, 21.9, 21.9, 22.0, 22.0, 22.1, 22.1, 22.2, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7, 22.8, 22.9, 23.0, 23.1, 23.3, 23.4, 23.6, 23.8, 24.0, 24.2, 24.5, 24.8, 25.1, 25.4, 25.8, 26.2, 26.7, 27.3, 27.9, 28.6, 29.4, 30.2, 31.3, 32.4, 33.8, 35.3, 37.1, 39.3, 41.8, 44.9, 48.5, 53.0, 58.6, 65.5, 74.2, 85.4, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [17.8, 17.9, 17.9, 18.0, 18.0, 18.0, 18.0, 18.0, 18.0, 18.0, 18.0, 18.0, 18.0, 18.0, 18.0, 18.0, 18.0, 18.0, 18.0, 18.0, 18.0, 18.0, 18.0, 18.0, 18.0, 18.1, 18.1, 18.1, 18.1, 18.1, 18.1, 18.1, 18.1, 18.1, 18.2, 18.2, 18.2, 18.2, 18.2, 18.2, 18.3, 18.3, 18.3, 18.3, 18.4, 18.4, 18.5, 18.5, 18.5, 18.6, 18.7, 18.7, 18.8, 18.9, 18.9, 19.0, 19.1, 19.2, 19.3, 19.4, 19.5, 19.7, 19.8, 20.0, 20.1, 20.3, 20.5, 20.8, 21.0, 21.3, 21.6, 22.0, 22.4, 22.9, 23.4, 24.0, 24.6, 25.4, 26.2, 27.2, 28.3, 29.6, 31.2, 33.0, 35.1, 37.6, 40.7, 44.5, 49.1, 54.9, 62.3, 71.7, 83.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [14.7, 14.8, 14.8, 14.8, 14.8, 14.8, 14.8, 14.8, 14.8, 14.8, 14.8, 14.8, 14.8, 14.8, 14.8, 14.8, 14.8, 14.8, 14.8, 14.8, 14.8, 14.8, 14.8, 14.8, 14.8, 14.8, 14.8, 14.9, 14.9, 14.9, 14.9, 14.9, 14.9, 14.9, 14.9, 14.9, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.1, 15.1, 15.1, 15.1, 15.2, 15.2, 15.2, 15.3, 15.3, 15.4, 15.4, 15.5, 15.6, 15.6, 15.7, 15.8, 15.9, 16.0, 16.1, 16.2, 16.3, 16.4, 16.6, 16.7, 16.9, 17.1, 17.3, 17.5, 17.8, 18.1, 18.4, 18.8, 19.2, 19.7, 20.2, 20.9, 21.6, 22.4, 23.3, 24.4, 25.6, 27.1, 28.8, 30.9, 33.5, 36.6, 40.4, 45.2, 51.2, 58.9, 69.0, 82.2, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [11.8, 11.9, 11.9, 11.9, 11.9, 11.9, 11.9, 11.9, 11.9, 11.9, 11.9, 11.9, 11.9, 11.9, 11.9, 11.9, 11.9, 11.9, 11.9, 11.9, 11.9, 11.9, 11.9, 11.9, 11.9, 11.9, 11.9, 11.9, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.1, 12.1, 12.1, 12.1, 12.1, 12.2, 12.2, 12.2, 12.2, 12.3, 12.3, 12.3, 12.4, 12.4, 12.5, 12.5, 12.6, 12.6, 12.7, 12.8, 12.8, 12.9, 13.0, 13.1, 13.2, 13.3, 13.4, 13.6, 13.7, 13.9, 14.1, 14.3, 14.5, 14.8, 15.1, 15.5, 15.8, 16.3, 16.8, 17.3, 18.0, 18.7, 19.6, 20.6, 21.8, 23.2, 24.9, 26.9, 29.4, 32.5, 36.3, 41.2, 47.4, 55.5, 66.1, 80.4, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [9.3, 9.3, 9.3, 9.3, 9.3, 9.3, 9.3, 9.3, 9.3, 9.3, 9.3, 9.3, 9.3, 9.3, 9.3, 9.3, 9.3, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4, 9.4, 9.5, 9.5, 9.5, 9.5, 9.5, 9.5, 9.5, 9.5, 9.6, 9.6, 9.6, 9.6, 9.6, 9.7, 9.7, 9.7, 9.8, 9.8, 9.8, 9.9, 9.9, 10.0, 10.0, 10.1, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 11.1, 11.2, 11.4, 11.6, 11.9, 12.2, 12.5, 12.8, 13.2, 13.6, 14.1, 14.7, 15.4, 16.2, 17.1, 18.2, 19.6, 21.2, 23.1, 25.5, 28.6, 32.4, 37.3, 43.6, 52.0, 63.2, 78.6, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [7.1, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.3, 7.3, 7.3, 7.3, 7.3, 7.3, 7.3, 7.3, 7.3, 7.3, 7.4, 7.4, 7.4, 7.4, 7.4, 7.4, 7.5, 7.5, 7.5, 7.6, 7.6, 7.6, 7.7, 7.7, 7.7, 7.8, 7.8, 7.9, 8.0, 8.0, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.8, 8.9, 9.1, 9.3, 9.6, 9.8, 10.1, 10.5, 10.9, 11.3, 11.8, 12.4, 13.2, 14.0, 15.0, 16.3, 17.8, 19.6, 21.9, 24.9, 28.6, 33.5, 39.9, 48.6, 60.4, 76.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [5.3, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.4, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 5.6, 5.6, 5.6, 5.6, 5.6, 5.6, 5.7, 5.7, 5.7, 5.8, 5.8, 5.8, 5.8, 5.9, 5.9, 6.0, 6.0, 6.1, 6.2, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.9, 7.0, 7.2, 7.4, 7.6, 7.9, 8.2, 8.5, 8.9, 9.3, 9.9, 10.5, 11.3, 12.2, 13.3, 14.7, 16.5, 18.7, 21.5, 25.1, 30.0, 36.4, 45.3, 57.6, 75.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [3.9, 3.9, 3.9, 3.9, 3.9, 3.9, 3.9, 3.9, 3.9, 3.9, 3.9, 3.9, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.1, 4.1, 4.1, 4.1, 4.1, 4.1, 4.1, 4.1, 4.2, 4.2, 4.2, 4.2, 4.2, 4.3, 4.3, 4.3, 4.4, 4.4, 4.4, 4.5, 4.5, 4.6, 4.6, 4.7, 4.8, 4.8, 4.9, 5.0, 5.1, 5.3, 5.4, 5.6, 5.8, 6.0, 6.2, 6.5, 6.8, 7.2, 7.7, 8.3, 8.9, 9.8, 10.8, 12.1, 13.7, 15.8, 18.4, 22.0, 26.7, 33.2, 42.3, 55.0, 73.3, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.8, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.1, 3.1, 3.1, 3.1, 3.1, 3.2, 3.2, 3.2, 3.3, 3.3, 3.4, 3.4, 3.5, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.1, 4.3, 4.5, 4.7, 4.9, 5.2, 5.5, 5.9, 6.4, 7.0, 7.7, 8.7, 9.8, 11.3, 13.2, 15.8, 19.2, 23.9, 30.3, 39.5, 52.6, 71.7, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.1, 2.1, 2.1, 2.1, 2.1, 2.1, 2.1, 2.1, 2.1, 2.1, 2.1, 2.2, 2.2, 2.2, 2.2, 2.2, 2.2, 2.3, 2.3, 2.3, 2.4, 2.4, 2.4, 2.5, 2.5, 2.6, 2.6, 2.7, 2.8, 2.9, 3.0, 3.1, 3.3, 3.4, 3.6, 3.9, 4.2, 4.5, 4.9, 5.4, 6.1, 6.9, 7.9, 9.3, 11.0, 13.4, 16.7, 21.3, 27.7, 36.9, 50.3, 70.1, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [1.3, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.6, 1.6, 1.6, 1.6, 1.7, 1.7, 1.7, 1.8, 1.8, 1.9, 1.9, 2.0, 2.1, 2.1, 2.2, 2.3, 2.5, 2.6, 2.8, 3.1, 3.4, 3.7, 4.1, 4.7, 5.4, 6.3, 7.5, 9.2, 11.4, 14.5, 18.9, 25.2, 34.3, 47.8, 68.3, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.2, 1.2, 1.2, 1.3, 1.3, 1.4, 1.4, 1.5, 1.6, 1.6, 1.8, 1.9, 2.0, 2.2, 2.5, 2.7, 3.1, 3.6, 4.2, 5.0, 6.1, 7.6, 9.6, 12.5, 16.7, 22.8, 31.7, 45.3, 66.4, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.8, 0.8, 0.8, 0.8, 0.8, 0.9, 0.9, 1.0, 1.0, 1.1, 1.1, 1.2, 1.3, 1.4, 1.6, 1.8, 2.0, 2.3, 2.7, 3.2, 3.9, 4.9, 6.2, 8.1, 10.7, 14.6, 20.4, 29.1, 42.7, 64.3, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.6, 0.6, 0.6, 0.7, 0.7, 0.8, 0.8, 0.9, 1.0, 1.1, 1.2, 1.4, 1.7, 2.0, 2.4, 3.0, 3.9, 5.0, 6.7, 9.1, 12.7, 18.1, 26.5, 40.0, 62.2, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.4, 0.4, 0.4, 0.4, 0.5, 0.5, 0.5, 0.6, 0.7, 0.7, 0.9, 1.0, 1.2, 1.5, 1.8, 2.3, 3.0, 4.0, 5.5, 7.6, 10.9, 15.9, 24.0, 37.3, 59.9, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3, 0.3, 0.3, 0.3, 0.4, 0.4, 0.5, 0.6, 0.7, 0.8, 1.0, 1.3, 1.7, 2.3, 3.1, 4.4, 6.2, 9.2, 13.8, 21.4, 34.5, 57.5, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3, 0.3, 0.4, 0.5, 0.6, 0.7, 1.0, 1.3, 1.7, 2.4, 3.4, 5.0, 7.6, 11.8, 18.9, 31.6, 55.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.2, 0.2, 0.2, 0.3, 0.4, 0.5, 0.7, 0.9, 1.3, 1.8, 2.6, 4.0, 6.2, 9.9, 16.5, 28.7, 52.3, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.2, 0.2, 0.3, 0.4, 0.6, 0.9, 1.3, 2.0, 3.0, 4.9, 8.2, 14.2, 25.8, 49.4, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.1, 0.1, 0.2, 0.2, 0.3, 0.4, 0.6, 0.9, 1.4, 2.3, 3.8, 6.6, 12.0, 22.9, 46.4, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.1, 0.2, 0.3, 0.4, 0.6, 1.0, 1.6, 2.8, 5.2, 9.9, 20.0, 43.2, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.2, 0.2, 0.4, 0.6, 1.1, 2.1, 3.9, 8.0, 17.2, 39.7, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.1, 0.2, 0.4, 0.7, 1.4, 2.9, 6.2, 14.4, 36.1, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.2, 0.5, 0.9, 2.0, 4.6, 11.7, 32.3, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.3, 0.6, 1.3, 3.3, 9.1, 28.2, 100.0, 100.0, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.3, 0.8, 2.2, 6.8, 23.9, 100.0, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.2, 0.4, 1.3, 4.6, 19.4, 100.0, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.2, 0.7, 2.9, 14.9, 100.0, 100.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.3, 1.6, 10.6, 10.6]
      ];
      for (var x = 0; x < mortTable.length; x++) {
        for (var y = 0; y < mortTable[x].length; y++) {
          mortTable[x][y] = mortTable[x][y] / 100;
        }
      }
      return mortTable;
    };

  });
}());
