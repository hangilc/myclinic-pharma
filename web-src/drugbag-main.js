"use strict";

var service = require("./pharma-service");
var task = require("./task");
var DrugBagData = require("./drugbag-data");
var DrugBag = require("myclinic-drawer-forms").DrugBag;
var DrawerSVG = require("myclinic-drawer-svg");
var moment = require("moment");
var kanjidate = require("kanjidate");

(function(){
	var match;
	var q = location.search;
	match = q.match(/visit_id=(\d+)/);
	if( match ){
		previewAllDrugs(+match[1]);
		return;
	}
	match = q.match(/drug_id=(\d+)/);
	if( match ){
		previewDrug(+match[1]);
		return;
	}
	match = q.match(/blank=(\w+)/);
	if( match ){
		previewBlank(match[1]);
	}
})();

function previewAllDrugs(visitId){
	fetchDrugs(visitId, function(err, result){
		if( err ){
			alert(err);
			return;
		}
		var drugs;
		if( document.getElementById("nonprescribed-only").checked ){
			drugs = result.filter(function(drug){
				return !drug.d_prescribed;
			})
		} else {
			drugs = result;
		}
		var ctx = {
			allDrugs: result,
			drugs: drugs,
			currentPage: drugs.length > 0 ? 1 : 0
		};
		bindPageNav(ctx);
		navPageUpdate(ctx);
		document.getElementById("page-nav-wrapper").style.display = "block";
		updatePreviewDrug(ctx);
	});
}

function navPageUpdate(ctx){
	document.getElementById("page-info-current").innerHTML = ctx.currentPage;
	document.getElementById("page-info-total").innerHTML = ctx.drugs.length;
}

function clearPreview(){
	document.getElementById("preview-area").innerHTML = "";
}

function bindPageNav(ctx){
	document.getElementById("nonprescribed-only").addEventListener("change", function(event){
		var checked = this.checked;
		if( checked ){
			ctx.drugs = ctx.allDrugs.filter(function(drug){
				return !drug.d_prescribed;
			})
		} else {
			ctx.drugs = ctx.allDrugs;
		}
		if( ctx.drugs.length > 0 ){
			ctx.currentPage = 1;
		} else {
			ctx.currentPage = 0;
		}
		navPageUpdate(ctx);
		updatePreviewDrug(ctx);
	});
	document.getElementById("page-prev").addEventListener("click", function(event){
		event.preventDefault();
		if( ctx.currentPage > 1 ){
			ctx.currentPage -= 1;
			navPageUpdate(ctx);
			updatePreviewDrug(ctx);
		}
	});
	document.getElementById("page-next").addEventListener("click", function(event){
		event.preventDefault();
		if( ctx.currentPage < ctx.drugs.length ){
			ctx.currentPage += 1;
			navPageUpdate(ctx);
			updatePreviewDrug(ctx);
		}
	});
}

function updatePreviewDrug(ctx){
	if( ctx.currentPage > 0 ){
		previewDrug(ctx.drugs[ctx.currentPage-1].drug_id);
	} else {
		clearPreview();
	}
}

function fetchDrugs(visitId, cb){
	var resultList;
	task.run([
		function(done){
			service.listDrugs(visitId, function(err, result){
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
			cb(err);
			return;
		}
		cb(undefined, resultList);
	})
}

function previewDrug(drugId){
	DrugBagData.composeData(drugId, function(err, result){
		if( err ){
			alert(err);
			return;
		}
		var compiler = new DrugBag(result);
		var ops = compiler.getOps();
		var svg = DrawerSVG.drawerToSvg(ops, {width: "128mm", height: "182mm", viewBox: "0 0 192 273"});
		var wrapper = document.getElementById("preview-area");
		wrapper.appendChild(svg);
	})
}

function previewBlank(kind){
	var compiler = new DrugBag({
	    kind: kind,
	    patient_name: "　　　　　　",
	    patient_name_yomi: "　　　　　　　　",
	    instructions: [],
	    drug_name: "",
	    desc: "",
	    prescribed_at: kanjidate.format(kanjidate.f2, new Date()),
	    clinic_name: "",
	    clinic_address: [
	        "",
	        "",
	        "",
	        ""
	    ]
	});
	var ops = compiler.getOps();
	var svg = DrawerSVG.drawerToSvg(ops, {width: "128mm", height: "182mm", viewBox: "0 0 192 273"});
	var wrapper = document.getElementById("preview-area");
	wrapper.appendChild(svg);
}

