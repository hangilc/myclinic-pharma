"use strict";

var task = require("./task");
var service = require("./pharma-service");
var VisitsNav = require("./visits-nav");
var hogan = require("hogan");
var visitsBoxTmplSrc = require("raw!./visits-box.html");
var visitsBoxTmpl = hogan.compile(visitsBoxTmplSrc);
var kanjidate = require("kanjidate");
var util = require("./util");
var submenuByDrugTmplSrc = require("raw!./submenu-by-drug.html");
var submenuByDrugTmpl = hogan.compile(submenuByDrugTmplSrc);

var wrapper = document.getElementById("aux-info");

var ctx = {
	visitId: 0,
	patientId: 0,
	byDate: {
		current: 0,
		nPages: 0
	}
}

exports.open = function(visitId){
	ctx.visitId = visitId;
	openAuxInfo(visitId);
}

function openAuxInfo(visitId){
	wrapper.querySelector(".control-box form input[name=mode][value=by-date]").checked = true;
	var visit, patient, nVisits;
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
			service.calcVisits(patient.patient_id, function(err, result){
				if( err ){
					done(err);
					return;
				}
				nVisits = result;
				done();
			})
		}
	], function(err){
		if( err ){
			alert(err);
			return;
		}
		ctx.patientId = patient.patient_id;
		VisitsNav.setup(document.getElementById("control-box-submenu"), patient.patient_id, nVisits);
		wrapper.style.display = "block";
	});
}

document.getElementById("aux-info").addEventListener("updatevisits", function(event){
	var visits = event.detail;
	var index = 1;
	var list = visits.map(function(visit){
		return {
			dateRep: kanjidate.format(kanjidate.f4, visit.v_datetime),
			texts: visit.texts.map(function(text){
				return text.content.replace(/\n/g, "<br />\n")
			}),
			drugs: visit.drugs.map(function(drug){
				return index + ") " + util.drugRep(drug);
			})
		};
	});
	var html = visitsBoxTmpl.render({list: list});
	document.getElementById("visits-box").innerHTML = html;
});

document.querySelectorAll("#aux-info input[name=mode]").forEach(function(e){
	e.addEventListener("click", function(event){
		var mode = event.target.value;
		if( mode === "by-date" ){
			alert("not implmented yet");
		} else if( mode === "by-drug" ){
			initSubmenuByDrug(ctx.patientId);
		} else {
			alert("unknown mode: " + mode);
			return;
		}
	});
});

function initSubmenuByDrug(patientId){
	var resultList;
	task.run([
		function(done){
			service.listIyakuhinByPatient(patientId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				resultList = result;
				done();
			})
		}
	], function(err){
		if( err ){
			alert(err);
			return;
		}
		var html = submenuByDrugTmpl.render({list: resultList});
		wrapper.querySelector("#control-box-submenu").innerHTML = html;
		wrapper.querySelector("#visits-box").innerHTML = "";
	})
}


