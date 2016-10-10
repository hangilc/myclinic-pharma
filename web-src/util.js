"use strict";

var mConsts = require("myclinic-consts");
var conti = require("conti");
var service = require("./pharma-service");
var PrescContent = require("myclinic-drawer-forms").PrescContent;
var kanjidate = require("kanjidate");

exports.drugRep = function(drug){
	var category = parseInt(drug.d_category, 10);
	switch(category){
		case mConsts.DrugCategoryNaifuku:
			return drug.name + " " + drug.d_amount + drug.unit + " " + drug.d_usage + 
				" " + drug.d_days + "日分";
		case mConsts.DrugCategoryTonpuku:
			return drug.name + " １回 " + drug.d_amount + drug.unit + " " + drug.d_usage +
				" " + drug.d_days + "回分";
		case mConsts.DrugCategoryGaiyou:
			return drug.name + " " + drug.d_amount + drug.unit + " " + drug.d_usage;
		default:
			return drug.name + " " + drug.d_amount + drug.unit;
	}
};

exports.request = function(url, data, method, timeout, cb){
	data = data || {};
	method = method || "GET";
	var searchParams = new URLSearchParams();
	var opt = {
		method: method,
		headers: {}
	};
	if( method === "GET" ){
		Object.keys(data).forEach(function(key){
			searchParams.append(key, data[key]);
		});
	}
	if( method === "POST" ){
		if( typeof data === "string" ){
			opt.body = data;
		} else {
			opt.body = JSON.stringify(data);
		}
		opt.headers["content-type"] = "application/json";
	}
	var done = false;
	var timer = setTimeout(function(){
		timer = null;
		if( !done ){
			done = true;
			cb("TIMEOUT");
		}
	}, timeout);
	url += "?" + searchParams.toString();
	conti.fetchJson(url, opt, function(err, result){
		if( timer ){
			clearTimeout()
		}
		if( !done ){
			done = true;
			cb(err, result);
		}
	});
};

exports.insertAfter = function(refNode, newNode){
	var parent = refNode.parentNode;
	if( parent.lastChild === refNode ){
		parent.appendChild(newNode);
	} else {
		parent.insertBefore(newNode, refNode.nextSibling);
	}
}

exports.nextElementSibling = function(node){
	var nextSib = node.nextSibling;
	while( nextSib ){
		if( nextSib.nodeType === 1 ){
			return nextSib;
		}
		nextSib = nextSib.nextSibling;
	}
	return null;
};

exports.fetchPrescData = function(visitId, cb){
	var visit, patient, drugs, config;
	conti.exec([
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
			exports.request("config", {}, "GET", 3000, function(err, result){
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
			cb(err);
			return;
		}
		var data = {
            name: patient.last_name + " " + patient.first_name,
			at: kanjidate.format(kanjidate.f2, visit.v_datetime),
			drugs: drugs.map(function(drug){
				return exports.drugRep(drug);
			}),
			clinic: config.presc.clinic
		}
		cb(undefined, data);
	})
};

exports.composePrescOps = function(data){
	return PrescContent.getOps(data, {});
};

exports.composeTechouOps = function(data){
	var option = {
		fontSize: 3.2,
		inset: 4,
		width: 99
	};
	return PrescContent.getOps(data, option);
};
