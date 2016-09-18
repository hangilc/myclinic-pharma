"use strict";

var hogan = require("hogan");
var tmplSrc = require("raw!./visits-nav.html");
var tmpl = hogan.compile(tmplSrc);
var service = require("./pharma-service");
var task = require("./task");

var visitsPerPage = 5;

exports.setup = function(dom, patientId, nVisits){
	var nPages = calcNumberOfPages(nVisits, visitsPerPage);
	var ctx = {
		patientId: patientId,
		current: 1,
		nPages: nPages
	};
	initDisp(dom, ctx);
	startLoadVisits(dom, patientId, 1);
	bindFirst(dom, ctx);
	bindPrev(dom, ctx);
	bindNext(dom, ctx);
	bindLast(dom, ctx);
}

function calcNumberOfPages(total, perPage){
	return Math.floor((total + perPage - 1) / perPage);
}

function initDisp(dom, ctx){
	if( ctx.nPages > 1 ){
		dom.innerHTML = tmpl.render({
			current: ctx.current,
			total: ctx.nPages
		});
	} else {
		dom.innerHTML = "";
	}
}

function updateDisp(dom, ctx){
	var span = dom.querySelector(".visits-nav-current");
	if( span ){
		span.innerHTML = ctx.current;
	}
}

function bindFirst(dom, ctx){
	dom.querySelector(".visits-nav-first").addEventListener("click", function(event){
		event.preventDefault();
		event.stopPropagation();
		if( ctx.current > 1 ){
			ctx.current = 1;
			updateDisp(dom, ctx);
			startLoadVisits(dom, ctx.patientId, ctx.current);
		}
	});
}

function bindPrev(dom, ctx){
	dom.querySelector(".visits-nav-prev").addEventListener("click", function(event){
		event.preventDefault();
		event.stopPropagation();
		if( ctx.current > 1 ){
			ctx.current -= 1;
			updateDisp(dom, ctx);
			startLoadVisits(dom, ctx.patientId, ctx.current);
		}
	});
}

function bindNext(dom, ctx){
	dom.querySelector(".visits-nav-next").addEventListener("click", function(event){
		event.preventDefault();
		event.stopPropagation();
		if( ctx.current < ctx.nPages ){
			ctx.current += 1;
			updateDisp(dom, ctx);
			startLoadVisits(dom, ctx.patientId, ctx.current);
		}
	});
}

function bindLast(dom, ctx){
	dom.querySelector(".visits-nav-last").addEventListener("click", function(event){
		event.preventDefault();
		event.stopPropagation();
		if( ctx.current < ctx.nPages ){
			ctx.current = ctx.nPages;
			updateDisp(dom, ctx);
			startLoadVisits(dom, ctx.patientId, ctx.current);
		}
	});
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