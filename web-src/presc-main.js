"use strict";

var service = require("./pharma-service");
var task = require("./task");
var PrescContent = require("myclinic-drawer-forms").PrescContent;
var DrawerSVG = require("myclinic-drawer-svg");
var kanjidate = require("kanjidate");
var util = require("./util");
var printUtil = require("./print-util");
var common = require("./common");

// Helpers /////////////////////////////////////////////////////////////////////////////

function getPrescPrinterSetting(){
	var key = common.prescPrinterSettingKey;
	return printUtil.getSetting(key);
}

function getTechouPrinterSetting(){
	var key = common.techouPrinterSettingKey;
	return printUtil.getSetting(key);
}

////////////////////////////////////////////////////////////////////////////////////////

(function(){
	var match = location.search.match(/visit_id=(\d+)/);
	if( !match ){
		alert("cannot find visit_id");
		return;
	}
	var isTechou = location.search.indexOf("mode=techou") >= 0;
	start(+match[1], isTechou);
})();

function start(visitId, isTechou){
	document.title = isTechou ? "お薬手帳" : "処方内容"
	fetchData(visitId, function(err, result){
		if( err ){
			alert(err);
			return;
		}
		var drugs = result.drugs.map(function(drug){
			return util.drugRep(drug);
		})
		var data = {
			name: result.name,
			at: kanjidate.format(kanjidate.f2, result.at),
			drugs: drugs,
			clinic: result.config.presc.clinic
		}
		var option = {};
		if( isTechou ){
			option = {
	            fontSize: 3.2,
	            inset: 4,
	            width: 99
	        };
		}
		var ops = PrescContent.getOps(data, option);
	    var svg = DrawerSVG.drawerToSvg(ops, {width: "148mm", height: "210mm", viewBox: "0 0 148 210"});
	    document.getElementById("preview-area").appendChild(svg);
	    bindPrintButton(ops, isTechou);
	})
}

function fetchData(visitId, cb){
	var visit, patient, drugs, config;
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
		},
		function(done){
			util.request("config", {}, "GET", 3000, function(err, result){
				if( err ){
					done(err);
					return;
				}
				config = result;
				done();
			})
		}
	], function(err){
		if( err ){
			alert(err);
			return;
		}
        var data = {
            name: patient.last_name + " " + patient.first_name,
            at: visit.v_datetime,
            drugs: drugs,
            config: config
        };
		cb(undefined, data);
	})
}

function bindPrintButton(ops, isTechou){
	var setting;
	if( isTechou ){
		setting = getTechouPrinterSetting();
	} else {
		setting = getPrescPrinterSetting();
	}
	document.getElementById("print-button").addEventListener("click", function(event){
		printUtil.print([ops], setting, function(err){
			if( err && err !== "canceled" ){
				alert(err);
			}
			window.close();
		})
	})
}
