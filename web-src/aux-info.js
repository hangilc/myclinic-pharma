"use strict";

var task = require("./task");
var service = require("./pharma-service");
var hogan = require("hogan");
var visitsNavTmplSrc = require("raw!./visits-nav.html");
var visitsNavTmpl = hogan.compile(visitsNavTmplSrc);
var visitsBoxTmplSrc = require("raw!./visits-box.html");
var visitsBoxTmpl = hogan.compile(visitsBoxTmplSrc);
var kanjidate = require("kanjidate");
var util = require("./util");
var submenuByDrugTmplSrc = require("raw!./submenu-by-drug.html");
var submenuByDrugTmpl = hogan.compile(submenuByDrugTmplSrc);
var submenuByDrugSelectedTmplSrc = require("raw!./submenu-by-drug-selected.html");
var submenuByDrugSelectedTmpl = hogan.compile(submenuByDrugSelectedTmplSrc);
var conti = require("conti");

// Elements ////////////////////////////////////////////////////////////////////////

var wrapper = document.getElementById("aux-info");
var submenu = document.getElementById("control-box-submenu");
var visitsBox = document.getElementById("visits-box");

// Helpers /////////////////////////////////////////////////////////////////////////

function calcNumberOfPages(total, perPage){
	return Math.floor((total + perPage - 1) / perPage);
}

function currentSelectMode(){
	return wrapper.querySelector(".control-box input[type=radio][name=mode]:checked").value;
}

// Model ///////////////////////////////////////////////////////////////////////////

var ctx;
var visitsPerPage = 5;

function initialCtx(){
	return {
		visit: null,
		patient: null,
		byDate: {
			current: 0,
			nPages: 0
		},
		byDrug: {
			drugs: null,
			currentName: "",
			currentIyakuhincode: 0,
			currentPage: 1,
			nPages: 0
		},
		dispVisits: []
	};
}

var model = {
	reset: function(visitId, done){
		ctx = initialCtx();
		ctx.visitId = visitId;
		conti.exec([
			model.loadVisit.bind(null, visitId),
			model.loadPatient,
			model.calcVisitsByDate,
			model.loadDispVisitsByDate
		], done);
	},
	loadVisit: function(visitId, done){
		service.getVisit(visitId, function(err, result){
			if( err ){
				done(err);
				return;
			}
			ctx.visit = result;
			done();
		});
	},
	loadPatient: function(done){
		service.getPatient(ctx.visit.patient_id, function(err, result){
			if( err ){
				done(err);
				return;
			}
			ctx.patient = result;
			done();
		});
	},
	calcVisitsByDate: function(done){
		service.calcVisits(ctx.visit.patient_id, function(err, result){
			if( err ){
				done(err);
				return;
			}
			var nVisits = result;
			var nPages = calcNumberOfPages(nVisits, visitsPerPage);
			ctx.byDate.nPages = nPages;
			var current;
			if( nPages === 0 ){
				current = 0;
			} else {
				current = 1;
			}
			ctx.byDate.current = current;
			done();
		});
	},
	calcVisitsByDrug: function(done){
		var iyakuhincode = ctx.byDrug.currentIyakuhincode;
		service.countVisitsByIyakuhincode(ctx.visit.patient_id, iyakuhincode, function(err, result){
			if( err ){
				done(err);
				return;
			}
			ctx.byDrug.nPages = calcNumberOfPages(result, visitsPerPage);
			ctx.byDrug.currentPage = 1;
			done();
		});
	},
	loadDispVisitsByDate: function(done){
		if( ctx.byDate.current <= 0 ){
			ctx.dispVisits == [];
			done();
			return;
		}
		service.listFullVisits(ctx.visit.patient_id, (ctx.byDate.current-1)*visitsPerPage, 
				visitsPerPage, function(err, result){
			if( err ){
				done(err);
				return;
			}
			ctx.dispVisits = result;
			done();
		})
	},
	loadDispVisitsByDrug: function(done){
		if( ctx.byDrug.currentIyakuhincode > 0 ){
			var offset = (ctx.byDrug.currentPage - 1) * visitsPerPage;
			if( offset < 0 ){
				done("cannot happen in loadDispVisitsByDrug");
				return;
			}
			service.listFullVisitsByIyakuhincode(ctx.visit.patient_id, ctx.byDrug.currentIyakuhincode, 
				offset, visitsPerPage, function(err, result){
					if( err ){
						ctx.dispVisits = [];
						done(err);
						return;
					}
					ctx.dispVisits = result;
					done();
			});
		} else {
			ctx.dispVisits = [];
			setImmediate(done);
		}
	},
	ensureDrugs: function(done){
		if( ctx.byDrug.drugs === null ){
			model.loadDrugs(done);
		} else {
			setImmediate(done);
		}
	},
	loadDrugs: function(done){
		service.listIyakuhinByPatient(ctx.visit.patient_id, function(err, result){
			if( err ){
				done(err);
				return;
			}
			ctx.byDrug.drugs = result;
			done();
		});
	}
};

