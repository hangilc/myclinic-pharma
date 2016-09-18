"use strict";

var hogan = require("hogan");
var tmplSrc = require("raw!./visits-nav.html");
var tmpl = hogan.compile(tmplSrc);
var service = require("./pharma-service");
var task = require("./task");

var visitsPerPage = 5;

exports.setup = function(dom, patientId, nVisits){
	var nPages = calcNumberOfPages(nVisits, visitsPerPage);
	if( nPages > 1 ){
		dom.innerHTML = tmpl.render({
			current: 1,
			total: nPages
		});
	} else {
		dom.innerHTML = "";
	}
	var ctx = {
		dom: dom,
		patientId: patientId,
		current: 1,
		nPages: nPages
	};
	startLoadVisits(dom, patientId, 1);
}

function calcNumberOfPages(total, perPage){
	return Math.floor((total + perPage - 1) / perPage);
}

function startLoadVisits(dom, patientId, page){
	var resultList;
	task.run([
		function(done){
			service.listFullVisits(patientId, (page-1)*visitsPerPage, visitsPerPage, function(err, result){
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
		var evt = new CustomEvent("updatevisits", { detail: resultList, bubbles: true, cancelable: true });
		dom.dispatchEvent(evt);
	})
}