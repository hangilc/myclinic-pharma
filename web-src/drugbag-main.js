"use strict";

var service = require("./pharma-service");
var task = require("./task");
var conti = require("conti");
var DrugBagData = require("./drugbag-data");
var DrugBag = require("myclinic-drawer-forms").DrugBag;
var DrawerSVG = require("myclinic-drawer-svg");
var moment = require("moment");
var kanjidate = require("kanjidate");
var printUtil = require("./print-util");

(function(){
	var match;
	var q = location.search;
	match = q.match(/visit_id=(\d+)/);
	if( match ){
		startAllDrugs(+match[1]);
		return;
	}
	match = q.match(/drug_id=(\d+)/);
	if( match ){
		startSingleDrug(+match[1]);
		return;
	}
	match = q.match(/blank=(\w+)/);
	if( match ){
		startBlank(match[1]);
	}
})();

function startAllDrugs(visitId){
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
		var allDrugs = resultList;
		var drugs = nonPrescribedOnly() ? 
			allDrugs.filter(function(drug){ return !drug.d_prescribed; }) :
			allDrugs;
		var ctx = {
			allDrugs: allDrugs,
			drugs: drugs,
			currentPage: drugs.length > 0 ? 1 : 0
		};
		bindPageNav(ctx);
		navPageUpdate(ctx);
		document.getElementById("page-nav-wrapper").style.display = "block";
		updatePreviewDrug(ctx);
		bindPrintButtonAllDrugs(ctx);
	})
}

function nonPrescribedOnly(){
	return document.getElementById("nonprescribed-only").checked;
}

// function previewAllDrugs(visitId){
// 	fetchDrugs(visitId, function(err, result){
// 		if( err ){
// 			alert(err);
// 			return;
// 		}
// 		var drugs;
// 		if( document.getElementById("nonprescribed-only").checked ){
// 			drugs = result.filter(function(drug){
// 				return !drug.d_prescribed;
// 			})
// 		} else {
// 			drugs = result;
// 		}
// 		var ctx = {
// 			allDrugs: result,
// 			drugs: drugs,
// 			currentPage: drugs.length > 0 ? 1 : 0
// 		};
// 		bindPageNav(ctx);
// 		navPageUpdate(ctx);
// 		document.getElementById("page-nav-wrapper").style.display = "block";
// 		updatePreviewDrug(ctx);
// 		bindPrintButtonAllDrugs(ctx);
// 	});
// }

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
		var drugId = ctx.drugs[ctx.currentPage-1].drug_id;
		var ops;
		task.run(function(done){
			composeSingleDrugOps(drugId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				ops = result;
				done();
			})
		}, function(err){
			if( err ){
				alert(err);
				return;
			}
			renderDrugBag(ops);
		})
	} else {
		clearPreview();
	}
}

// function fetchDrugs(visitId, cb){
// 	var resultList;
// 	task.run([
// 		function(done){
// 			service.listDrugs(visitId, function(err, result){
// 				if( err ){
// 					done(err);
// 					return;
// 				}
// 				resultList = result;
// 				done();
// 			})
// 		}
// 	], function(err){
// 		if( err ){
// 			cb(err);
// 			return;
// 		}
// 		cb(undefined, resultList);
// 	})
// }

function bindPrintButtonAllDrugs(ctx){
	document.getElementById("print-button").addEventListener("click", function(event){
		var pages;
		task.run([
			function(done){
				var drugIds = ctx.drugs.map(function(drug){ return drug.drug_id; });
				composeAllDrugsPages(ctx.currentVisitId, drugIds, function(err, result){
					if( err ){
						done(err);
						return;
					}
					pages = result;
					done();
				})
			}
		], function(err){
			if( err ){
				alert(err);
				return;
			}
			printUtil.print(pages, undefined, function(err){
				if( err ){
					alert(err);
					return;
				}
				window.close();
			})
		})
	})
}

function bindPrintButtonSingle(ops){
	document.getElementById("print-button").addEventListener("click", function(event){
		printUtil.print([ops], undefined, function(err){
			if( err ){
				alert(err);
				return;
			}
			window.close();
		});
	})
}

function startSingleDrug(drugId){
	var ops;
	task.run(function(done){
		composeSingleDrugOps(drugId, function(err, result){
			if( err ){
				done(err);
				return;
			}
			ops = result;
			done();
		})
	}, function(err){
		if( err ){
			alert(err);
			return;
		}
		renderDrugBag(ops);
		bindPrintButtonSingle(ops);
	})
}

function composeDrugBagOps(drugId, cb){
	DrugBagData.composeData(drugId, function(err, result){
		if( err ){
			alert(err);
			return;
		}
		var compiler = new DrugBag(result);
		var ops = compiler.getOps();
		cb(undefined, ops);
	})
}

function renderDrugBag(ops){
	var svg = DrawerSVG.drawerToSvg(ops, {width: "128mm", height: "182mm", viewBox: "0 0 192 273"});
	var wrapper = document.getElementById("preview-area");
	wrapper.innerHTML = "";
	wrapper.appendChild(svg);
}

function composeAllDrugsPages(visitId, drugIds, cb){
	var visit, patient, drugs = [];
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
			conti.forEach(drugIds, function(drugId, done){
				service.getFullDrug(drugId, function(err, result){
					if( err ){
						done(err);
						return;
					}
					drugs.push(result);
					done();
				})
			}, done);
		},
		function(done){
			conti.forEach(drugs, function(drug, done){
				service.findPharmaDrug(drug.d_iyakuhincode, function(err, result){
					if( err ){
						done(err);
						return;
					}
					drug.pharmaDrug = result;
					done();
				})
			}, done);
		}
	], function(err){
		if( err ){
			cb(err);
			return;
		}
		var pages = drugs.map(function(drug){
			var data = DrugBagData.createData(drug, visit, patient, drug.pharmaDrug);
			var compiler = new DrugBag(data);
			return compiler.getOps();
		})
		cb(undefined, pages);
	})	
}

function composeSingleDrugOps(drugId, cb){
	var drug, visit, patient, pharmaDrug;
	conti.exec([
		function(done){
			service.getFullDrug(drugId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				drug = result;
				done();
			})
		},
		function(done){
			service.getVisit(drug.visit_id, function(err, result){
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
			service.findPharmaDrug(drug.d_iyakuhincode, function(err, result){
				if( err ){
					done(err);
					return;
				}
				pharmaDrug = result;
				done();
			})
		}
	], function(err){
		if( err ){
			cb(err);
			return;
		}
		var data = DrugBagData.createData(drug, visit, patient, pharmaDrug);
		var compiler = new DrugBag(data);
		var ops = compiler.getOps();
		cb(undefined, ops);
	})	
}

function previewDrug(drugId){
	var drug, visit, patient, pharmaDrug;
	task.run([
		function(done){
			service.getFullDrug(drugId, function(err, result){
				if( err ){
					done(err);
					return;
				}
				drug = result;
				done();
			})
		},
		function(done){
			service.getVisit(drug.visit_id, function(err, result){
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
			service.findPharmaDrug(drug.d_iyakuhincode, function(err, result){
				if( err ){
					done(err);
					return;
				}
				pharmaDrug = result;
				done();
			})
		}
	], function(err){
		if( err ){
			cb(err);
			return;
		}
		var data = DrugBagData.createData(drug, visit, patient, pharmaDrug);
		var compiler = new DrugBag(data);
		var ops = compiler.getOps();
		renderDrugBag(ops);
		bindPrintButtonSingle(ops);
	})
}

function startBlank(kind){
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
	bindPrintButtonSingle(ops);
}

