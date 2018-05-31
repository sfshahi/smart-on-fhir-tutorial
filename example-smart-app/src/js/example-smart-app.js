(function(window){
  window.extractData = function() {
    var ret = $.Deferred();

    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    function onReady(smart)  {
      if (smart.hasOwnProperty('patient')) {
        var patient = smart.patient;
        var pt = patient.read();
        var obv = smart.patient.api.fetchAll({
                    type: 'Observation',
                    query: {
                      code: {
                        $or: ['http://loinc.org|8302-2', //height
                              'http://loinc.org|8462-4', //DBP
                              'http://loinc.org|8480-6', //SBP
                              'http://loinc.org|2085-9', //HDL
                              'http://loinc.org|2089-1', //LDL
                              'http://loinc.org|55284-4', //BP
                              'http://loinc.org|3141-9', //weight
                              'http://loinc.org|85353-1', //vitals panel
                              'http://loinc.org|9279-1', //resp rate
                              'http://loinc.org|59408-5', //pulse ox
                              'http://loinc.org|8867-4', //HR
                              'http://loinc.org|8310-5', //temp
                              'http://loinc.org|2951-2', //sodium
                              'http://loinc.org|2823-3', //potassium
                              'http://loinc.org|2075-0', //chloride
                              'http://loinc.org|2028-9', //CO2
                              'http://loinc.org|33037-3', //anion gap
                              'http://loinc.org|2345-7', //glucose
                              'http://loinc.org|3094-0', //BUN
                              'http://loinc.org|2160-0', //Creatinine
                              'http://loinc.org|17861-6', //Calcium
                              'http://loinc.org|2885-2', //Protein
                              'http://loinc.org|1751-7', //Albumin
                              'http://loinc.org|1975-2', //Total bili
                              'http://loinc.org|6768-6', //Alk P
                              'http://loinc.org|1742-6', //ALT
                              'http://loinc.org|1920-8', //AST
                              'http://loinc.org|2744-1', //ABG ph
                              'http://loinc.org|2019-8', //ABG pCO2
                              'http://loinc.org|2703-7', //ABG pO2
                              'http://loinc.org|2746-6', //VBG ph
                              'http://loinc.org|2021-4', //VBG pCO2
                              'http://loinc.org|2705-2', //VBG pO2
                              'http://loinc.org|6690-2', //WBC
                              'http://loinc.org|718-7', //Hgb
                              'http://loinc.org|4544-3', //Hct
                              'http://loinc.org|777-3', //Plts
                             ]
                      }
                    }
                  });

        $.when(pt, obv).fail(onError);

        $.when(pt, obv).done(function(patient, obv) {
          var byCodes = smart.byCodes(obv, 'code');
          var gender = patient.gender;
          var dob = new Date(patient.birthDate);
          var day = dob.getDate();
          var monthIndex = dob.getMonth() + 1;
          var year = dob.getFullYear();

          var dobStr = monthIndex + '/' + day + '/' + year;
          var fname = '';
          var lname = '';

          if (typeof patient.name[0] !== 'undefined') {
            fname = patient.name[0].given.join(' ');
            lname = patient.name[0].family.join(' ');
          }

          var height = byCodes('8302-2');
          var weight = byCodes('3141-9');
          var systolicbp = getBloodPressureValue(byCodes('55284-4'),'8480-6');
          var diastolicbp = getBloodPressureValue(byCodes('55284-4'),'8462-4');
          var vitalspanel = byCodes('85353-1');
          var heartrate = byCodes('8867-4');
          var resprate = byCodes('9279-1');
          var pulseox = byCodes('59408-5');
          var temp = byCodes('8310-5');
          //var gcs = byCodes('9269-2');
          
          //CMP
          var sodium = byCodes('2951-2');
          var potassium = byCodes('2823-3');
          var chloride = byCodes('2075-0');
          var co2 = byCodes('2028-9');
          var bun = byCodes('3094-0');
          var creatinine = byCodes('2160-0');
          var glucose = byCodes('2345-7');
          var calcium = byCodes('17861-6');
          var protein = byCodes('2885-2');
          var albumin = byCodes('1751-7')
          var bili = byCodes('1975-2');
          var alkp = byCodes('6768-6');
          var alt = byCodes('1742-6');
          var ast = byCodes('1920-8');
          var anion = byCodes('33037-3');
          
          //Lipids
          var hdl = byCodes('2085-9');
          var ldl = byCodes('2089-1');

          //ABG
          var ph_abg = byCodes('2744-1');
          var pCO2_abg = byCodes('2019-8');
          var pO2_abg = byCodes('2703-7');
                                
          //VBG
          var ph_vbg = byCodes('2746-6');
          var pCO2_vbg = byCodes('2021-4');
          var pO2_vbg = byCodes('2705-2');
          
          //CBC
          var wbc = byCodes('6690-2');
          var hgb = byCodes('718-7');
          var hct = byCodes('4544-3');
          var plts = byCodes('777-3');
          
          var p = defaultPatient();
          p.birthdate = dobStr;
          p.gender = gender;
          p.fname = fname;
          p.lname = lname;
          p.age = parseInt(calculateAge(dob));
          p.height = getQuantityValueAndUnit(height[0]);
          p.weight = getQuantityValueAndUnit(weight[0]);
          p.vitalspanel = getQuantityValueAndUnit(vitalspanel[0]);
          p.heartrate = getQuantityValueAndUnit(heartrate[0]);
          p.resprate = getQuantityValueAndUnit(resprate[0]);
          p.pulseox = getQuantityValueAndUnit(pulseox[0]);
          p.temp = getQuantityValueAndUnit(temp[0]);
          //p.gcs = getQuantityValueAndUnit(gcs[0]);
          
          if (typeof systolicbp != 'undefined')  {
            p.systolicbp = systolicbp;
          }

          if (typeof diastolicbp != 'undefined') {
            p.diastolicbp = diastolicbp;
          }

          //CMP
          p.sodium = getQuantityValueAndUnit(sodium[0]);
          p.potassium = getQuantityValueAndUnit(potassium[0]);
          p.chloride = getQuantityValueAndUnit(chloride[0]);
          p.co2 = getQuantityValueAndUnit(co2[0]);
          p.bun = getQuantityValueAndUnit(creatinine[0]);
          p.glucose = getQuantityValueAndUnit(glucose[0]);
          p.calcium = getQuantityValueAndUnit(calcium[0]);
          p.protein = getQuantityValueAndUnit(protein[0]);
          p.albumin = getQuantityValueAndUnit(albumin[0]);
          p.bili = getQuantityValueAndUnit(bili[0]);
          p.alkp = getQuantityValueAndUnit(alkp[0]);
          p.alt = getQuantityValueAndUnit(alt[0]);
          p.ast = getQuantityValueAndUnit(ast[0]);
          p.anion = getQuantityValueAndUnit(anion[0]);
          
          //Lipid Panel
          p.hdl = getQuantityValueAndUnit(hdl[0]);
          p.ldl = getQuantityValueAndUnit(ldl[0]);

          //ABG
          p.ph_abg = getQuantityValueAndUnit(ph_abg[0]);
          p.pCO2_abg = getQuantityValueAndUnit(pCO2_abg[0]);
          p.pO2_abg = getQuantityValueAndUnit(pO2_abg[0]);
          
          //VBG
          p.ph_vbg = getQuantityValueAndUnit(ph_vbg[0]);
          p.pCO2_vbg = getQuantityValueAndUnit(pCO2_vbg[0]);
          p.pO2_vbg = getQuantityValueAndUnit(pO2_vbg[0]);
          
          //CBC
          p.wbc = getQuantityValueAndUnit(wbc[0]);
          p.hbg = getQuantityValueAndUnit(hgb[0]);
          p.hct = getQuantityValueAndUnit(hct[0]);
          p.plts = getQuantityValueAndUnit(plts[0]);
          
          ret.resolve(p);
        });
      } else {
        onError();
      }
    }

    FHIR.oauth2.ready(onReady, onError);
    return ret.promise();

  };

  function defaultPatient(){
    return {
      fname: {value: ''},
      lname: {value: ''},
      gender: {value: ''},
      birthdate: {value: ''},
      age: {value: ''},
      height: {value: ''},
      weight: {value: ''},
      systolicbp: {value: ''},
      diastolicbp: {value: ''},
      vitalspanel: {value: ''},
      heartrate: {value: ''},
      resprate: {value: ''},
      pulseox: {value: ''},
      temp: {value: ''},
      //gcs: {value: ''},
      sodium: {value: ''},
      potassium: {value: ''},
      chloride: {value: ''},
      co2: {value: ''},
      bun: {value: ''},
      glucose: {value: ''},
      calcium: {value: ''},
      protein: {value: ''},
      albumin: {value: ''},
      bili: {value: ''},
      alkp: {value: ''},
      alt: {value: ''},
      ast: {value: ''},
      anion: {value: ''},
      ldl: {value: ''},
      hdl: {value: ''},
      ph_abg: {value: ''},
      pCO2_abg: {value: ''},
      pO2_abg: {value: ''},
      ph_vbg: {value: ''},
      pCO2_vbg: {value: ''},
      pO2_vbg: {value: ''},
      wbc: {value: ''},
      hgb: {value: ''},
      hct: {value: ''},
      plts: {value: ''},
    };
  }

  function getBloodPressureValue(BPObservations, typeOfPressure) {
    var formattedBPObservations = [];
    BPObservations.forEach(function(observation){
      var BP = observation.component.find(function(component){
        return component.code.coding.find(function(coding) {
          return coding.code == typeOfPressure;
        });
      });
      if (BP) {
        observation.valueQuantity = BP.valueQuantity;
        formattedBPObservations.push(observation);
      }
    });

    return getQuantityValueAndUnit(formattedBPObservations[0]);
  }

  function isLeapYear(year) {
    return new Date(year, 1, 29).getMonth() === 1;
  }

  function calculateAge(date) {
    if (Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime())) {
      var d = new Date(date), now = new Date();
      var years = now.getFullYear() - d.getFullYear();
      d.setFullYear(d.getFullYear() + years);
      if (d > now) {
        years--;
        d.setFullYear(d.getFullYear() - 1);
      }
      var days = (now.getTime() - d.getTime()) / (3600 * 24 * 1000);
      return years + days / (isLeapYear(now.getFullYear()) ? 366 : 365);
    }
    else {
      return undefined;
    }
  }

  function getQuantityValueAndUnit(ob) {
    if (typeof ob != 'undefined' &&
        typeof ob.valueQuantity != 'undefined' &&
        typeof ob.valueQuantity.value != 'undefined' &&
        typeof ob.valueQuantity.unit != 'undefined') {
          return ob.valueQuantity.value + ' ' + ob.valueQuantity.unit;
    } 
    else if (typeof ob != 'undefined' &&
        typeof ob.valueQuantity != 'undefined' &&
        typeof ob.valueQuantity.value != 'undefined') {
          return ob.valueQuantity.value;
    } 
    else {
      return undefined;
    }
  }

  window.drawVisualization = function(p) {
    $('#holder').show();
    $('#loading').hide();
    $('#fname').html(p.fname);
    $('#lname').html(p.lname);
    $('#gender').html(p.gender);
    $('#birthdate').html(p.birthdate);
    $('#age').html(p.age);
    $('#height').html(p.height);
    $('#weight').html(p.weight);
    $('#systolicbp').html(p.systolicbp);
    $('#diastolicbp').html(p.diastolicbp);
    $('#vitalspanel').html(p.vitalspanel);
    $('#heartrate').html(p.heartrate);
    $('#resprate').html(p.resprate);
    $('#pulseox').html(p.pulseox);
    $('#temp').html(p.temp);
    //$('#gcs').html(p.gcs);
    
    //CMP
    $('#sodium').html(p.sodium);
    $('#potassium').html(p.potassium);
    $('#chloride').html(p.chloride);
    $('#co2').html(p.co2);
    $('#bun').html(p.bun);
    $('glucose').html(p.glucose);
    $('calcium').html(p.calcium);
    $('protein').html(p.protein);
    $('albumin').html(p.albumin);
    $('bili').html(p.bili);
    $('alkp').html(p.alkp);
    $('alt').html(p.alt);
    $('ast').html(p.ast);
    $('anion').html(p.anion);
    
    //Lipid
    $('#ldl').html(p.ldl);
    $('#hdl').html(p.hdl);
    
    //ABG
    $('#ph_abg').html(p.ph_abg);
    $('#pCO2_abg').html(p.pCO2_abg);
    $('#pO2_abg').html(p.pO2_abg);
    
    //VBG
    $('#ph_vbg').html(p.ph_vbg);
    $('#pCO2_vbg').html(p.pCO2_vbg);
    $('#pO2_vbg').html(p.pO2_vbg);
    
    //CBC
    $('#wbc').html(p.wbc);
    $('#hgb').html(p.hgb);
    $('#hct').html(p.hct);
    $('#plts').html(p.plts);
  };

})(window);