// View ////////////////////////////////////////////////////////////////////////////

var view = {
	show: function(){
		wrapper.style.display = "block";
	},
	hide: function(){
		wrapper.style.display = "hide";
	},
	checkByDate: function(){
		wrapper.querySelector("input[type=radio][name=mode][value=by-date]").checked = true;
	},
	renderSubmenuByDate: function(){
		if( ctx.byDate.nPages > 1 ){
			var html = visitsNavTmpl.render({
				patient: ctx.patient,
				current: ctx.byDate.current,
				total: ctx.byDate.nPages
			})
			submenu.innerHTML = html;
		} else {
			submenu.innerHTML = "";
		}
	},
	renderSubmenuByDrug: function(){
		var html;
		if( !ctx.byDrug.currentName ){
			html = submenuByDrugTmpl.render({list: ctx.byDrug.drugs});
		} else {
			html = submenuByDrugSelectedTmpl.render({
				patient: ctx.patient,
				name: ctx.byDrug.currentName,
				current: ctx.byDrug.currentPage,
				total: ctx.byDrug.nPages,
				requirePaging: ctx.byDrug.nPages > 1
			});
		}
		submenu.innerHTML = html;
	},
	renderVisits: function(){
		var list = ctx.dispVisits.map(function(visit){
			var index = 1;
			return {
				dateRep: kanjidate.format(kanjidate.f4, visit.v_datetime),
				texts: visit.texts.map(function(text){
					return text.content.replace(/\n/g, "<br />\n")
				}),
				drugs: visit.drugs.map(function(drug){
					return (index++) + ") " + util.drugRep(drug);
				})
			};
		});
		var html = visitsBoxTmpl.render({list: list});
		visitsBox.innerHTML = html;
	}
};

// Action //////////////////////////////////////////////////////////////////////////

