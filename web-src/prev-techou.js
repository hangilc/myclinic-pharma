"use strict";

var task = require("./task");
var service = require("./pharma-service");
var kanjidate = require("kanjidate");
var hogan = require("hogan.js");
var util = require("./util");
var patientInfoTmplSrc = require("raw!./prev-techou-patient.html");
var patientInfoTmpl = hogan.compile(patientInfoTmplSrc);
var visitsTmplSrc = require("raw!./prev-techou-visits.html");
var visitsTmpl = hogan.compile(visitsTmplSrc);
var drugsTmplSrc = require("raw!./prev-techou-drugs.html");
var drugsTmpl = hogan.compile(drugsTmplSrc);

document.querySelector("#previous-techou-wrapper form.search-form").addEventListener("submit", function(event){
	var text = event.target.querySelector("input[type=text]").value;
	if( !text.match(/^\d+$/) ){
		alert("患者番号が適切でありません。");
		return;
	}
	var patientId = +text;
	fetchData(patientId, function(err, data){
		if( err ){
			alert(err);
			return;
		}
		renderPatient(data.patient);
		renderVisits(data.visits);
	})
});

function renderPatient(patient){
	var html = patientInfoTmpl.render(patient);
	document.getElementById("previous-techou-patient").innerHTML = html;
}

function renderVisits(visits){
	var list = visits.map(function(visit){
		return {
			visit_id: visit.visit_id,
			label: kanjidate.format(kanjidate.f1, visit.v_datetime)
		};
	});
	var html = visitsTmpl.render({list: list});
	document.getElementById("previous-techou-visits").innerHTML = html;
}

function fetchData(patientId, cb){
	var patient, visits;
	task.run([
		function(done){
			service.getPatient(patientId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				patient = result;
				done();
			})
		},
		function(done){
			service.listVisits(patientId, 0, 10, function(err, result){
				if( err ){
					done(err);
					return;
				}
				visits = result;
				done();
			})
		}
	], function(err){
		if( err ){
			cb(err);
			return;
		}
		cb(undefined, {
			patient: patient,
			visits: visits
		});
	});
}

document.getElementById("previous-techou-visits").addEventListener("click", function(event){
	var target = event.target;
	if( target.tagName === "A" && target.hasAttribute("data-visit-id") ){
		var nextElement = util.nextElementSibling(target);
		if( nextElement !== null && nextElement.getAttribute("data-kind") === "prev-techou-drugs" ){
			nextElement.parentNode.removeChild(nextElement);
			return;
		}
		var visitId = target.getAttribute("data-visit-id");
		var drugs;
		task.run([
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
				alert(err);
				return;
			}
			var index = 1;
			var list = drugs.map(function(drug){
				return {
					label: util.drugRep(drug),
				}
			});
			var html = drugsTmpl.render({list: list, visit_id: visitId});
			var dom = document.createElement("div");
			dom.setAttribute("data-kind", "prev-techou-drugs");
			dom.innerHTML = html;
			util.insertAfter(event.target, dom);
		})
	}
});

document.getElementById("previous-techou-visits").addEventListener("click", function(event){
	var target = event.target;
	if( target.tagName === "BUTTON" && target.classList.contains("print-prev-techou-button") ){
		var visitId = target.getAttribute("data-visit-id");
		window.open("presc-preview.html?mode=techou&visit_id=" + visitId, "_blank", "width=400,height=544");
	}
});

function doClear(){
	var wrapper = document.getElementById("previous-techou-wrapper");
	wrapper.querySelector("form.search-form input[type=text]").value = "";
	document.getElementById("previous-techou-patient").innerHTML = "";
	document.getElementById("previous-techou-visits").innerHTML = "";
}

document.getElementById("previous-techou-patient").addEventListener("click", function(event){
	var target = event.target;
	if( target.tagName === "BUTTON" && target.classList.contains("end-button") ){
		doClear();
	}
});
