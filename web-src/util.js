"use strict";

var mConsts = require("myclinic-consts");
var conti = require("conti");

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
}
