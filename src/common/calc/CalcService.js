(function() {
  var module = angular.module('calc_service', []);

  var service_ = null;
  var q_ = null;

  module.provider('calcService', function() {
    this.$get = function($rootScope, $q) {
      service_ = this;
      q_ = $q;
      return service_;
    };

    this.ComputeXValue = function(ageAtHire,ageAtRetire,wageAtHire,definedContribution,investReturn,wageIncrease) {
      var xValue;
      xValue = ((wageAtHire * definedContribution) / (investReturn - wageIncrease)) * (1 - Math.pow(((1 + wageIncrease)/(1 + investReturn)),ageAtRetire-ageAtHire));
      return xValue;
    };

    this.ComputeYValue = function(ageAtHire,ageAtRetire,wageAtHire,definedContribution,investReturn) {
      var yValue;
      yValue = (Math.pow((1 + investReturn),ageAtRetire - ageAtHire) * (1 + (investReturn*11/24)));
      return yValue;
    };

    this.FillOwnStaticTable = function(employee_array,spouse_array,mortProjection,mortTable,mortTableLength,ARA,spouseARA,Startage,EndAge) {
      for(var x = Startage; x < EndAge; x++)
        {
            var tableIndex = x - Startage + 1;
            if(mortTableLength == 2)
            {
                employee_array[x] = mortTable[tableIndex][0];
                spouse_array[x] = mortTable[tableIndex][1];
            }
            else if(mortTableLength == 4)
            {
                employee_array[x] = mortTable[tableIndex][0] * Math.pow((1 - mortTable[tableIndex][2]),mortProjection);
                spouse_array[x] = mortTable[tableIndex][1] * Math.pow((1 - mortTable[tableIndex][3]),mortProjection);
            }
            else if(mortTableLength == 8)
            {
                if(x < ARA)
                {
                    employee_array[x] = mortTable[tableIndex][0] * Math.pow((1 - mortTable[tableIndex][2]),mortProjection);
                }
                else
                {
                    employee_array[x] = mortTable[tableIndex][4] * Math.pow((1 - mortTable[tableIndex][6]),mortProjection);
                }
                
                if(x < spouseARA)
                {
                    spouse_array[x] = mortTable[tableIndex][1] * Math.pow((1 - mortTable[tableIndex][3]),mortProjection);
                }
                else
                {
                    spouse_array[x] = mortTable[tableIndex][5] * Math.pow((1 - mortTable[tableIndex][8]),mortProjection);
                }
            }
        }
    };
    
    this.FillOwnGenerationalTable = function(employee_array,spouse_array,mortProjection,mortTable,mortTableLength,ARA,spouseARA,age,spouseAge,Startage,EndAge) {
        for(var x = Startage; x < EndAge; x++)
        {
            var tableIndex = x - Startage + 1;
            var raisePower = mortProjection;
            if(mortTableLength == 4)
            {
                raisePower = mortProjection + x - age;
                employee_array[x] = mortTable[tableIndex][0] * Math.pow((1 - mortTable[tableIndex][2]),raisePower);
                
                raisePower = mortProjection + x - spouseAge;
                spouse_array[x] = mortTable[tableIndex][1] * Math.pow((1 - mortTable[tableIndex][3]),raisePower);
            }
            else if(mortTableLength == 8)
            {
                if( x < ARA)
                {
                    raisePower = mortProjection + x - age;
                    employee_array[x] = mortTable[tableIndex][0] * Math.pow((1 - mortTable[tableIndex][2]),raisePower);
                }
                else
                {
                    raisePower = mortProjection + x - age;
                    employee_array[x] = mortTable[tableIndex][4] * Math.pow((1 - mortTable[tableIndex][6]),raisePower);
                }
                
                if( x < spouseARA)
                {
                    raisePower = mortProjection + x - spouseAge;
                    spouse_array = mortTable[tableIndex][1] * Math.pow((1 - mortTable[tableIndex][3]),raisePower);
                }
                else
                {
                    raisePower = mortProjection + x - spouseAge;
                    spouse_array = mortTable[tableIndex][5] * Math.pow((1 - mortTable[tableIndex][8]),raisePower);
                }
            }
        }
    };
    
    this.FillPPATable = function(non_annuiant_array,annuitant_array,annuitant_age,annuitant_divisor,AA_Scale,Weight_Scale,mortProjection,output_NAnnuitant,output_Annuitant,output_Combined) {
        for(var x = 0; x < 70; x++)
        {
            output_NAnnuitant[x] = non_annuiant_array[x] * Math.pow(1 - AA_Scale[x],mortProjection - 2000 + 15);
        }
        for(var x = 79; x < 120; x++)
        {
            output_NAnnuitant[x] = annuitant_array[x] * Math.pow(1 - AA_Scale[x],mortProjection - 2000 + 7);
        }
        for(var x = 70; x < 78; x++)
        {
            //TODO Possible Integer Division Issues
            output_NAnnuitant[x] = output_NAnnuitant[x - 1] + (output_NAnnuitant[79] - output_NAnnuitant[69]) * ((x - 70) / 55); 
        }
        
        for(var x = 0; x < annuitant_age; x++)
        {
            output_Annuitant[x] = output_NAnnuitant[x];
        }
        for(var x = 49; x < 120; x++)
        {
            output_Annuitant[x] = annuitant_array[x] * Math.pow((1 - AA_Scale[x]),mortProjection - 2000 + 7);
        }
        for(var x = annuitant_age; x < 49; x++)
        {
            //TODO Possible Integer Division Issues
            output_Annuitant[x] = output_Annuitant[x - 1] + (output_Annuitant[50] - output_Annuitant[annuitant_age]) * ((x - annuitant_age) / annuitant_divisor);
        }
        
        for(var x = 0; x < 120; x++)
        {
            output_Combined[x] = output_NAnnuitant[x] * (1 - Weight_Scale[x]) + output_Annuitant[x] * Weight_Scale[x];
        }
    
    };

    this.FillPPALS = function(combined_employee,combined_spouse,combined417_array,ARA,spouseARA,output_employee,output_spouse) {
        for(var x = 0; x < 120; x++)
        {
            if(x < ARA)
            {
                output_employee[x] = combined_employee[x];
            }
            else
            {
                output_employee[x] = combined417_array[x];
            }
            if(x < spouseARA)
            {
                output_spouse[x] = combined_spouse[x];
            }
            else
            {
                output_spouse[x] = combined417_array[x];
            }
        }
    };
    
    this.FillPPA = function(combined_employee,combined_spouse,output_employee,output_spouse) {
        for(var x = 0; x < 120; x++)
        {
            output_employee[x] = combined_employee[x];
            ouput_spouse[x] = combined_spouse[x];
        }
    };
    
    this.FillPPAGenerationalLS = function(NAnnuitant_array,combined417_array,AA_employee,AA_spouse,mortProjection,ARA,spouseARA,age,spouseAge,output_employee,output_spouse) {
        for(var x = 0; x < 120; x++)
        {
            if(x < ARA)
            {
                output_employee[x] = NAnnuitant_array[x] * Math.pow((1 - AA_employee[x]),mortProjection - 2000 + x - age);
            }
            else
            {
                output_employee[x] = combined417_array[x];
            }
            
            if( x < spouseARA)
            {
                output_spouse[x] = NAnnuitant_array[x] * Math.pow((1 - AA_spouse[x]),mortProjection - 2000 + x - spouseAge);
            }
            else
            {
                output_spouse[x] = combined417_array[x];
            }
        }
    };
    
    this.FillPPAGenerational = function(NAnnuitant_employee,Annuitant_employee,NAnnuitant_spouse,Annuitant_spouse,AA_employee,AA_spouse,mortProjection,ARA,spouseARA,age,spouseAge,output_employee,output_spouse) {
        for(var x = 0; x < 120; x++)
        {
            if(x < ARA)
            {
                output_employee[x] = NAnnuitant_employee[x] * Math.pow((1 - AA_employee[x]),mortProjection - 2000 + x - age);
            }
            else
            {
                output_employee[x] = Annuitant_employee[x] * Math.pow((1 - AA_employee[x]),mortProjection - 2000 + x - age);
            }
            
            if(x < spouseARA)
            {
                output_spouse[x] = NAnnuitant_spouse[x] * Math.pow((1 - AA_spouse[x]),mortProjection - 2000 + x - spouseAge);
            }
            else
            {
                output_spouse[x] = Annuitant_spouse[x] * Math.pow((1 - AA_spouse[x]),mortProjection - 2000 + x - spouseAge);
            }
        }
    };
    
    this.ComputeZValue = function(rates, rateStructure, mortName, mortTable, mortProjection, age, ARA, sex, certainPeriod, tempPeriod, spouseAge, pctEE, pctBoth, pctSpouse, COLApct, COLAStartAge) {
      var zValue = 0;
      var mortTableLength = 0;
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
      
      if(rateStructure.localeCompare("spot",{ignorePunctuation:true}) == 0) {
        rateStructure = "spot";
        }
      else if(rateStructure.localeCompare("forward",{ignorePunctuation:true}) == 0) {
        rateStructure = "forward";
        }
       else if(rateStructure.localeCompare("pbgcls",{ignorePunctuation:true}) == 0) {
        rateStructure = "pbgcls";
        }
        else
        {
            console.log("incorrect rateStructure");
            return zValue;
        }
        
        if(sex.localeCompare("m",{ignorePunctuation:true}) || sex.localeCompare("male",{ignorePunctuation:true}))
        {
            sex = "m";
        }
        else
        {
            sex = "f";
        }
        
      if(ARA < age) {
        certainPeriod = max(certainPeriod - age + ARA, 0);
        tempPeriod = max(tempPeriod - age + ARA, 0);
        ARA = age;
      }

      //Set mortality table start age and end age
      if(mortName == "ownstatic" || mortName == "owngenerational") {
        Startage = mortTable[0][0];
        EndAge = min(mortTable.length + Startage - 1, 120);
      }
      else {
        Startage = 0;
        EndAge = 120;
      }

      if(!Array.isArray(rates))
      {
        console.log("ERROR: Rates must be array");
        return -1;
      }
      //Figure out size of mortTable
      mortTableLength = mortTable[0].length;
      
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
      for(x = 0; x < age - 1; x++) {
        interest[x] = 0;
      }

      console.log("----zValue Params---------");
      console.log("rateStructure = ",rateStructure);
      console.log("mortName = ",mortName);
      console.log("mortProjection = ",mortProjection);
      console.log("age = ", age);
      console.log("ARA = ",ARA);
      console.log("sex = ",sex);
      console.log("certainPeriod = ", certainPeriod);
      console.log("tempPeriod = ", tempPeriod);
      console.log("spouseAge = ", spouseAge);
      console.log("pctEE = ", pctEE);
      console.log("pctBoth = ", pctBoth);
      console.log("pctSpouse = ", pctSpouse);
      console.log("COLApct = ", COLApct);
      console.log("COLAStartAge = ", COLAStartAge);
      console.log("----zValue Params End---------");
      switch(rateStructure) {
      case "spot":
        numRates = rates.length;
        if(numRates < 3) {
          for(x = age; x < age + 4; x++) {
            interest[x] = rates[0];
          }

          for(x = age + 5; x < age + 19; x++) {
            interest[x] = rates[1];
          }

          for(x = age + 20; x < 200; x++) {
            interest[x] = rates[2];
          }
        }
        else {
          for(x = age; x < age + numRates - 1; x++) {
            interest[x] = rates[x - age + 1];
          }
          for(x = age + numRates - 1; x < 200; x++) {
            interest[x] = rates[numRates - 1];
          }
        }
      break;
      case "forward":
      var invalidRates = false;
        if(rates.length > 1) {
          z = 0;
          for(y = 0; y < rates.length; y++) {
            for(x = age + z; x < age + rates[y][0] - 1; x++) {
              interest[x] = rates[y][1];
            }
            z = rates[y][0];
          }
        }
        if(invalidRates) {
          z = 0;
          for(y = 0; y < rates.length; y+=2) {
            for(x = age + z; x < age + rates[y] - 1; x++) {
              interest[x] = rates[y+1];
            }
            z = rates[y];
          }
        }
      break;
      case "pbgcls":
      for(x = ARA; x < 200; x++) {
        interest[x] = rates[0];
        }
      for(x = ARA - 1; x > Math.max(ARA-7,age); x--) {
        interest[x] = rates[1];
        }
      for(x= ARA - 8; x > Math.max(ARA - 15,age); x--) {
        interest[x] = rates[2];
        }
      for(x = ARA - 16; x > Math.max(ARA - 120,age); x--) {
        interest[x] = rates[3];
        }
      break;
      };//END INTEREST ARRAY WORK
      
      //Check for COLAWork
      var doCOLAWork = true;
      if(COLAStartAge < 1) { 
        for(x = 0; x < 500; x++) {
            COLAincrease[x] = 1;
        }
        doCOLAWork = false;
      }
      
      if(doCOLAWork) 
      {
        for(x = 0; x < COLAStartAge; x++)
        {
            COLAincrease[x] = 1;
        }
        if(COLApct == 0) 
        {
            for(x = COLAStartAge + 1; x < 500; x++)
            {
                COLAincrease[x] = 1;
            }
        }
        else
        {
            if(!Array.isArray(COLApct))
            {
                for(x = COLAStartAge + 1; x < 500; x++)
                {
                    COLAincrease[x] = COLAincrease[x - 1] * (1 + COLApct);
                }
            }
            else
            {
                //TODO COLARange
            }
                
        }
      } //END COLAWork
      
      
      //MORTALITY TABLE WORK
      switch(mortName)
      {
      case "ownstatic":
        if(sex == "m")
        {
            service_.FillOwnStaticTable(q_ee,q_sp,mortProjection,mortTable,mortTableLength,ARA,spouseARA,Startage,EndAge);
        else
        {
            service_.FillOwnStaticTable(q_sp,q_ee,mortProjection,mortTable,mortTableLength,ARA,spouseARA,Startage,EndAge);
        }
      break;
      case "owngenerational":
      if(sex == "m")
      {
        service_.FillOwnGenerationalTable(q_ee,q_sp,mortProjection,mortTable,mortTableLength,ARA,spouseARA,age,spouseAge,Startage,EndAge);
      }
      else
      {
        service_.FillOwnGenerationalTable(q_sp,q_ee,mortProjection,mortTable,mortTableLength,ARA,spouseARA,age,spouseAge,Startage,EndAge);
      }
      break;
      
      //DO NOT CHANGE ORDER OF CASE STATEMENTS BELOW//////////
      case "ppa417e":
      case "ppasmallls":
      case "ppastaticls":
      case "ppagenerationalls":
        sevice_.FillPPATable(qn_m,qa_m,40,55,AA_m,Weight_m,mortProjection,q417n_m,q417a_m,q417_m);
        
        sevice_.FillPPATable(qn_f,qa_f,44,21,AA_f,Weight_f,mortProjection,q417n_f,q417a_f,q417_f);
        
        for(x = 0; x < 120; x++)
        {
            q417[x] = q417_m[x] * 0.5 + q417_f[x] * 0.5;
        }
        if(mortName == "ppa417e")
        {
            for(x = 0; x < 120; x++)
            {
                q_ee[x] = q417[x];
                q_sp[x] = q417[x];
            }
            //SWITCH STATEMENT BREAK////////
            //INTENTIONAL////////////
            break;
        }
        //INTENTIONAL CASE FALLTHROUGH//
        case "ppasmall":
        case "ppastatic":
        if(mortName == "ppasmallls" || mortName == "ppastaticls" || mortName == "ppasmall" || mortName == "ppastatic")
        {
            sevice_.FillPPATable(qn_m,qa_m,40,55,AA_m,Weight_m,mortProjection,qn_m,qa_m,q_m);
            
            sevice_.FillPPATable(qn_f,qa_f,44,21,AA_f,Weight_f,mortProjection,qn_f,qa_f,q_f);
            
            if(mortName == "ppasmallls" || mortName == "ppastaticls")
            {
                if(sex == "m")
                {
                    service_.FillPPALS(q_m,q_f,q417,ARA,spouseARA,q_ee,q_sp);
                }
                else if(sex == "f")
                {
                    service_.FillPPALS(q_f,q_m,q417,ARA,spouseARA,q_ee,q_sp);
                }
            }
            else if(mortName == "ppasmall" || mortName == "ppastatic")
            {
                if(sex == "m")
                {
                    service_.FillPPA(q_m,q_f,q_ee,q_sp);
                }
                else if(sex == "f")
                {
                    service_.FillPPA(q_f,q_m,q_ee,q_sp);
                }
            }
            //SWITCH STATEMENT BREAK////////
            //INTENTIONAL////////////
            break;
        }
        case "ppagenerational":
        if(mortName == "ppagenerationalls")
        {
            if(sex == "m")
            {
                service_.FillPPAGenerationalLS(qn_m,q417,AA_m,AA_f,mortProjection,age,spouseAge,q_ee,q_sp);
            }
            else if(sex == "f")
            {
                service_.FillPPAGenerationalLS(qn_f,q417,AA_f,AA_m,mortProjection,age,spouseAge,q_ee,q_sp);
            }
        }
        else if(mortName == "ppagenerational")
        {
            if(sex == "m")
            {
                service_.FillPPAGenerational(qn_m,qa_m,qn_f,qa_f,AA_m,AA_f,mortProjection,age,spouseAge,q_ee,q_sp);
            }
            else if(sex == "f")
            {
                service_.FillPPAGenerational(qn_f,qa_f,qn_m,qn_f,AA_f,AA_m,mortProjection,age,spouseAge,q_ee,q_sp);
            }
        }
      break;
      case "pbgcmort":
        if(sex == "m")
        {
            for(x = 0; x < 120; x++)
            {
                q_ee[x] = qUP94_m[x] * Math.pow((1 - AA_m[x]),mortProjection - 1994 + 10);
                q_sp[x] = qUP94_f[x] * Math.pow((1 - AA_f[x]),mortProjection - 1994 + 10);
            }
        }
        else if(sex == "f")
        {
            for(x = 0; x < 120; x++)
            {
                q_ee[x] = qUP94_f[x] * Math.pow((1 - AA_f[x]),mortProjection - 1994 + 10);
                q_sp[x] = qUP94_m[x] * Math.pow((1 - AA_m[x]),mortProjection - 1994 + 10);
            }
        }
        break;
        case "gar94":
            for(x = 0; x < 120; x++)
            {
                q_ee[x] = qGar94[x];
                q_sp[x] = qGar94[x];
            }
        break;
        case "gam83":
            if(sex == "m")
            {
                for(x = 0; x < 120; x++)
                {
                    q_ee[x] = qGam83_m[x];
                    q_sp[x] = qGam83_f[x];
                }
            }
            else if(sex == "f")
            {
                for(x = 0; x < 120; x++)
                {
                    q_ee[x] = qGam83_f[x];
                    q_sp[x] = qGam83_m[x];
                }
            }
        break;
      }; //END SWITCH STATEMENT
    //END INDIVIDUAL MORT WORK  
      
      //Joint table
      minJSq = Math.max(0, 1 - spouseAge + age);
      maxJSq = Math.min(120, 120 - spouseAge + age);
      
      for(x = minJSq; x < maxJSq; x++)
      {
        q_eesp[x] = 1 - (1 - q_ee[x]) * (1 - q_sp[x - age + spouseAge]);
      }
      
      //PV Calculation
      for(x = age + 1; x < 121; x++)
      {
        p_ee[x] = p_ee[x - 1] * (1 - q_ee[x - 1]);
      }
      
      for(x = spouseAge + 1; x < 121; x++)
      {
        p_sp[x] = p_sp[x - 1] * (1 - q_sp[x - 1]);
      }
      
      for(x = age + 1; x < 121; x++)
      {
        p_eesp[x] = p_eesp[x - 1] * (1 - q_eesp[x - 1]);
      }
      
      switch(rateStructure)
      {
        case "spot":
            
            //Discount Values
            for(x = age; x < EndAge; x++)
            {
                if(x < ARA)
                {
                    DiscountValue_ee[x] = 0;
                }
                else
                {
                    DiscountValue_ee[x] = p_ee[x] * Math.pow(1 + interest[x], -(x - age));
                }
            }
            
            for(x = spouseAge; x < EndAge; x++)
            {
                if(x < spouseARA)
                {
                    DiscountValue_sp[x] = 0;
                }
                else
                {
                    DiscountValue_sp[x] = p_sp[x] * Math.pow(1 + interest[x - spouseAge + age], -(x - spouseAge));
                }
            }
            
            for(x = age; x < EndAge; x++)
            {
                if(x < ARA)
                {
                    DiscountValue_eesp[x] = 0;
                }
                else
                {
                    DiscountValue_eesp[x] = p_eesp[x] * Math.pow(1 + interest[x], -(x - age));
                }
            }
            
            //Adj Discount Values
            for(x = age; x < EndAge; x++)
            {
                if(x < ARA)
                {
                    AdjDiscountValue_ee[x] = 0;
                }
                else
                {
                    //TODO Possible Integer division issue
                    AdjDiscountValue_ee[x] = (DiscountValue_ee[x] - ((11/24 * p_ee[x] * Math.pow((1 + interest[x]), -(x - age))) - (11/24 * p_ee[x + 1] * Math.pow((1 + interest[x]), -(x - age + 1))))) * COLAincrease[x];
                }
            }
            
            for(x = spouseAge; x < EndAge; x++)
            {
                if(x < spouseARA)
                {
                    AdjDiscountValue_sp[x] = 0;
                }
                else
                {
                    //TODO Possible Integer division issue
                    AdjDiscountValue_sp[x] = (DiscountValue_sp[x] - ((11/24 * p_sp[x] * Math.pow((1 + interest[x - spouseAge + age]), -(x - spouseAge))) - (11/24 * p_sp[x + 1] * Math.pow((1 + interest[x - spouseAge + age]), -(x - spouseAge + 1))))) * COLAincrease[x];
                }
            }
            
            for(x = age; x < EndAge; x++)
            {
                if(x < ARA)
                {
                    AdjDiscountValue_eesp[x] = 0;
                }
                else
                {
                    //TODO Possible Integer division issue
                    AdjDiscountValue_eesp[x] = (DiscountValue_eesp[x] - ((11/24 * p_eesp[x] * Math.pow((1 + interest[x]), -(x - age))) - (11/24 * p_eesp[x + 1] * Math.pow((1 + interest[x]), -(x - age + 1))))) * COLAincrease[x];
                }
            }
            
            //Adjust for certain Period
            for( x = ARA; x < ARA + certainPeriod - 1; x++)
            {
                monthlyRate = Math.pow((1 + interest[x]),1/12) - 1;
                pvCertainPeriod = pvCertainPeriod + (Math.pow((1 + interest[x]),(age - x)) * ((( 1 - 1 / Math.pow(1+monthlyRate,12)) / monthlyRate / 12) * ( 1 + monthlyRate)) * p_ee[ARA] * COLAincrease[x];
            }
            
        break;
        case "forward":
        case "pbgcls":
            for(x = 0; x < age; x++)
            {
                v[x] = 1;
            }
            for(x = age; x < 200; x++)
            {
                v[x] = v[x - 1] / (1 + interest[x - 1]);
            }
            
            for(x = age; x < EndAge; x++)
            {
                if(x < ARA)
                {
                    DiscountValue_ee[x] = 0;
                }
                else
                {
                    DiscountValue_ee[x] = p_ee[x] * v[x];
                }
            }
            
            for(x = spouseAge; x < EndAge; x++)
            {
                if(x < spouseARA)
                {
                    DiscountValue_sp[x] = 0;
                }
                else
                {
                    DiscountValue_sp[x] = p_sp[x] * v[x - spouseAge + age];
                }
            }
            
            for(x = age; x < EndAge; x++)
            {
                if(x < ARA)
                {
                    DiscountValue_eesp[x] = 0;
                }
                else
                {
                    DiscountValue_eesp[x] = p_eesp[x] * v[x];
                }
            }
            
            for(x = age; x < EndAge; x++)
            {
                if(x < ARA)
                {
                    AdjDiscountValue_ee[x] = 0;
                }
                else
                {
                    //TODO Possible Integer division issue
                    AdjDiscountValue_ee[x] = (DiscountValue_ee[x] - ((11/24 * p_ee[x] * v[x]) - (11/24 * p_ee[x + 1] * v[x]))) * COLAincrease[x];
                }
            }
            
            for(x = spouseAge; x < EndAge; x++)
            {
                if(x < spouseARA)
                {
                    AdjDiscountValue_sp[x] = 0;
                }
                else
                {
                    //TODO Possible Integer division issue
                    AdjDiscountValue_sp[x] = (DiscountValue_sp[x] - (((11/24 * p_sp[x] * v[x - spouseAge + age])) - (11/24 * p_sp[x + 1] * v[x - spouseAge + age]))) * COLAincrease[x];
                }
            }
            
            for(x = age; x < EndAge; x++)
            {
                if(x < ARA)
                {
                    AdjDiscountValue_eesp[x] = 0;
                }
                else
                {
                    //TODO Possible Integer division issue
                    AdjDiscountValue_eesp[x] = (DiscountValue_eesp[x] - ((11/24 * p_eesp[x] * v[x]) - (11/24 * p_eesp[x + 1] * v[x]))) * COLAincrease[x];
                }
            }
            
            //Adjust for certain Period
            for( x = ARA; x < ARA + certainPeriod - 1; x++)
            {
                monthlyRate = Math.pow((1 + interest[x]),1/12) - 1;
                pvCertainPeriod = pvCertainPeriod + (v[x] * ((( 1 - 1 / Math.pow(1+monthlyRate,12)) / monthlyRate / 12) * ( 1 + monthlyRate)) * p_ee[ARA] * COLAincrease[x];
            }
        break;
      }; //DISCOUNT ADJUST SWITCH END
    
      var endSum = Math.min(ARA + tempPeriod - 1,EndAge);
      for(x = ARA + certainPeriod; x < endSum; x++)
      {
        a_ee = a_ee + AdjDiscountValue_ee[x];
      }
      
      endSum = Math.min(spouseARA + tempPeriod - 1,EndAge);
      for(x = spouseARA + certainPeriod; x < endSum; x++)
      {
        a_sp = a_sp + AdjDiscountValue_sp[x];
      }
      
      endSum = Math.min(ARA + tempPeriod - 1,EndAge);
      for(x = ARA + certainPeriod; x < endSum; x++)
      {
        a_eesp = a_eesp + AdjDiscountValue_eesp[x];
      }
      
      //Final value calculation
      zValue = pctEE * a_ee + pctSpouse * a_sp - (pctEE + pctSpouse - pctBoth) * a_eesp + pvCertainPeriod;
      return zValue;
    };//Function END
  });
}());
