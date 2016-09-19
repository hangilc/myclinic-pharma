"use strict";

var task = require("./task");
var hogan = require("hogan");
var service = require("./pharma-service");
var mConsts = require("myclinic-consts");
var conti = require("conti");
var kanjidate = require("kanjidate");
var moment = require("moment");
var patientListTmplSrc = require("raw!./patient-list.html");
var patientListTmpl = hogan.compile(patientListTmplSrc);
var packagingPatientTmplSrc = require("raw!./packaging-patient.html");
var packagingPatientTmpl = hogan.compile(packagingPatientTmplSrc);
var drugListTmplSrc = require("raw!./drug-list.html");
var drugListTmpl = hogan.compile(drugListTmplSrc);
var AuxInfo = require("./aux-info");
var util = require("./util");
var DrugBagData = require("./drugbag-data");

document.getElementById("refresh-button").addEventListener("click", function(event){
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
});

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
		setupPackagingInfo(visitId);
		AuxInfo.open(visitId);
	}
});

document.body.addEventListener("click", function(event){
	if( event.target.classList.contains("print-drugbag-link") ){
		var drug_id = event.target.getAttribute("data-drug-id");
		var base = location.pathname;
		if( base[base.length-1] !== "/" ){
			base += "/";
		}
		window.open(base + "drugbag-preview.html?drug_id=" + drug_id, "_blank", "width=350,height=544");
	}
})

function setupPackagingInfo(visitId){
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
			service.listDrugs(visitId, function(err, result){
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
		var data = {
			last_name: patient.last_name,
			first_naem: patient.first_name,
			last_name_yomi: patient.last_name_yomi,
			first_name_yomi: patient.first_name_yomi,
			patient_id: patient.patient_id,
			birthday_rep: makeBirthdayRep(patient.birth_day),
			sex_rep: patient.sex === "M" ? "男" : "女"
		}
		var html = packagingPatientTmpl.render(data);
		document.getElementById("packaging_box").style.display = "block";
		document.getElementById("packaging-patient-wrapper").innerHTML = html;
		var index = 1;
		drugs.forEach(function(drug){
			drug.index = index++;
			drug.rep = util.drugRep(drug);
		})
		html = drugListTmpl.render({list: drugs});
		document.getElementById("drug_list").innerHTML = html;
	})	
}

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

