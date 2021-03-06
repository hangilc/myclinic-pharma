"use strict";

var hogan = require("hogan.js");
var task = require("./task");
var service = require("./pharma-service");
var kanjidate = require("kanjidate");
var moment = require("moment");
var util = require("./util");
var patientListTmplSrc = require("raw!./patient-list.html");
var patientListTmpl = hogan.compile(patientListTmplSrc);
var packagingPatientTmplSrc = require("raw!./packaging-patient.html");
var packagingPatientTmpl = hogan.compile(packagingPatientTmplSrc);
var drugListTmplSrc = require("raw!./drug-list.html");
var drugListTmpl = hogan.compile(drugListTmplSrc);
var printUtil = require("./print-util");
var common = require("./common");

// Helpers //////////////////////////////////////////////////////////////////////////////

function getPrescPrinterSetting(){
	var key = common.prescPrinterSettingKey;
	return printUtil.getSetting(key);	
}

function getDrugbagPrinterSetting(){
	var key = common.drugbagPrinterSettingKey;
	return printUtil.getSetting(key);	
}

function getTechouPrinterSetting(){
	var key = common.techouPrinterSettingKey;
	return printUtil.getSetting(key);	
}

/////////////////////////////////////////////////////////////////////////////////////////

var ctx = {
	currentVisitId: 0
};

exports.open = function(visitId){
	ctx.currentVisitId = visitId;
	fetchData(visitId, function(err, data){
		if( err ){
			alert(err);
			return;
		}
		var html = packagingPatientTmpl.render(data);
		document.getElementById("packaging_box").style.display = "block";
		document.getElementById("packaging-patient-wrapper").innerHTML = html;
		var index = 1;
		var drugs = data.drugs;
		drugs.forEach(function(drug){
			drug.index = index++;
			drug.rep = util.drugRep(drug);
		})
		html = drugListTmpl.render({list: drugs});
		document.getElementById("drug_list").innerHTML = html;
	})
}

function fetchData(visitId, cb){
	var visit, patient, drugs;
	task.run([
		function(done){
			service.getVisit(visitId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				visit = result;
				done();
			})
		},
		function(done){
			service.getPatient(visit.patient_id, function(err, result){
				if( err ){
					done(err);
					return;
				}
				patient = result;
				done();
			})
		},
		function(done){
			service.listFullDrugs(visitId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				drugs = result;
				done();
			})
		}
	], function(err){
		if( err ){
			cb(err);
			return;
		}
		var data = {
			last_name: patient.last_name,
			first_name: patient.first_name,
			last_name_yomi: patient.last_name_yomi,
			first_name_yomi: patient.first_name_yomi,
			patient_id: patient.patient_id,
			birthday_rep: makeBirthdayRep(patient.birth_day),
			sex_rep: patient.sex === "M" ? "男" : "女",
			drugs: drugs
		}
		cb(undefined, data);
	});
}

function makeBirthdayRep(birthday){
	if( !birthday || birthday === "0000-00-00" ){
		return "";
	} else {
		var rep = kanjidate.format(kanjidate.f2, birthday);
		var age = moment().diff(moment(birthday), "years");
		rep += " " + age + "才";
		return rep;
	}
}

document.getElementById("drug_list").addEventListener("click", function(event){
	if( event.target.classList.contains("print-drugbag-link") ){
		var drug_id = event.target.getAttribute("data-drug-id");
		window.open("drugbag-preview.html?drug_id=" + drug_id, "_blank", "width=350,height=544");
	}
});

document.getElementById("print-presc-button").addEventListener("click", function(event){
	var visitId = ctx.currentVisitId;
	window.open("presc-preview.html?visit_id=" + visitId, "_blank", "width=600,height=400");
});

document.getElementById("print-all-drugbags-button").addEventListener("click", function(event){
	var visitId = ctx.currentVisitId;
	window.open("drugbag-preview.html?visit_id=" + visitId, "_blank", "width=350,height=544");
});

document.getElementById("print-techou-button").addEventListener("click", function(event){
	var visitId = ctx.currentVisitId;
	window.open("presc-preview.html?mode=techou&visit_id=" + visitId, "_blank", "width=400,height=544");
});

document.getElementById("presc-cancel-button").addEventListener("click", function(event){
	event.preventDefault();
	var evt = new CustomEvent("presc-cancel", { bubbles: true });
	event.target.dispatchEvent(evt);
});

document.getElementById("presc-done-button").addEventListener("click", function(event){
	task.run([
		function(done){
			service.prescDone(ctx.currentVisitId, done);
		}
	], function(err){
		if( err ){
			alert(err);
			return;
		}
		var evt = new CustomEvent("presc-done", { bubbles: true });
		event.target.dispatchEvent(evt);
	})
});

function doClose(){
	ctx.currentVisitId = 0;
	document.getElementById("packaging_box").style.display = "none";
	document.getElementById("packaging-patient-wrapper").innerHTML = "";
	document.getElementById("drug_list").innerHTML = "";
}

document.body.addEventListener("presc-cancel", function(event){
	doClose();
});

document.body.addEventListener("presc-done", function(event){
	doClose();
});

document.getElementById("print-all-button").addEventListener("click", function(event){
	var visitId = ctx.currentVisitId;
	var prescData, drugsData;
	task.run([
		function(done){
			util.fetchPrescData(visitId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				prescData = result;
				done();
			});
		},
		function(done){
			util.fetchAllDrugsData(visitId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				drugsData = result;
				done();
			});
		},
		function(done){
			var prescOps = util.composePrescOps(prescData);
			var setting = getPrescPrinterSetting();
			printUtil.print([prescOps], setting, function(err){
				if( err && err !== "canceled" ){
					alert(err);
				}
				done();
			});
		},
		function(done){
			var pages = drugsData.map(function(data){
				return util.composeDrugBagOps(data);
			});
			var setting = getDrugbagPrinterSetting();
			printUtil.print(pages, setting, function(err){
				if( err && err !== "canceled" ){
					alert(err);
				}
				done();
			});
		},
		function(done){
			var prescOps = util.composeTechouOps(prescData);
			var setting = getTechouPrinterSetting();
			printUtil.print([prescOps], setting, function(err){
				if( err && err !== "canceled" ){
					alert(err);
				}
				done();
			});
		}
	], function(err){
		if( err ){
			alert(err);
			return;
		}
	});
});

document.getElementById("print-all-except-techou-button").addEventListener("click", function(event){
	var visitId = ctx.currentVisitId;
	var prescData, drugsData;
	task.run([
		function(done){
			util.fetchPrescData(visitId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				prescData = result;
				done();
			});
		},
		function(done){
			util.fetchAllDrugsData(visitId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				drugsData = result;
				done();
			});
		},
		function(done){
			var prescOps = util.composePrescOps(prescData);
			var setting = getPrescPrinterSetting();
			printUtil.print([prescOps], setting, function(err){
				if( err && err !== "canceled" ){
					alert(err);
				}
				done();
			});
		},
		function(done){
			var pages = drugsData.map(function(data){
				return util.composeDrugBagOps(data);
			});
			var setting = getDrugbagPrinterSetting();
			printUtil.print(pages, setting, function(err){
				if( err && err !== "canceled" ){
					alert(err);
				}
				done();
			});
		},
	], function(err){
		if( err ){
			alert(err);
			return;
		}
	});
});

