"use strict";

var task = require("./task");
var hogan = require("hogan");
var service = require("./pharma-service");
var mConsts = require("myclinic-consts");
var conti = require("conti");
var kanjidate = require("kanjidate");
var moment = require("moment");
var PackagingPatient = require("./packaging-patient");
var AuxInfo = require("./aux-info");
require("./prev-techou");
var util = require("./util");
var patientListTmplSrc = require("raw!./patient-list.html");
var patientListTmpl = hogan.compile(patientListTmplSrc);

document.getElementById("refresh-button").addEventListener("click", function(event){
	doRefresh();
});

function doRefresh(){
	var resultList;
	var includeAllPatientsChecked = includeAllPatients();
	var loader = includeAllPatients() ? service.listTodaysVisits : service.listPharmaQueue;
	task.run(function(done){
		loader(function(err, result){
			if( err ){
				done(err);
				return;
			}
			resultList = result;
			done();
		});
	}, function(err){
		if( err ){
			alert(err);
			return;
		}
		resultList.forEach(function(item){
			item["class"] = wqueueStateToClass(item.wait_state);
		})
		var html = patientListTmpl.render({list: resultList});
		document.querySelector(".pqueue tbody").innerHTML = html;
	});
}

document.body.addEventListener("click", function(event){
	if( event.target.classList.contains("pqueue-item") ){
		document.querySelectorAll(".pqueue-item").forEach(function(item){
			if( event.target === item ){
				item.classList.add("selected");
			} else {
				item.classList.remove("selected");
			}
		})
	}
});

document.getElementById("start-chouzai-button").addEventListener("click", function(event){
	var item = getSelectedPatientListItem();
	if( item !== null ){
		var visitId = item.getAttribute("data-visit-id");
		PackagingPatient.open(visitId);
		AuxInfo.open(visitId);
	}
});

function wqueueStateToClass(state){
	switch(state){
		case mConsts.WqueueStateWaitCashier: return "wait_cashier";
		case mConsts.WqueueStateWaitDrug: return "wait_drug";
		default: return "other";
	}
}

function includeAllPatients(){
	return document.querySelector("input[name=include-all-patients]").checked;
}

function getSelectedPatientListItem(){
	return document.querySelector(".pqueue-item.selected");
}

document.getElementById("blank-naifuku-button").addEventListener("click", function(event){
	event.preventDefault();
	window.open("drugbag-preview.html?blank=naifuku", "_blank", "width=350,height=544");
});

document.getElementById("blank-tonpuku-button").addEventListener("click", function(event){
	event.preventDefault();
	window.open("drugbag-preview.html?blank=tonpuku", "_blank", "width=350,height=544");
});

document.getElementById("blank-gaiyou-button").addEventListener("click", function(event){
	event.preventDefault();
	window.open("drugbag-preview.html?blank=gaiyou", "_blank", "width=350,height=544");
});

document.getElementById("blank-other-drugbag-button").addEventListener("click", function(event){
	event.preventDefault();
	window.open("drugbag-preview.html?blank=other", "_blank", "width=350,height=544");
});

document.body.addEventListener("presc-cancel", function(event){
	document.getElementById("patient-list").querySelector(".selected").classList.remove("selected");
});

document.body.addEventListener("presc-done", function(event){
	document.getElementById("patient-list").querySelector(".selected").classList.remove("selected");
})