var action = {
	reset: function(visitId){
		task.run([
			function(done){
				model.reset(visitId, done);
			}
		], function(err){
			if( err ){
				alert(err);
				return;
			}
			view.checkByDate();
			view.renderSubmenuByDate();
			view.renderVisits();
			view.show();
		});
	},
	firstPageByDate: function(){
		if( ctx.byDate.current > 1 ){
			ctx.byDate.current = 1;
			task.run([
				model.loadDispVisitsByDate
			], function(err){
				if( err ){
					alert(err);
					return;
				}
				view.renderSubmenuByDate();
				view.renderVisits();
			});
		}
	},
	prevPageByDate: function(){
		if( ctx.byDate.current > 1 ){
			ctx.byDate.current -= 1;
			task.run([
				model.loadDispVisitsByDate
			], function(err){
				if( err ){
					alert(err);
					return;
				}
				view.renderSubmenuByDate();
				view.renderVisits();
			});
		}
	},
	nextPageByDate: function(){
		if( ctx.byDate.current < ctx.byDate.nPages ){
			ctx.byDate.current += 1;
			task.run([
				model.loadDispVisitsByDate
			], function(err){
				if( err ){
					alert(err);
					return;
				}
				view.renderSubmenuByDate();
				view.renderVisits();
			});
		}
	},
	lastPageByDate: function(){
		if( ctx.byDate.current < ctx.byDate.nPages ){
			ctx.byDate.current = ctx.byDate.nPages;
			task.run([
				model.loadDispVisitsByDate
			], function(err){
				if( err ){
					alert(err);
					return;
				}
				view.renderSubmenuByDate();
				view.renderVisits();
			});
		}
	},
	firstPageByDrug: function(){
		if( ctx.byDrug.currentPage > 1 ){
			ctx.byDrug.currentPage = 1;
			task.run([
				model.loadDispVisitsByDrug
			], function(err){
				if( err ){
					alert(err);
					return;
				}
				view.renderSubmenuByDrug();
				view.renderVisits();
			});
		}
	},
	prevPageByDrug: function(){
		if( ctx.byDrug.currentPage > 1 ){
			ctx.byDrug.currentPage -= 1;
			task.run([
				model.loadDispVisitsByDrug
			], function(err){
				if( err ){
					alert(err);
					return;
				}
				view.renderSubmenuByDrug();
				view.renderVisits();
			});
		}
	},
	nextPageByDrug: function(){
		if( ctx.byDrug.currentPage < ctx.byDrug.nPages ){
			ctx.byDrug.currentPage += 1;
			task.run([
				model.loadDispVisitsByDrug
			], function(err){
				if( err ){
					alert(err);
					return;
				}
				view.renderSubmenuByDrug();
				view.renderVisits();
			});
		}
	},
	lastPageByDrug: function(){
		if( ctx.byDrug.currentPage < ctx.byDrug.nPages ){
			ctx.byDrug.currentPage = ctx.byDrug.nPages;
			task.run([
				model.loadDispVisitsByDrug
			], function(err){
				if( err ){
					alert(err);
					return;
				}
				view.renderSubmenuByDrug();
				view.renderVisits();
			});
		}
	},
	switchToByDate: function(){
		task.run([
			model.loadDispVisitsByDate
		], function(err){
			if( err ){
				alert(err);
				return;
			}
			view.renderSubmenuByDate();
			view.renderVisits();
		});	
	},
	switchToByDrug: function(){
		task.run([
			model.ensureDrugs,
			model.loadDispVisitsByDrug
		], function(err){
			if( err ){
				alert(err);
				return;
			}
			view.renderSubmenuByDrug();
			view.renderVisits();
		});	
	},
	selectIyakuhin: function(iyakuhincode, name){
		ctx.byDrug.currentName = name;
		ctx.byDrug.currentIyakuhincode = iyakuhincode;
		task.run([
			model.calcVisitsByDrug,
			model.loadDispVisitsByDrug
		], function(err){
			if( err ){
				alert(err);
				return;
			}
			view.renderSubmenuByDrug();
			view.renderVisits();
		});
	}
};

// Binding /////////////////////////////////////////////////////////////////////////

wrapper.addEventListener("click", function(event){
	if( event.target.classList.contains("visits-nav-first") ){
		var mode = currentSelectMode();
		if( mode === "by-date" ){
			action.firstPageByDate();
		} else if( mode === "by-drug" ){
			action.firstPageByDrug();
		}
	}
})

wrapper.addEventListener("click", function(event){
	if( event.target.classList.contains("visits-nav-prev") ){
		var mode = currentSelectMode();
		if( mode === "by-date" ){
			action.prevPageByDate();
		} else if( mode === "by-drug" ){
			action.prevPageByDrug();
		}
	}
})

wrapper.addEventListener("click", function(event){
	if( event.target.classList.contains("visits-nav-next") ){
		var mode = currentSelectMode();
		if( mode === "by-date" ){
			action.nextPageByDate();
		} else if( mode === "by-drug" ){
			action.nextPageByDrug();
		}
	}
})

wrapper.addEventListener("click", function(event){
	if( event.target.classList.contains("visits-nav-last") ){
		var mode = currentSelectMode();
		if( mode === "by-date" ){
			action.lastPageByDate();
		} else if( mode === "by-drug" ){
			action.lastPageByDrug();
		}
	}
})

wrapper.querySelectorAll("input[name=mode]").forEach(function(e){
	e.addEventListener("click", function(event){
		var mode = event.target.value;
		if( mode === "by-date" ){
			action.switchToByDate();
		} else if( mode === "by-drug" ){
			action.switchToByDrug();
		} else {
			alert("unknown mode: " + mode);
		}
	});
});

submenu.addEventListener("click", function(event){
	if( event.target.classList.contains("by-drug-item") ){
		var target = event.target;
		var iyakuhincode = +target.getAttribute("data-iyakuhincode");
		var name = target.innerText.trim();
		action.selectIyakuhin(iyakuhincode, name);
	}
});

// Exports /////////////////////////////////////////////////////////////////////////

exports.open = function(visitId){
	action.reset(visitId);
};

