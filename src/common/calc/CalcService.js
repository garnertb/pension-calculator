(function() {
  var module = angular.module('calc_service', []);

  //var service_ = null;
  var q_ = null;

  module.provider('calcService', function() {
    this.$get = function($rootScope, $q) {
      q_ = $q;
      return this;
    };
    
    this.ComputeXValue = function(ageAtHire,ageAtRetire,wageAtHire,definedContribution,investReturn,wageIncrease) {
        var xValue;
        xValue = ((wageAtHire * definedContribution) / (investReturn - wageIncrease)) * (pow(1 - ((1 + wageIncrease)/(1 + investReturn)),ageAtRetire-ageAtHire));
        return xValue;
    };
    
    this.ComputeYValue = function(ageAtHire,ageAtRetire,wageAtHire,definedContribution,investReturn) {
        var yValue;
        yValue = (pow((1 + investReturn),ageAtRetire - ageAtHire) * (1 + (investReturn*11/24)));
        return yValue;
    };
    
    
    
    this.ComputeZValue = function(rates, rateStructure, mortName, mortTable, mortProjection, age, ARA, sex, certainPeriod, tempPeriod, spouseAge, pctEE, pctBoth, pctSpouse, COLApct, COLAStartAge) {
      var zValue = 0;
      var x,y,z = 0;    //counters for something
      var spouseARA = 0;
      var minJSq, maxJSq; //joint mortality table min and max
      var a_ee, a_sp, a_eesp = 0;
      var p_ee = [];
      p_ee[age] = 1;
      var p_sp = [];
      var p_eesp = [];
      p_eesp[age] = 1;
      var qn_m = [];    //q for non-annuitant male
      var qn_f = [];    //q for non-annuitant female
      var qa_m = [];    //q for annuitant male
      var qa_f = [];    //q for annuitant female
      var q417n_m = []; //'q for non-annuitant male 417(e)
      var q417n_f = []; //'q for non-annuitant female 417(e)
      var q417a_m = []; //'q for annuitant male 417(e)
      var q417a_f = []; //'q for annuitant female 417(e)
      var AA_m = [];    //'Scale AA for males
      var AA_f = [];    //'Scale AA for Females
      var q_m = [];     //'q for males
      var q_f = [];     //'q for females
      var q417_m = [];  //'q for males 417(e)
      var q417_f = [];  //'q for females 417(e)
      var q_ee = [];    //'q for employee in a J&S calculation
      var q_sp = [];    //'q for spouse in a J&S calculation
      var q417 = [];    //'417(e) mortality table
      var q_eesp = [];  //'q_ee and sp for J&S calculation
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
      var Interest = [];
      var pvCertainPeriod = 0;
      var MonthlyRate = 0;
      var CountRates = 0;
      var Startage = 0; //'for mortality table
      var EndAge;       //'for mortality table
      var v = [];       //'interest discount for forward rates
      var COLAincrease = [];
      
      //Input validation
      if(ARA < age) {
        certainPeriod = max(certainPeriod - age + ARA, 0);
        tempPeriod = max(tempPeriod - age + ARA, 0);
        ARA = age;
      }
      
      //Set mortality table start age and end age
      if(mortName == "ownstatic" || mortName == "owngenerational") {
        Startage = mortTable[1][1];
        EndAge = min(mortTable.length + Startage - 1, 120);
      } 
      else {
        Startage = 1;
        EndAge = 120;
      }
      
      //Setup spouse information
      if(spouseAge < 1) {
        spouseAge = age;
        spouseARA = ARA;
        pctEE = 1;
        pctBoth = 1;
        pctSpouse = 0;
      } 
      else {
        spouseARA = ARA - age + spouseAge;
      }
      p_sp[spouseAge] = 1;
      
      //Set up interest array
      for(x = 1; x < age - 1; x++) {
        interest[x] = 0;
      }
      
      if(rateStructure == "spot") {
        numRates = rates.length;
        if(numRates < 3) {
          for(x = age; x < age + 4; x++) {
            interest[x] = rates[1];
          }
          
          for(x = age + 5; x < age + 19; x++) {
            interest[x] = rates[2];
          }
          
          for(x = age + 20; x < 200; x++) {
            interest[x] = rates[3];
          }
        } 
        else {
          for(x = age; x < age + numRates - 1; x++) {
            interest[x] = rates[x - age + 1];
          }
          for(x = age + numRates - 1; x < 200; x++) {
            interest[x] = rates[numRates];
          }
        }
     }
     var invalidRates = false;
      if(rateStructure == "forward") {
        //Check typename of rates
        if(rates.length > 1) {
          z = 0;
          for(y = 1; y < rates.length; y++) {
            for(x = age + z; x < age + rates[y][1] - 1; x++) {
                interest[x] = rates[y][2];
            }
            z = rates[y][1];
          }
        }
        if(invalidRates) {
            z = 0;
            for(y = 1; y < rates.length; y+=2) {
                for(x = age + z; x < age + rates[y] - 1; x++) {
                    interest[x] = rates[y+1];
                }
                z = rates[y];
            }
        }
    }
};
  });
}());
