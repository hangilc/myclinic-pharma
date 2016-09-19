"use strict";

var service = require("./pharma-service");
var task = require("./task");

(function(){
	var match = location.search.match(/visit_id=(\d+)/);
	if( !match ){
		alert("cannot find visit_id");
		return;
	}
	start(+match[1]);
})();

function start(visitId){
	fetchData(visitId, function(err, result){
		if( err ){
			alert(err);
			return;
		}
		console.log(result);
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
            name: patient.last_name + patient.first_name,
            at: visit.v_datetime,
            drugs: drugs
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