/**
exports.open = function(visitId){
	ctx = initialCtx();
	openByDate(visitId);
}

function openByDate(visitId){
	wrapper.querySelector("input[name=mode][value=by-date]").checked = true;
	loadByDateData(visitId, function(err, result){
		if( err ){
			alert(err);
			return;
		}
		ctx.visitId = result.visit.visit_id;
		ctx.patientId = result.patient.patient_id;
		ctx.byDate.current = 1;
		ctx.byDate.nPages = calcNumberOfPages(result.nVisits, visitsPerPage);
		renderSubmenuByDate();
		updateVisitsByDate();
		wrapper.style.display = "block";
	})
}

function renderSubmenuByDate(){
	if( ctx.byDate.nPages > 1 ){
		var html = visitsNavTmpl.render({
			current: ctx.byDate.current,
			total: ctx.byDate.nPages
		})
		submenu.innerHTML = html;
	} else {
		submenu.innerHTML = "";
	}
}

function renderSubmenuByDrug(){
	var html;
	if( !ctx.byDrug.currentName ){
		html = submenuByDrugTmpl.render({list: ctx.byDrug.drugs});
	} else {
		html = submenuByDrugSelectedTmpl.render({
			name: ctx.byDrug.currentName,
			current: ctx.byDrug.currentPage,
			total: ctx.byDrug.nPages,
			requirePaging: ctx.byDrug.nPages > 1
		});
	}
	submenu.innerHTML = html;
}

function loadByDateData(visitId, cb){
	var visit, patient, nVisits;
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
			service.calcVisits(patient.patient_id, function(err, result){
				if( err ){
					done(err);
					return;
				}
				nVisits = result;
				done();
			})
		}
	], function(err){
		if( err ){
			cb(err);
			return;
		}
		cb(undefined, {
			visit: visit,
			patient: patient,
			nVisits: nVisits
		})
	});	
}

function loadByDrugData(patientId, cb){
	var resultList;
	task.run([
		function(done){
			service.listIyakuhinByPatient(patientId, function(err, result){
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
		cb(undefined, resultList);
	})
}

function updateVisitsByDate(){
	var current = ctx.byDate.current;
	if( current <= 0 ){
		current = 1;
	}
	var resultList;
	task.run([
		function(done){
			service.listFullVisits(ctx.patientId, (current-1)*visitsPerPage, visitsPerPage, function(err, result){
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
		renderVisits(resultList);
	})
}

function updateVisitsByDrug(){
	var current = ctx.byDrug.currentPage;
	if( current <= 0 ){
		current = 1;
	}
	var patientId = ctx.patientId;
	var iyakuhincode = ctx.byDrug.currentIyakuhincode;
	var offset = (current - 1) * visitsPerPage;
	var resultList;
	task.run([
		function(done){
			service.listFullVisitsByIyakuhincode(patientId, iyakuhincode, offset, visitsPerPage, function(err, result){
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
		renderVisits(resultList);
	})
}

function calcNumberOfPages(total, perPage){
	return Math.floor((total + perPage - 1) / perPage);
}

wrapper.addEventListener("click", function(event){
	if( event.target.classList.contains("visits-nav-first") ){
		if( ctx.byDate.current > 1 ){
			ctx.byDate.current = 1;
			renderSubmenuByDate();
			updateVisitsByDate();
		}
	}
})

wrapper.addEventListener("click", function(event){
	if( event.target.classList.contains("visits-nav-prev") ){
		if( ctx.byDate.current > 1 ){
			ctx.byDate.current -= 1;
			renderSubmenuByDate();
			updateVisitsByDate();
		}
	}
})

wrapper.addEventListener("click", function(event){
	if( event.target.classList.contains("visits-nav-next") ){
		if( ctx.byDate.current < ctx.byDate.nPages ){
			ctx.byDate.current += 1;
			renderSubmenuByDate();
			updateVisitsByDate();
		}
	}
})

wrapper.addEventListener("click", function(event){
	if( event.target.classList.contains("visits-nav-last") ){
		if( ctx.byDate.current < ctx.byDate.nPages ){
			ctx.byDate.current = ctx.byDate.nPages;
			renderSubmenuByDate();
			updateVisitsByDate();
		}
	}
})

wrapper.addEventListener("click", function(event){
	if( event.target.classList.contains("by-drug-selected-first") ){
		if( ctx.byDrug.currentPage > 1 ){
			ctx.byDrug.currentPage = 1;
			renderSubmenuByDrug();
			updateVisitsByDrug();
		}
	}
})

wrapper.addEventListener("click", function(event){
	if( event.target.classList.contains("by-drug-selected-prev") ){
		if( ctx.byDrug.currentPage > 1 ){
			ctx.byDrug.currentPage -= 1;
			renderSubmenuByDrug();
			updateVisitsByDrug();
		}
	}
})

wrapper.addEventListener("click", function(event){
	if( event.target.classList.contains("by-drug-selected-next") ){
		if( ctx.byDrug.currentPage < ctx.byDrug.nPages ){
			ctx.byDrug.currentPage += 1;
			renderSubmenuByDrug();
			updateVisitsByDrug();
		}
	}
})

wrapper.addEventListener("click", function(event){
	if( event.target.classList.contains("by-drug-selected-last") ){
		if( ctx.byDrug.currentPage < ctx.byDrug.nPages ){
			ctx.byDrug.currentPage = ctx.byDrug.nPages;
			renderSubmenuByDrug();
			updateVisitsByDrug();
		}
	}
})

submenu.addEventListener("click", function(event){
	if( event.target.classList.contains("by-drug-item") ){
		var iyakuhincode = +event.target.getAttribute("data-iyakuhincode");
		var resultCount;
		task.run([
			function(done){
				service.countVisitsByIyakuhincode(ctx.patientId, iyakuhincode, function(err, result){
					if( err ){
						done(err);
						return;
					}
					resultCount = result;
					done();
				})
			}
		], function(err){
			if( err ){
				alert(err);
				return;
			}
			ctx.byDrug.currentPage = 1;
			ctx.byDrug.nPages = calcNumberOfPages(resultCount, visitsPerPage);
			ctx.byDrug.currentName = "";
			ctx.byDrug.currentIyakuhincode = 0;
			for(var i=0;i<ctx.byDrug.drugs.length;i++){
				var drug = ctx.byDrug.drugs[i];
				if( drug.iyakuhincode === iyakuhincode ){
					ctx.byDrug.currentName = drug.name;
					ctx.byDrug.currentIyakuhincode = drug.iyakuhincode;
					break;
				}
			}
			renderSubmenuByDrug();
			updateVisitsByDrug();
		})
	}
});

submenu.addEventListener("click", function(event){
	if( event.target.classList.contains("by-drug-goto-list") ){
		ctx.byDrug.currentName = "";
		ctx.byDrug.currentPage = 1;
		ctx.byDrug.currentIyakuhincode = 0;
		ctx.byDrug.nPages = 0;
		renderSubmenuByDrug();
		renderVisits([]);
	}
});

function renderVisits(visits){
	var index = 1;
	var list = visits.map(function(visit){
		return {
			dateRep: kanjidate.format(kanjidate.f4, visit.v_datetime),
			texts: visit.texts.map(function(text){
				return text.content.replace(/\n/g, "<br />\n")
			}),
			drugs: visit.drugs.map(function(drug){
				return (index++) + ") " + util.drugRep(drug);
			})
		};
	});
	var html = visitsBoxTmpl.render({list: list});
	visitsBox.innerHTML = html;
}

document.querySelectorAll("#aux-info input[name=mode]").forEach(function(e){
	e.addEventListener("click", function(event){
		var mode = event.target.value;
		if( mode === "by-date" ){
			renderSubmenuByDate();
			updateVisitsByDate();
		} else if( mode === "by-drug" ){
			if( ctx.byDrug.drugs === null ){
				loadByDrugData(ctx.patientId, function(err, result){
					if( err ){
						alert(err);
						return;
					}
					ctx.byDrug.drugs = result;
					ctx.byDrug.currentName = "";
					ctx.byDrug.currentIyakuhincode = 0;
					ctx.byDrug.currentPage = 1;
					ctx.byDrug.nPages = 0;
					renderSubmenuByDrug();
					renderVisits([]);
				});
			} else {
				renderSubmenuByDrug();
				updateVisitsByDrug();
			}
		} else {
			alert("unknown mode: " + mode);
			return;
		}
	});
});

function doClose(){
	ctx = initialCtx();
	wrapper.style.display = "none";
}

document.body.addEventListener("presc-cancel", function(event){
	doClose();
});
document.body.addEventListener("presc-done", function(event){
	doClose();
});
**/

