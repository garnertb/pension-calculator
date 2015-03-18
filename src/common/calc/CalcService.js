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

    this.ComputeFinalValue = function(wageAtRetire,finalSalaryYears,wageIncrease,xValue,yValue,zValue) {
      var finalValue = 0;
      finalValue = (xValue*yValue/zValue)/Math.pow(wageAtRetire/(1+wageIncrease),(finalSalaryYears/2-0.5));
      return finalValue;
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

    this.FillOwnStaticTable = function(employee_array,spouse_array,mortProjection,mortTable,mortTableLength,ARA,spouseARA,StartAge,EndAge) {
      StartAge = Math.trunc(StartAge);
      EndAge = Math.trunc(EndAge);
      for(x = StartAge; x < EndAge; x++)
        {
            var tableIndex = Math.trunc(x - StartAge + 1);
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
        StartAge = Math.trunc(StartAge);
        EndAge = Math.trunc(EndAge);
        for(x = Startage; x < EndAge; x++)
        {
            var tableIndex = Math.trunc(x - Startage + 1);
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
        for(x = 0; x < 70; x++)
        {
            output_NAnnuitant[x] = non_annuiant_array[x] * Math.pow(1 - AA_Scale[x],mortProjection - 2000 + 15);
        }
        for(x = 79; x < 120; x++)
        {
            output_NAnnuitant[x] = annuitant_array[x] * Math.pow(1 - AA_Scale[x],mortProjection - 2000 + 7);
        }
        for(x = 70; x < 78; x++)
        {
            //TODO Possible Integer Division Issues
            output_NAnnuitant[x] = output_NAnnuitant[x - 1] + (output_NAnnuitant[79] - output_NAnnuitant[69]) * ((x - 70) / 55); 
        }
        
        for(x = 0; x < annuitant_age; x++)
        {
            output_Annuitant[x] = output_NAnnuitant[x];
        }
        for(x = 49; x < 120; x++)
        {
            output_Annuitant[x] = annuitant_array[x] * Math.pow((1 - AA_Scale[x]),mortProjection - 2000 + 7);
        }
        for(x = annuitant_age; x < 49; x++)
        {
            //TODO Possible Integer Division Issues
            output_Annuitant[x] = output_Annuitant[x - 1] + (output_Annuitant[50] - output_Annuitant[annuitant_age]) * ((x - annuitant_age) / annuitant_divisor);
        }
        
        for(x = 0; x < 120; x++)
        {
            output_Combined[x] = output_NAnnuitant[x] * (1 - Weight_Scale[x]) + output_Annuitant[x] * Weight_Scale[x];
        }
    
    };

    this.FillPPALS = function(combined_employee,combined_spouse,combined417_array,ARA,spouseARA,output_employee,output_spouse) {
        for( x = 0; x < 120; x++)
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
        for(x = 0; x < 120; x++)
        {
            output_employee[x] = combined_employee[x];
            ouput_spouse[x] = combined_spouse[x];
        }
    };
    
    this.FillPPAGenerationalLS = function(NAnnuitant_array,combined417_array,AA_employee,AA_spouse,mortProjection,ARA,spouseARA,age,spouseAge,output_employee,output_spouse) {
        for(x = 0; x < 120; x++)
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
    
    this.PopulateMortalityTableMale = function(qn_m,qa_m,AA_m,Weight_m,qUP94_m,qGar94,qGam83_m) {
        qn_m = [0.000637, 0.00043, 0.000357, 0.000278, 0.000255, 0.000244, 0.000234, 0.000216, 0.000209, 0.000212, 0.000219, 0.000228, 0.00024, 0.000254, 0.000269, 0.000284, 0.000301, 0.000316, 0.000331,
                0.000345, 0.000357, 0.000366, 0.000373, 0.000376, 0.000376, 0.000378, 0.000382, 0.000393, 0.000412, 0.000444, 0.000499, 0.000562, 0.000631, 0.000702, 0.000773, 0.000841, 0.000904, 0.000964, 0.001021, 0.001079, 0.001142, 0.001215, 0.001299, 0.001397, 0.001508, 0.001616, 0.001734,
                0.00186, 0.001995, 0.002138, 0.002288, 0.002448, 0.002621, 0.002812, 0.003029, 0.003306, 0.003628, 0.003997, 0.004414, 0.004878, 0.005382, 0.005918, 0.006472, 0.007028, 0.007573, 0.008099, 0.008598, 0.009069, 0.00951, 0.009922, 0.010912, 0.012892, 0.015862, 0.019821, 0.024771, 0.03071, 0.03764, 0.045559, 0.054469, 0.064368, 0.072041,
                0.080486, 0.089718, 0.099779, 0.110757, 0.122797, 0.136043, 0.15059, 0.16642, 0.183408, 0.199769, 0.216605, 0.233662, 0.250693, 0.267491, 0.283905, 0.299852, 0.315296, 0.330207, 0.344556, 0.358628, 0.371685, 0.38304, 0.392003, 0.397886,
                0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 1];
    
        qa_m = [0.000637, 0.00043, 0.000357, 0.000278, 0.000255, 0.000244, 0.000234, 0.000216, 0.000209, 0.000212, 0.000219, 0.000228, 0.00024, 0.000254, 0.000269, 0.000284, 0.000301, 0.000316, 0.000331, 0.000345, 0.000357, 0.000366, 0.000373, 0.000376, 0.000376, 0.000378, 0.000382, 0.000393, 0.000412, 0.000444, 0.000499, 0.000562, 0.000631, 0.000702, 0.000773, 0.000841, 0.000904, 0.000964, 0.001021,
                0.001079, 0.001157, 0.001312, 0.001545, 0.001855, 0.002243, 0.002709, 0.003252, 0.003873, 0.004571, 0.005347, 0.005528, 0.005644, 0.005722, 0.005797, 0.005905, 0.006124, 0.006444, 0.006895, 0.007485, 0.008196, 0.009001, 0.009915, 0.010951, 0.012117, 0.013419, 0.014868, 0.01646, 0.0182,  0.020105, 0.022206, 0.02457, 0.027281, 0.030387, 0.0339,  0.037834, 0.042169, 0.046906, 0.052123, 0.057927, 0.064368, 0.072041, 0.080486, 0.089718, 0.099779, 0.110757, 0.122797, 0.136043, 0.15059, 
                0.16642, 0.183408, 0.199769, 0.216605, 0.233662, 0.250693, 0.267491, 0.283905, 0.299852, 0.315296, 0.330207, 0.344556, 0.358628, 0.371685, 0.38304, 0.392003, 0.397886, 0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,1];
        
        AA_m = [0.02, 0.02,  0.02,  0.02,  0.02,  0.02,  0.02,  0.02,  0.02,  0.02,  0.02,  0.02,  0.02,  0.019, 0.019, 0.019, 0.019, 0.019, 0.019, 0.019, 0.018, 0.017, 0.015, 0.013, 0.01,  0.006, 0.005, 0.005, 0.005, 0.005, 0.005, 0.005, 0.005, 0.005, 0.005, 0.005, 0.005, 0.006, 0.007, 0.008, 
                0.009, 0.01,  0.011, 0.012, 0.013, 0.014, 0.015, 0.016, 0.017, 0.018, 0.019, 0.02,  0.02,  0.02,  0.019, 0.018, 0.017, 0.016, 0.016, 0.016, 0.015, 0.015, 0.014, 0.014, 0.014, 0.013, 0.013, 0.014, 0.014, 0.015, 0.015, 0.015, 0.015, 0.015, 0.014, 0.014, 0.013, 0.012, 0.011, 
                0.01,  0.009, 0.008, 0.008, 0.007, 0.007, 0.007, 0.006, 0.005, 0.005, 0.004, 0.004, 0.003, 0.003, 0.003, 0.002, 0.002, 0.002, 0.001, 0.001, 0.001, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    
        Weight_m = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                0.0045, 0.0091, 0.0136, 0.0181, 0.0226, 0.0272, 0.0317, 0.0362, 0.0407, 0.0453, 0.0498, 0.0686, 0.0953, 0.1288, 0.2066, 0.3173, 0.378, 0.4401, 0.4986, 0.5633, 0.6338, 0.7103, 0.7902, 0.8355, 0.8832, 0.9321, 0.951, 0.9639, 0.9714, 0.974, 0.9766, 0.9792, 0.9818, 0.9844, 0.987, 0.9896, 0.9922, 0.9948, 0.9974,
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
                
        qUP94_m = [0.000637, 0.00043, 0.000357, 0.000278, 0.000255, 0.000244, 0.000234, 0.000216, 0.000209, 0.000212, 0.000223, 0.000243, 0.000275, 0.00032, 0.000371, 0.000421, 0.000463, 0.000495, 0.000521, 0.000545, 0.00057, 0.000598, 0.000633, 0.000671, 0.000711, 0.000749, 0.000782, 0.000811, 0.000838, 0.000862, 0.000883, 0.000902, 0.000912, 0.000913, 0.000915, 0.000927, 0.000958, 0.00101, 0.001075, 0.001153,
                0.001243, 0.001346, 0.001454, 0.001568, 0.001697, 0.001852, 0.002042, 0.00226, 0.002501, 0.002773, 0.003088, 0.003455, 0.003854, 0.004278, 0.004758, 0.005322, 0.006001, 0.006774, 0.007623, 0.008576, 0.009663, 0.010911, 0.012335, 0.013914, 0.015629, 0.017462, 0.019391, 0.021354, 0.023364, 0.025516, 0.027905, 0.030625, 0.033549, 0.036614, 0.040012, 0.043933, 0.04857, 0.053991, 0.060066,
                0.066696, 0.07378, 0.081217, 0.088721, 0.096358, 0.104559, 0.113755, 0.124377, 0.136537, 0.149949, 0.164442, 0.179849, 0.196001, 0.213325, 0.231936, 0.251189, 0.270441, 0.289048, 0.30675, 0.323976, 0.341116, 0.35856, 0.376699, 0.396884, 0.418855, 0.440585, 0.460043, 0.4752, 0.48567, 0.492807, 0.497189, 0.499394, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1];
        
        qGar94 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000262, 0.000296, 0.000324, 0.000343, 0.000357, 0.000368, 0.000381, 0.000396, 0.000418, 0.000441, 0.000468, 0.0005, 0.000523, 0.000543, 0.000564, 0.000588, 0.000612, 0.000633, 0.000649, 0.000661, 0.000675, 0.000695, 0.000727, 0.000768, 0.000819, 0.000879,
                0.000944, 0.001014, 0.001083, 0.001151, 0.001224, 0.001312, 0.001422, 0.001554, 0.001699, 0.001869, 0.002065, 0.002302, 0.002571, 0.002854, 0.003197, 0.003614, 0.004124, 0.004712, 0.005345, 0.006062, 0.006912, 0.007846, 0.008958, 0.010151, 0.011441, 0.01287, 0.014291, 0.015614, 0.017, 0.018396, 0.020025, 0.022026, 0.024187, 0.026581, 0.02931, 0.032392, 0.036288, 0.040636, 0.045463,
                0.050795, 0.056655, 0.063064, 0.069481, 0.076539, 0.084129, 0.092686, 0.103014, 0.114434, 0.126925, 0.14065, 0.154664, 0.17019, 0.186631, 0.203518, 0.222123, 0.240233, 0.25938, 0.278936, 0.297614, 0.31663, 0.338758, 0.35883, 0.380735, 0.404426, 0.427883, 0.449085, 0.466012, 0.478582, 0.48814, 0.494813, 0.498724, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1];
    
        qGam83_m = [0, 0, 0, 0, 0.000342, 0.000318, 0.000302, 0.000294, 0.000292, 0.000293, 0.000298, 0.000304, 0.00031 , 0.000317, 0.000325, 0.000333, 0.000343, 0.000353, 0.000365, 0.000377, 0.000392, 0.000408, 0.000424, 0.000444, 0.000464, 0.000488, 0.000513, 0.000542, 0.000572, 0.000607, 0.000645, 0.000687, 0.000734, 0.000785, 0.00086 , 0.000907, 0.000966, 0.001039, 0.001128, 0.001238,
                0.00137 , 0.001527, 0.001715, 0.001932, 0.002183, 0.002471, 0.00279 , 0.003138, 0.003513, 0.003909, 0.004324, 0.004755, 0.0052  , 0.00566 , 0.006131, 0.006618, 0.007139, 0.007719, 0.008384, 0.009158, 0.010064, 0.011133, 0.012391, 0.013868, 0.015592, 0.017579, 0.019804, 0.022229, 0.024817, 0.02753 , 0.030354, 0.03337 , 0.03668 , 0.040388, 0.044597, 0.049388, 0.054758, 0.060678, 0.067125, 0.07407 , 0.081484, 0.08932 , 0.097525, 0.106047, 0.114836,
                0.12417 , 0.13387 , 0.144073, 0.154859, 0.166307, 0.178214, 0.19046 , 0.203007, 0.217904, 0.234086, 0.248436, 0.263954, 0.280803, 0.299154, 0.319185, 0.341086, 0.365052, 0.393102, 0.427255, 0.469531, 0.521945, 0.586518, 0.665268, 0.760215, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    };
    
    this.PopulateMortalityTableFemale = function(qn_f,qa_f,AA_f,Weight_f,qUP94_f,qGam83_f) {
    
        qn_f = [0.000571, 0.000372, 0.000278, 0.000208, 0.000188, 0.000176, 0.000165, 0.000147, 0.00014, 0.000141, 0.000143, 0.000148, 0.000155, 0.000162, 0.00017, 0.000177, 0.000184, 0.000188, 0.00019, 0.000191, 0.000192, 0.000194, 0.000197, 0.000201, 0.000207, 0.000214, 0.000223, 0.000235, 0.000248, 0.000264, 0.000307, 0.00035, 0.000394, 0.000435, 0.000475, 0.000514, 0.000554, 0.000598, 0.000648, 0.000706, 0.000774, 0.000852, 0.000937, 0.001029, 0.001124,
                0.001223, 0.001326, 0.001434, 0.00155, 0.001676, 0.001814, 0.001967, 0.002135, 0.002321, 0.002526, 0.002756, 0.00301, 0.003291, 0.003599, 0.003931, 0.004285, 0.004656, 0.005039, 0.005429, 0.005821, 0.006207, 0.006583, 0.006945, 0.007289, 0.007613, 0.008309, 0.0097, 0.011787, 0.01457, 0.018049, 0.022224, 0.027094, 0.03266, 0.038922, 0.045879, 0.05078, 0.056294, 0.062506, 0.069517, 0.077446, 0.086376, 0.096337, 0.107303, 0.119154, 0.131682, 0.144604, 0.157618, 0.170433, 0.182799,
                0.194509, 0.205379, 0.21524, 0.223947, 0.231387, 0.237467, 0.244834, 0.254498, 0.266044, 0.279055, 0.293116, 0.307811, 0.322725, 0.337441, 0.351544, 0.364617, 0.376246, 0.386015, 0.393507, 0.398308, 0.4, 0.4, 0.4, 0.4, 0.4, 1];
    
        qa_f = [0.000571, 0.000372, 0.000278, 0.000208, 0.000188, 0.000176, 0.000165, 0.000147, 0.00014, 0.000141, 0.000143, 0.000148, 0.000155, 0.000162, 0.00017, 0.000177, 0.000184, 0.000188, 0.00019, 0.000191, 0.000192, 0.000194, 0.000197, 0.000201, 0.000207, 0.000214, 0.000223, 0.000235, 0.000248, 0.000264, 0.000307, 0.00035, 0.000394, 0.000435, 0.000475, 0.000514, 0.000554, 0.000598, 0.000648, 0.000706, 0.000774, 0.000852, 0.000937, 0.001029, 0.001124, 0.001223, 0.001335, 0.001559,
                0.001896, 0.002344, 0.002459, 0.002647, 0.002895, 0.00319, 0.003531, 0.003925, 0.004385, 0.004921, 0.005531, 0.0062, 0.006919, 0.007689, 0.008509, 0.009395, 0.010364, 0.011413, 0.01254, 0.013771, 0.015153, 0.016742, 0.018579, 0.020665, 0.02297, 0.025458, 0.028106, 0.030966, 0.034105, 0.037595, 0.041506, 0.045879, 0.05078, 0.056294, 0.062506, 0.069517, 0.077446, 0.086376, 0.096337, 0.107303, 0.119154, 0.131682, 0.144604, 0.157618, 0.170433, 0.182799, 0.194509, 0.205379,
                0.21524, 0.223947, 0.231387, 0.237467, 0.244834, 0.254498, 0.266044, 0.279055, 0.293116, 0.307811, 0.322725, 0.337441, 0.351544, 0.364617, 0.376246, 0.386015, 0.393507, 0.398308, 0.4, 0.4, 0.4, 0.4, 0.4, 1];
        
        AA_f = [0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.018, 0.016, 0.015, 0.014, 0.014, 0.015, 0.016, 0.017, 0.017, 0.016, 0.015, 0.014, 0.012, 0.012, 0.012, 0.012, 0.01, 0.008, 0.008, 0.009, 0.01, 0.011, 0.012, 0.013, 0.014, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.016, 0.017, 0.018, 0.018, 0.018, 0.017,
                0.016, 0.014, 0.012, 0.01, 0.008, 0.006, 0.005, 0.005, 0.005, 0.005, 0.005, 0.005, 0.005, 0.005, 0.005, 0.005, 0.005, 0.005, 0.005, 0.005, 0.006, 0.006, 0.007, 0.007, 0.008, 0.008, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.007, 0.006, 0.005, 0.004, 0.004, 0.003, 0.003, 0.003, 0.003, 0.002, 0.002, 0.002, 0.002, 0.001,
                0.001, 0.001, 0.001, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        
        Weight_f = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                0.0084, 0.0167, 0.0251, 0.0335, 0.0419, 0.0502, 0.0586, 0.0744, 0.0947, 0.1189, 0.1897, 0.2857, 0.3403, 0.3878, 0.436, 0.4954, 0.5805, 0.6598, 0.752, 0.8043, 0.8552, 0.9118, 0.9367, 0.9523, 0.9627, 0.9661, 0.9695, 0.9729, 0.9763, 0.9797, 0.983, 0.9864, 0.9898, 0.9932, 0.9966,
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        
        qUP94_f = [0.000571, 0.000372, 0.000278, 0.000208, 0.000188, 0.000176, 0.000165, 0.000147, 0.00014, 0.000141, 0.000148, 0.000159, 0.000177, 0.000203, 0.000233, 0.000261, 0.000281, 0.000293, 0.000301, 0.000305, 0.000308, 0.000311, 0.000313, 0.000313, 0.000313, 0.000316, 0.000324, 0.000338, 0.000356, 0.000377, 0.000401, 0.000427, 0.000454, 0.000482, 0.000514, 0.00055, 0.000593, 0.000643, 0.000701, 0.000763, 0.000826, 0.000888, 0.000943, 0.000992, 0.001046, 0.001111, 0.001196, 0.001297, 0.001408,
                0.001536, 0.001686, 0.001864, 0.002051, 0.002241, 0.002466, 0.002755, 0.003139, 0.003612, 0.004154, 0.004773, 0.005476, 0.006271, 0.007179, 0.008194, 0.009286, 0.010423, 0.011574, 0.012648, 0.013665, 0.014763, 0.016079, 0.017748, 0.019724, 0.021915, 0.024393, 0.027231, 0.030501, 0.034115, 0.038024, 0.042361, 0.04726, 0.052853, 0.058986, 0.065569, 0.072836, 0.081018, 0.090348, 0.100882, 0.112467, 0.125016, 0.138442, 0.15266, 0.167668, 0.183524, 0.200229, 0.217783, 0.236188, 0.255605,
                0.276035, 0.297233, 0.318956, 0.34096, 0.364586, 0.389996, 0.41518, 0.438126, 0.456824, 0.471493, 0.483473, 0.492436, 0.498054, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1];
        
        qGam83_f = [0, 0, 0, 0, 0.000171, 0.00014 , 0.000118, 0.000104, 0.000097, 0.000096, 0.000104, 0.000113, 0.000121, 0.000131, 0.00014 , 0.000149, 0.000159, 0.000168, 0.000179, 0.000189, 0.000201, 0.000212, 0.000225, 0.000238, 0.000253, 0.000268, 0.000283, 0.000301, 0.00032 , 0.000342, 0.000364, 0.000388, 0.000414, 0.000443, 0.000476, 0.000502, 0.000535, 0.000573, 0.000617, 0.000665, 0.000716, 0.000775, 0.000841, 0.000919, 0.00101 , 0.001117, 0.001237, 0.001366, 0.001505,
                0.001647, 0.001793, 0.001948, 0.002119, 0.002315, 0.002541, 0.002803, 0.003103, 0.003442, 0.003821, 0.004241, 0.004702, 0.00521 , 0.005769, 0.006385, 0.007064, 0.007817, 0.008681, 0.009702, 0.010921, 0.012385, 0.014128, 0.016159, 0.018481, 0.021091, 0.023992, 0.027184, 0.030672, 0.034459, 0.038549, 0.042945, 0.047655, 0.052691, 0.058071, 0.063807, 0.069918, 0.07657 , 0.08387 , 0.091935, 0.101354, 0.11175 , 0.123076, 0.13563 , 0.149577, 0.165103, 0.182419, 0.201757, 0.222043, 0.243899,
                0.268185, 0.295187, 0.325225, 0.358897, 0.395842, 0.43836 , 0.487816, 0.545886, 0.614309, 0.694884, 0.789474, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        
    };
    
    this.FillPPAGenerational = function(NAnnuitant_employee,Annuitant_employee,NAnnuitant_spouse,Annuitant_spouse,AA_employee,AA_spouse,mortProjection,ARA,spouseARA,age,spouseAge,output_employee,output_spouse) {
        for(x = 0; x < 120; x++)
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
      var x = 0,y = 0,z = 0;    //counters for something
      var spouseARA = 0;
      var minJSq, maxJSq; //joint mortality table min and max
      var a_ee = 0, a_sp = 0, a_eesp = 0;
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
      var interest = [];
      var pvCertainPeriod = 0;
      var monthlyRate = 0;
      var CountRates = 0;
      var Startage = 0; //'for mortality table
      var EndAge;       //'for mortality table
      var v = [];       //'interest discount for forward rates
      var COLAincrease = [];

      //Input validation
      
      if(rateStructure.localeCompare("spot",{ignorePunctuation:true}) === 0) 
      {
        rateStructure = "spot";
      }
      else if(rateStructure.localeCompare("forward",{ignorePunctuation:true}) === 0) 
      {
        rateStructure = "forward";
      }
      else if(rateStructure.localeCompare("pbgcls",{ignorePunctuation:true}) === 0) 
      {
        rateStructure = "pbgcls";
      }
      else
      {
         console.log("incorrect rateStructure");
         return zValue;
      }
        
      if(sex.localeCompare("m",{ignorePunctuation:true}) === 0 || sex.localeCompare("male",{ignorePunctuation:true}) === 0)
      {
          sex = "m";
      }
      else
      {
          sex = "f";
      }
        
      if(ARA < age) 
      {
        certainPeriod = Math.max(certainPeriod - age + ARA, 0);
        tempPeriod = Math.max(tempPeriod - age + ARA, 0);
        ARA = age;
      }

      //Set mortality table start age and end age
      if(mortName == "ownstatic" || mortName == "owngenerational") 
      {
        //TODO may need to make this a parameter now.
        Startage = Math.trunc(mortTable[0][0]);
        EndAge = Math.trunc(Math.min(mortTable.length + Startage - 1, 120));
      }
      else 
      {
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
      
      if(tempPeriod < 0.1)
      {
            //Calculates up to EndAge
            tempPeriod = 500;
      }
      //Setup spouse information
      if(spouseAge < 1) 
      {
        spouseAge = age;
        spouseARA = ARA;
        pctEE = 1;
        pctBoth = 1;
        pctSpouse = 0;
      }
      else 
      {
        spouseARA = ARA - age + spouseAge;
      }
      p_sp[spouseAge] = 1;

      //Set up interest array
      for(x = 0; x < age - 1; x++) 
      {
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
      
      switch(rateStructure) 
      {
      case "spot":
        numRates = rates.length;
        if(numRates == 3) 
        {
          for(x = age; x < age + 4; x++) 
          {
            interest[x] = rates[0];
          }

          for(x = age + 5; x < age + 19; x++)
          {
            interest[x] = rates[1];
          }

          for(x = age + 20; x < 200; x++)
          {
            interest[x] = rates[2];
          }
        }
        else 
        {
          for(x = age; x < age + numRates - 1; x++) 
          {
            interest[x] = rates[x - age + 1];
          }
          for(x = age + numRates - 1; x < 200; x++) 
          {
            interest[x] = rates[numRates - 1];
          }
        }
      break;
      case "forward":
      var invalidRates = false;
        if(rates.length > 1) 
        {
          z = 0;
          for(y = 0; y < rates.length; y++) 
          {
            for(x = age + z; x < age + rates[y][0] - 1; x++) 
            {
              interest[x] = rates[y][1];
            }
            z = rates[y][0];
          }
        }
        if(invalidRates) 
        {
          z = 0;
          for(y = 0; y < rates.length; y+=2) 
          {
            for(x = age + z; x < age + rates[y] - 1; x++) 
            {
              interest[x] = rates[y+1];
            }
            z = rates[y];
          }
        }
      break;
      case "pbgcls":
      for(x = ARA; x < 200; x++) 
      {
        interest[x] = rates[0];
      }
      for(x = ARA - 1; x > Math.max(ARA-7,age); x--)
      {
        interest[x] = rates[1];
      }
      for(x= ARA - 8; x > Math.max(ARA - 15,age); x--) 
      {
        interest[x] = rates[2];
      }
      for(x = ARA - 16; x > Math.max(ARA - 120,age); x--) 
      {
        interest[x] = rates[3];
      }
      break;
      }//END INTEREST ARRAY WORK
      
      //Check for COLAWork
      var doCOLAWork = true;
      if(COLAStartAge < 1) 
      { 
        for(x = 0; x < 500; x++) 
        {
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
        if(COLApct === 0) 
        {
            for(x = COLAStartAge; x < 500; x++)
            {
                COLAincrease[x] = 1;
            }
        }
        else
        {
            if(!Array.isArray(COLApct))
            {
                for(x = COLAStartAge; x < 500; x++)
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
      
      service_.PopulateMortalityTableMale(qn_m,qa_m,AA_m,Weight_m,qUP94_m,qGar94,qGam83_m);
      service_.PopulateMortalityTableFemale(qn_f,qa_f,AA_f,Weight_f,qUP94_f,qGam83_f);
      //MORTALITY TABLE WORK
      switch(mortName)
      {
      case "ownstatic":
        if(sex == "m")
        {
            service_.FillOwnStaticTable(q_ee,q_sp,mortProjection,mortTable,mortTableLength,ARA,spouseARA,Startage,EndAge);
        }
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
      case "ppasmall":
      case "ppastaticls":
      case "ppastatic":
      case "ppagenerational":
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
      }  //END SWITCH STATEMENT
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
                pvCertainPeriod = pvCertainPeriod + (Math.pow((1 + interest[x]),(age - x)) * ((( 1 - 1 / Math.pow(1+monthlyRate,12)) / monthlyRate / 12) * ( 1 + monthlyRate))) * p_ee[ARA] * COLAincrease[x];
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
                pvCertainPeriod = pvCertainPeriod + (v[x] * ((( 1 - 1 / Math.pow(1+monthlyRate,12)) / monthlyRate / 12) * ( 1 + monthlyRate))) * p_ee[ARA] * COLAincrease[x];
            }
        break;
      } //DISCOUNT ADJUST SWITCH END
    
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
