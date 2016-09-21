"use strict";

var service = require("./pharma-service");
var task = require("./task");
var PrescContent = require("myclinic-drawer-forms").PrescContent;
var DrawerSVG = require("myclinic-drawer-svg");
var kanjidate = require("kanjidate");
var util = require("./util");

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
		console.log(result);
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

/*
        var visit_id = url.query.visit_id;
        var store = {};
        if( !(visit_id > 0) ){
            return Promise.reject("invalid parameter");
        }
        return db.getVisit(conn, visit_id)
        .then(function(visit){
            store.visit = visit;
            return db.getPatient(conn, visit.patient_id);
        })
        .then(function(patient){
            store.patient = patient;
            return db.listFullDrugs(conn, visit_id);
        })
        .then(function(drugs){
            store.drugs = drugs;
        })
        .then(function(){
            var data = {
                name: store.patient.last_name + store.patient.first_name,
                at: store.visit.v_datetime,
                drugs: store.drugs
            };
            return PrescContent.getOps(data);
        })
*/