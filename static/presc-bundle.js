/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var service = __webpack_require__(1);
	var task = __webpack_require__(7);
	var PrescContent = __webpack_require__(8).PrescContent;
	var DrawerSVG = __webpack_require__(17);
	var kanjidate = __webpack_require__(18);
	var util = __webpack_require__(19);
	var printUtil = __webpack_require__(22);
	var common = __webpack_require__(23);

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


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var service = __webpack_require__(2);
	var conti = __webpack_require__(5);

	exports.listFullPharmaQueue = function(cb){ // list_full_pharma_queue
		service.listFullPharmaQueue(cb);
	};

	exports.listTodaysVisits = function(cb){ // list_todays_visits_for_pharma
		service.listTodaysVisitsForPharma(cb);
	};

	exports.getVisit = function(visitId, cb){ // get_visit
		service.getVisit(visitId, cb);
	}

	exports.getPatient = function(patientId, cb){ // get_patient
		service.getPatient(patientId, cb);
	}

	exports.listFullDrugs = function(visitId, cb){ // list_full_drugs
		var visit, drugs;
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
				service.listFullDrugsForVisit(visit.visit_id, visit.v_datetime, function(err, result){
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
				cb(err);
				return;
			}
			cb(undefined, drugs);
		})
	};

	exports.listDrugs = function(visitId, cb){
		service.listDrugs(visitId, cb);
	}

	exports.calcVisits = function(patientId, cb){
		service.calcVisits(patientId, cb);
	};

	exports.listFullVisits = function(patientId, offset, count, cb){
		service.listFullVisits(patientId, offset, count, cb);
	};

	exports.listVisits = function(patientId, offset, count, cb){
		service.listVisits(patientId, offset, count, cb);
	};

	exports.listIyakuhinByPatient = function(patientId, cb){
		service.listIyakuhinByPatient(patientId, cb);
	};

	exports.countVisitsByIyakuhincode = function(patientId, iyakuhincode, cb){
		service.countVisitsByIyakuhincode(patientId, iyakuhincode, cb);
	};

	exports.listFullVisitsByIyakuhincode = function(patientId, iyakuhincode, offset, count, cb){
		service.listFullVisitsByIyakuhincode(patientId, iyakuhincode, offset, count, cb);
	};

	exports.getFullDrug = function(drugId, at, cb){
		service.getFullDrug(drugId, at, cb);
	};

	// exports.getFullDrug = function(drugId, cb){
	// 	var drug, visit, fullDrug;
	// 	conti.exec([
	// 		function(done){
	// 			service.getDrug(drugId, function(err, result){
	// 				if( err ){
	// 					done(err);
	// 					return;
	// 				}
	// 				drug = result;
	// 				done();
	// 			})
	// 		},
	// 		function(done){
	// 			service.getVisit(drug.visit_id, function(err, result){
	// 				if( err ){
	// 					done(err);
	// 					return;
	// 				}
	// 				visit = result;
	// 				done();
	// 			})
	// 		},
	// 		function(done){
	// 			service.getFullDrug(drugId, visit.v_datetime, function(err, result){
	// 				if( err ){
	// 					done(err);
	// 					return;
	// 				}
	// 				fullDrug = result;
	// 				done();
	// 			})
	// 		}
	// 	], function(err){
	// 		if( err ){
	// 			cb(err);
	// 			return;
	// 		}
	// 		cb(undefined, fullDrug);
	// 	});
	// };

	exports.findPharmaDrug = function(iyakuhincode, cb){
		service.findPharmaDrug(iyakuhincode, cb);
	};

	exports.prescDone = function(visitId, done){
		service.prescDone(visitId, done);
	};

	exports.getDrug = function(drugId, cb){
		service.getDrug(drugId, cb);
	};


	/*
	exports.listPharmaQueue = function(cb){ // list_full_pharma_queue
		cb(undefined, [
			{
				visit_id: 1234,
				pharma_state: 0,
				last_name: "LAST_NAME_1",
				first_name: "FIRST_NAME_1",
				last_name_yomi: "LAST_NAME_YOMI_1",
				first_name_yomi: "FIRST_NAME_YOMI_1",
				wait_state: 3,
				patient_id: 2239
			},
			{
				visit_id: 1235,
				pharma_state: 1,
				last_name: "LAST_NAME_3",
				first_name: "FIRST_NAME_3",
				last_name_yomi: "LAST_NAME_YOMI_3",
				first_name_yomi: "FIRST_NAME_YOMI_3",
				wait_state: 2,
				patient_id: 2240
			},
		]);
	};

	exports.listTodaysVisits = function(cb){ // list_todays_visits_for_pharma
		cb(undefined, [
			{
				visit_id: 1233,
				pharma_state: 2,
				last_name: "LAST_NAME_2",
				first_name: "FIRST_NAME_2",
				last_name_yomi: "LAST_NAME_YOMI_2",
				first_name_yomi: "FIRST_NAME_YOMI_2",
				wait_state: null,
				patient_id: 2238
			}
		]);
	};

	exports.getVisit = function(visitId, cb){ // get_visit
		cb(undefined, {
			visit_id: 1234,
			patient_id: 2239,
			v_datetime: "2016-09-18 14:38:12",
			shahokokuho_id: 0,
			koukikourei_id: 0,
			roujin_id: 0,
			kouhi_1_id: 0,
			kouhi_2_id: 0,
			kouhi_3_id: 0
		})
	}

	exports.getPatient = function(patientId, cb){ // get_patient
		cb(undefined, {
			patient_id: patientId,
			last_name: "LAST_NAME_2",
			first_name: "FIRST_NAME_2",
			last_name_yomi: "LAST_NAME_YOMI_2",
			first_name_yomi: "FIRST_NAME_YOMI_2",
			birth_day: "1960-01-12",
			sex: "M",
			phone: "03-1234-56768",
			address: "PATIENT_ADDRESS"
		});
	}

	exports.listFullDrugs = function(visitId, cb){ // list_full_drugs
		cb(undefined, [
			{
				drug_id: 1123,
				visit_id: 1234,
				d_iyakuhincode: 1111,
				name: "DRUG_NAME_1",
				d_category: 0,
				d_amount: "3",
				unit: "錠",
				d_usage: "分３　毎食後",
				d_days: "7",
				d_prescribed: 1
			}
		]);
	};

	exports.listDrugs = function(visitId, cb){
		cb(undefined, [
			{
				drug_id: 2222,
				visit_id: 3333,
				d_iyakuhincode: 1234,
				d_category: 0,
				d_amount: 3,
				d_usage: "分３　毎食後",
				d_days: "5",
				d_prescribed: 1
			},
			{
				drug_id: 2223,
				visit_id: 3333,
				d_iyakuhincode: 1235,
				d_category: 0,
				d_amount: 3,
				d_usage: "分３　毎食後",
				d_days: "6",
				d_prescribed: 1
			},
			{
				drug_id: 2224,
				visit_id: 3333,
				d_iyakuhincode: 1235,
				d_category: 0,
				d_amount: 3,
				d_usage: "分３　毎食後",
				d_days: "7",
				d_prescribed: 0
			},
			{
				drug_id: 2225,
				visit_id: 3333,
				d_iyakuhincode: 1235,
				d_category: 0,
				d_amount: 3,
				d_usage: "分３　毎食後",
				d_days: "8",
				d_prescribed: 0
			},
		])
	}

	exports.calcVisits = function(patientId, cb){
		cb(undefined, 26);
	};

	exports.listFullVisits = function(patientId, offset, count, cb){
		cb(undefined, [
			{
				v_datetime: "2016-09-18 18:05:12",
				texts: [
					{
						content: "LINE_1\r\nLINE_2\r\nOFFSET " + offset + "\r\nCOUNT " + count
					}
				],
				drugs: [
					{
						name: "DRUG_NAME_1",
						d_category: 0,
						d_amount: "3",
						unit: "錠",
						d_usage: "分３　毎食後",
						d_days: "7",
						d_prescribed: 1
					},
					{
						name: "DRUG_NAME_2",
						d_category: 0,
						d_amount: "3",
						unit: "錠",
						d_usage: "分３　毎食後",
						d_days: "7",
						d_prescribed: 1
					}
				]
			}
		]);
	};

	exports.listVisits = function(patientId, offset, count, cb){
		cb(undefined, [
			{
				visit_id: 1234,
				v_datetime: "2016-09-21 18:09:00",
			},
			{
				visit_id: 1233,
				v_datetime: "2016-08-21 18:09:00",
			},
			{
				visit_id: 1232,
				v_datetime: "2016-07-21 18:09:00",
			}
		]);
	};

	exports.listIyakuhinByPatient = function(patientId, cb){
		cb(undefined, [
			{
				iyakuhincode: 1234,
				name: "DRUG_NAME_2",
				yomi: "DRUG_YOMI_2"
			},
			{
				iyakuhincode: 1235,
				name: "DRUG_NAME_3",
				yomi: "DRUG_YOMI_3"
			}
		]);
	};

	exports.countVisitsByIyakuhincode = function(patientId, iyakuhincode, cb){
		cb(undefined, 16);
	};

	exports.listFullVisitsByIyakuhincode = function(patientId, iyakuhincode, offset, count, cb){
		cb(undefined, [
			{
				v_datetime: "2016-08-18 09:05:12",
				texts: [
					{
						content: "LINE_1\r\nLINE_2\r\nOFFSET " + offset + "\r\nCOUNT " + count
					}
				],
				drugs: [
					{
						name: "DRUG_NAME_3",
						d_category: 0,
						d_amount: "3",
						unit: "錠",
						d_usage: "分３　毎食後",
						d_days: "7",
						d_prescribed: 1
					},
					{
						name: "DRUG_NAME_4",
						d_category: 0,
						d_amount: "3",
						unit: "錠",
						d_usage: "分３　毎食後",
						d_days: "7",
						d_prescribed: 1
					}
				]
			}
		]);
	};

	exports.getFullDrug = function(drugId, cb){
		cb(undefined, {
			name: "DRUG_NAME_5",
			d_iyakuhincode: 337834,
			d_category: 0,
			d_amount: "3",
			unit: "錠",
			d_usage: "分３　毎食後",
			d_days: "7",
			d_prescribed: 0
		});	
	}

	exports.findPharmaDrug = function(iyakuhincode, cb){
		cb(undefined, {
			description: "DESCRIPTION",
			sideeffect: "SIDEEFFECT"
		})
	};

	exports.prescDone = function(visitId, done){
		done();
	};
	*/


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	__webpack_require__(3);
	var conti = __webpack_require__(5);

	var timeout = 15000;

	function request(service, data, method, cb){
		data = data || {};
		method = method || "GET";
		var url = window.location.origin + "/service";
		var searchParams = new URLSearchParams();
		searchParams.append("_q", service);
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

	// function request(service, data, method, cb){
	// 	data = data || {};
	// 	method = method || "GET";
	// 	var config = {
	// 		url: "./service?_q=" + service,
	//         type: method,
	// 		data: data,
	// 		dataType: "json",
	// 		success: function(list){
	// 			cb(undefined, list);
	// 		},
	// 		error: function(xhr, err, errThrown){
	// 			cb("ERROR: " + (xhr.responseText || err || errThrown));
	// 		},
	// 		timeout: 10000
	// 	};
	// 	if( method === "POST" && typeof data === "string" ){
	// 		config.contentType = "application/json";
	// 	}
	// 	$.ajax(config);
	// }

	exports.recentVisits = function(cb){
		request("recent_visits", "", "GET", cb);
	};

	exports.getPatient = function(patientId, cb){
		request("get_patient", {patient_id: patientId}, "GET", cb);
	};

	exports.calcVisits = function(patientId, cb){
		request("calc_visits", {patient_id: patientId}, "GET", cb);
	};

	exports.listFullVisits = function(patientId, offset, n, cb){
		request("list_full_visits", {patient_id: patientId, offset: offset, n: n}, "GET", cb);
	};

	exports.startExam = function(visitId, done){
		request("start_exam", {visit_id: visitId}, "POST", done);
	};

	exports.suspendExam = function(visitId, done){
		request("suspend_exam", {visit_id: visitId}, "POST", done);
	};

	exports.endExam = function(visitId, charge, done){
		request("end_exam", {visit_id: visitId, charge: charge}, "POST", done);
	};

	exports.listCurrentFullDiseases = function(patientId, cb){
		request("list_current_full_diseases", {patient_id: patientId}, "GET", cb);
	};

	exports.listFullWqueueForExam = function(cb){
		request("list_full_wqueue_for_exam", {}, "GET", cb);
	};

	exports.getVisit = function(visitId, cb){
		request("get_visit", {visit_id: +visitId}, "GET", cb);
	};

	exports.searchPatient = function(text, cb){
		request("search_patient", {text: text}, "GET", cb);
	};

	exports.listTodaysVisits = function(cb){
		request("list_todays_visits", {}, "GET", cb);
	};

	exports.startVisit = function(patientId, at, done){
		request("start_visit", {patient_id: patientId, at: at}, "POST", done);
	};

	exports.deleteVisit = function(visitId, done){
		request("delete_visit", {visit_id: visitId}, "POST", done);
	};

	exports.getText = function(textId, cb){
		request("get_text", {text_id: textId}, "GET", cb);
	};

	exports.updateText = function(text, done){
		request("update_text", text, "POST", done);
	};

	exports.deleteText = function(textId, done){
		request("delete_text", {text_id: textId}, "POST", done);
	};

	exports.enterText = function(text, cb){
		request("enter_text", text, "POST", cb);
	};

	exports.listAvailableHoken = function(patientId, at, cb){
		request("list_available_hoken", {patient_id: patientId, at: at}, "GET", cb);
	};

	exports.updateVisit = function(visit, done){
		request("update_visit", visit, "POST", done);
	};

	exports.getVisitWithFullHoken = function(visitId, cb){
		request("get_visit_with_full_hoken", {visit_id: visitId}, "GET", cb);
	};

	exports.searchIyakuhinMaster = function(text, at, cb){
		request("search_iyakuhin_master", {text: text, at: at}, "GET", cb);
	};

	exports.searchPrescExample = function(text, cb){
		request("search_presc_example", {text: text}, "GET", cb);
	};

	exports.searchFullDrugForPatient = function(patientId, text, cb){
		request("search_full_drug_for_patient", {patient_id: patientId, text: text}, "GET", cb);
	};

	exports.resolveIyakuhinMasterAt = function(iyakuhincode, at, cb){
		request("resolve_iyakuhin_master_at", {iyakuhincode: iyakuhincode, at: at}, "GET", cb);
	};

	exports.getIyakuhinMaster = function(iyakuhincode, at, cb){
		request("get_iyakuhin_master", {iyakuhincode: iyakuhincode, at: at}, "GET", cb);
	};

	exports.enterDrug = function(drug, cb){
		request("enter_drug", drug, "POST", cb);
	};

	exports.getFullDrug = function(drugId, at, cb){
		request("get_full_drug", {drug_id: drugId, at: at}, "GET", cb);
	};

	exports.listFullDrugsForVisit = function(visitId, at, cb){
		request("list_full_drugs_for_visit", {visit_id: visitId, at: at}, "GET", cb);
	};

	exports.batchEnterDrugs = function(drugs, cb){
		request("batch_enter_drugs", JSON.stringify(drugs), "POST", cb);
	};

	exports.batchDeleteDrugs = function(drugIds, done){
		request("batch_delete_drugs", JSON.stringify(drugIds), "POST", done);
	};

	exports.batchUpdateDrugsDays = function(drugIds, days, done){
		var data = {
			drug_ids: drugIds,
			days: days
		};
		request("batch_update_drugs_days", JSON.stringify(data), "POST", done);
	};

	exports.modifyDrug = function(drug, done){
		request("modify_drug", JSON.stringify(drug), "POST", done);
	};

	exports.batchResolveShinryouNamesAt = function(names, at, cb){
		var body = JSON.stringify({
			names: names,
			at: at
		});
		request("batch_resolve_shinryou_names_at", body, "POST", cb);
	};

	exports.batchEnterShinryou = function(shinryouList, cb){
		var body = JSON.stringify(shinryouList);
		request("batch_enter_shinryou", body, "POST", cb);
	};

	exports.getShinryou = function(shinryouId, cb){
		request("get_shinryou", {shinryou_id: shinryouId}, "GET", cb);
	};

	exports.getFullShinryou = function(shinryouId, at, cb){
		request("get_full_shinryou", {shinryou_id: shinryouId, at: at}, "GET", cb);
	};

	exports.listFullShinryouForVisit = function(visitId, at, cb){
		request("list_full_shinryou_for_visit", {visit_id: visitId, at: at}, "GET", cb);
	};

	exports.batchDeleteShinryou = function(shinryouIds, done){
		request("batch_delete_shinryou", JSON.stringify(shinryouIds), "POST", done);
	};

	exports.searchShinryouMaster = function(text, at, cb){
		request("search_shinryou_master", {text: text, at: at}, "GET", cb);
	};

	exports.resolveShinryouMasterAt = function(shinryoucode, at, cb){
		request("resolve_shinryou_master_at", {shinryoucode: shinryoucode, at: at}, "GET", cb);
	};

	exports.getShinryouMaster = function(shinryoucode, at, cb){
		request("get_shinryou_master", {shinryoucode: shinryoucode, at: at}, "GET", cb);
	};

	exports.enterConduct = function(conduct, cb){
		request("enter_conduct", JSON.stringify(conduct), "POST", cb);
	};

	exports.enterGazouLabel = function(gazouLabel, done){
		request("enter_gazou_label", JSON.stringify(gazouLabel), "POST", done);
	};

	exports.enterConductDrug = function(conductDrug, cb){
		request("enter_conduct_drug", JSON.stringify(conductDrug), "POST", cb);
	};

	exports.enterConductKizai = function(conductKizai, cb){
		request("enter_conduct_kizai", JSON.stringify(conductKizai), "POST", cb);
	};

	exports.resolveKizaiNameAt = function(name, at, cb){
		var data = {
			name: name,
			at: at
		};
		request("resolve_kizai_name_at", data, "GET", cb);
	};

	exports.batchEnterConductShinryou = function(conductShinryouList, cb){
		request("batch_enter_conduct_shinryou", JSON.stringify(conductShinryouList), "POST", cb);
	};

	exports.getFullConduct = function(conductId, at, cb){
		request("get_full_conduct", {conduct_id: conductId, at: at}, "GET", cb);
	};

	exports.enterConductShinryou = function(conductShinryou, cb){
		request("enter_conduct_shinryou", JSON.stringify(conductShinryou), "POST", cb);
	};

	exports.enterConductDrug = function(conductDrug, cb){
		request("enter_conduct_drug", JSON.stringify(conductDrug), "POST", cb);
	};

	exports.copyConducts = function(srcVisitId, dstVisitId, cb){
		request("copy_conducts", {src_visit_id: srcVisitId, dst_visit_id: dstVisitId}, "POST", cb);
	};

	exports.deleteConduct = function(conductId, done){
		request("delete_conduct", {conduct_id: conductId}, "POST", done);
	};

	exports.deleteConductShinryou = function(conductShinryouId, done){
		request("delete_conduct_shinryou", {conduct_shinryou_id: conductShinryouId}, "POST", done);
	}

	exports.deleteConductDrug = function(conductDrugId, done){
		request("delete_conduct_drug", {conduct_drug_id: conductDrugId}, "POST", done);
	}

	exports.deleteConductKizai = function(conductKizaiId, done){
		request("delete_conduct_kizai", {conduct_kizai_id: conductKizaiId}, "POST", done);
	}

	exports.getKizaiMaster = function(kizaicode, at, cb){
		request("get_kizai_master", {kizaicode: kizaicode, at: at}, "GET", cb);
	};

	exports.searchKizaiMaster = function(text, at, cb){
		request("search_kizai_master", {text: text, at: at}, "GET", cb);
	};

	exports.changeConductKind = function(conductId, kind, done){
		request("change_conduct_kind", {conduct_id: conductId, kind: kind}, "POST", done);
	};

	exports.setGazouLabel = function(conductId, label, done){
		request("set_gazou_label", {conduct_id: conductId, label: label}, "POST", done);
	};

	exports.enterShinryouByNames = function(visitId, names, cb){
		var data = {
			visit_id: visitId,
			names: names
		};
		request("enter_shinryou_by_names", JSON.stringify(data), "POST", cb);
	};

	exports.calcMeisai = function(visitId, cb){
		request("calc_meisai", {visit_id: visitId}, "GET", cb);
	};

	exports.findCharge = function(visitId, cb){
		request("find_charge", {visit_id: visitId}, "GET", cb);
	};

	exports.updateCharge = function(charge, done){
		request("update_charge", JSON.stringify(charge), "POST", done);
	};

	exports.getCharge = function(visitId, cb){
		request("get_charge", {visit_id: visitId}, "GET", cb);
	};

	exports.searchShoubyoumeiMaster = function(text, at, cb){
		request("search_shoubyoumei_master", {text: text, at: at}, "GET", cb);
	};

	exports.searchShuushokugoMaster = function(text, cb){
		request("search_shuushokugo_master", {text: text}, "GET", cb);
	};

	exports.getShoubyoumeiMaster = function(shoubyoumeicode, at, cb){
		request("get_shoubyoumei_master", {shoubyoumeicode: shoubyoumeicode, at: at}, "GET", cb);
	};

	exports.getShuushokugoMaster = function(shuushokugocode, cb){
		request("get_shuushokugo_master", {shuushokugocode: shuushokugocode}, "GET", cb);
	};

	exports.getShoubyoumeiMasterByName = function(name, at, cb){
		request("get_shoubyoumei_master_by_name", {name: name, at: at}, "GET", cb);
	};

	exports.getShuushokugoMasterByName = function(name, cb){
		request("get_shuushokugo_master_by_name", {name: name}, "GET", cb);
	};

	exports.enterDisease = function(shoubyoumeicode, patientId, startDate, shuushokugocodes, cb){
		var data = {
			shoubyoumeicode: shoubyoumeicode,
			patient_id: patientId,
			start_date: startDate,
			shuushokugocodes: shuushokugocodes
		};
		request("enter_disease", JSON.stringify(data), "POST", cb);
	};

	exports.getFullDisease = function(diseaseId, cb){
		request("get_full_disease", {disease_id: diseaseId}, "GET", cb);
	};

	exports.getDisease = function(diseaseId, cb){
		request("get_disease", {disease_id: diseaseId}, "GET", cb);
	};

	exports.batchUpdateDiseases = function(diseases, done){
		request("batch_update_diseases", JSON.stringify(diseases), "POST", done);
	};

	exports.listAllFullDiseases = function(patientId, cb){
		request("list_all_full_diseases", {patient_id: patientId}, "GET", cb);
	};

	exports.updateDiseaseWithAdj = function(disease, done){
		request("update_disease_with_adj", JSON.stringify(disease), "POST", done);
	};

	exports.deleteDiseaseWithAdj = function(diseaseId, done){
		request("delete_disease_with_adj", {disease_id: diseaseId}, "POST", done);
	};

	exports.searchTextForPatient = function(patientId, text, cb){
		request("search_text_for_patient", {patient_id: patientId, text: text}, "GET", cb);
	};

	exports.searchWholeText = function(text, cb){
		request("search_whole_text", {text: text}, "GET", cb);
	};

	// added for pharma

	exports.listFullPharmaQueue = function(cb){
		request("list_full_pharma_queue", {}, "GET", cb);
	};

	exports.listTodaysVisitsForPharma = function(cb){ 
		request("list_todays_visits_for_pharma", {}, "GET", cb);
	};

	exports.listDrugs = function(visitId, cb){
		request("list_drugs", {visit_id: visitId}, "GET", cb);
	};

	exports.listVisits = function(patientId, offset, n, cb){
		request("list_visits", {
			patient_id: patientId,
			offset: offset,
			n: n
		}, "GET", cb);
	};

	exports.listIyakuhinByPatient = function(patientId, cb){
		request("list_iyakuhin_by_patient", {patient_id: patientId}, "GET", cb);
	};

	exports.countVisitsByIyakuhincode = function(patientId, iyakuhincode, cb){
		request("count_visits_by_iyakuhincode", {
			patient_id: patientId,
			iyakuhincode: iyakuhincode
		}, "GET", cb);
	};

	exports.listFullVisitsByIyakuhincode = function(patientId, iyakuhincode, offset, n, cb){
		request("list_full_visits_by_iyakuhincode", {
			patient_id: patientId,
			iyakuhincode: iyakuhincode,
			offset: offset,
			n: n
		}, "GET", cb);
	};

	exports.findPharmaDrug = function(iyakuhincode, cb){
		request("find_pharma_drug", {
			iyakuhincode: iyakuhincode
		}, "GET", cb);
	};

	exports.prescDone = function(visitId, done){
		request("presc_done", {
			visit_id: visitId
		}, "POST", done);
	};

	exports.getDrug = function(drugId, cb){
		request("get_drug", {
			drug_id: drugId
		}, "GET", cb);
	};





/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
	    "use strict";

	    if (global.setImmediate) {
	        return;
	    }

	    var nextHandle = 1; // Spec says greater than zero
	    var tasksByHandle = {};
	    var currentlyRunningATask = false;
	    var doc = global.document;
	    var registerImmediate;

	    function setImmediate(callback) {
	      // Callback can either be a function or a string
	      if (typeof callback !== "function") {
	        callback = new Function("" + callback);
	      }
	      // Copy function arguments
	      var args = new Array(arguments.length - 1);
	      for (var i = 0; i < args.length; i++) {
	          args[i] = arguments[i + 1];
	      }
	      // Store and register the task
	      var task = { callback: callback, args: args };
	      tasksByHandle[nextHandle] = task;
	      registerImmediate(nextHandle);
	      return nextHandle++;
	    }

	    function clearImmediate(handle) {
	        delete tasksByHandle[handle];
	    }

	    function run(task) {
	        var callback = task.callback;
	        var args = task.args;
	        switch (args.length) {
	        case 0:
	            callback();
	            break;
	        case 1:
	            callback(args[0]);
	            break;
	        case 2:
	            callback(args[0], args[1]);
	            break;
	        case 3:
	            callback(args[0], args[1], args[2]);
	            break;
	        default:
	            callback.apply(undefined, args);
	            break;
	        }
	    }

	    function runIfPresent(handle) {
	        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
	        // So if we're currently running a task, we'll need to delay this invocation.
	        if (currentlyRunningATask) {
	            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
	            // "too much recursion" error.
	            setTimeout(runIfPresent, 0, handle);
	        } else {
	            var task = tasksByHandle[handle];
	            if (task) {
	                currentlyRunningATask = true;
	                try {
	                    run(task);
	                } finally {
	                    clearImmediate(handle);
	                    currentlyRunningATask = false;
	                }
	            }
	        }
	    }

	    function installNextTickImplementation() {
	        registerImmediate = function(handle) {
	            process.nextTick(function () { runIfPresent(handle); });
	        };
	    }

	    function canUsePostMessage() {
	        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
	        // where `global.postMessage` means something completely different and can't be used for this purpose.
	        if (global.postMessage && !global.importScripts) {
	            var postMessageIsAsynchronous = true;
	            var oldOnMessage = global.onmessage;
	            global.onmessage = function() {
	                postMessageIsAsynchronous = false;
	            };
	            global.postMessage("", "*");
	            global.onmessage = oldOnMessage;
	            return postMessageIsAsynchronous;
	        }
	    }

	    function installPostMessageImplementation() {
	        // Installs an event handler on `global` for the `message` event: see
	        // * https://developer.mozilla.org/en/DOM/window.postMessage
	        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

	        var messagePrefix = "setImmediate$" + Math.random() + "$";
	        var onGlobalMessage = function(event) {
	            if (event.source === global &&
	                typeof event.data === "string" &&
	                event.data.indexOf(messagePrefix) === 0) {
	                runIfPresent(+event.data.slice(messagePrefix.length));
	            }
	        };

	        if (global.addEventListener) {
	            global.addEventListener("message", onGlobalMessage, false);
	        } else {
	            global.attachEvent("onmessage", onGlobalMessage);
	        }

	        registerImmediate = function(handle) {
	            global.postMessage(messagePrefix + handle, "*");
	        };
	    }

	    function installMessageChannelImplementation() {
	        var channel = new MessageChannel();
	        channel.port1.onmessage = function(event) {
	            var handle = event.data;
	            runIfPresent(handle);
	        };

	        registerImmediate = function(handle) {
	            channel.port2.postMessage(handle);
	        };
	    }

	    function installReadyStateChangeImplementation() {
	        var html = doc.documentElement;
	        registerImmediate = function(handle) {
	            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	            var script = doc.createElement("script");
	            script.onreadystatechange = function () {
	                runIfPresent(handle);
	                script.onreadystatechange = null;
	                html.removeChild(script);
	                script = null;
	            };
	            html.appendChild(script);
	        };
	    }

	    function installSetTimeoutImplementation() {
	        registerImmediate = function(handle) {
	            setTimeout(runIfPresent, 0, handle);
	        };
	    }

	    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
	    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
	    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

	    // Don't get fooled by e.g. browserify environments.
	    if ({}.toString.call(global.process) === "[object process]") {
	        // For Node.js before 0.9
	        installNextTickImplementation();

	    } else if (canUsePostMessage()) {
	        // For non-IE10 modern browsers
	        installPostMessageImplementation();

	    } else if (global.MessageChannel) {
	        // For web workers, where supported
	        installMessageChannelImplementation();

	    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
	        // For IE 6–8
	        installReadyStateChangeImplementation();

	    } else {
	        // For older browsers
	        installSetTimeoutImplementation();
	    }

	    attachTo.setImmediate = setImmediate;
	    attachTo.clearImmediate = clearImmediate;
	}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(4)))

/***/ },
/* 4 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate) {"use strict";

	(function(exports){

	function iterExec(i, funs, done){
		if( i >= funs.length ){
			done();
			return;
		}
		var f = funs[i];
		f(function(err){
			if( err ){
				done(err);
				return;
			}
			iterExec(i+1, funs, done);
		})
	}

	exports.exec = function(funs, done){
		funs = funs.slice();
		iterExec(0, funs, done);
	};

	exports.execPara = function(funs, done){
		if( funs.length === 0 ){
			done();
			return;
		}
		funs = funs.slice();
		var n = funs.length;
		var no_more = false;
		funs.forEach(function(f){
			if( no_more ){
				return;
			}
			f(function(err){
				if( no_more ){
					return;
				}
				if( err ){
					no_more = true;
					done(err);
					return;
				}
				n -= 1;
				if( n === 0 ){
					done();
				}
			})
		})
	}

	function iterForEach(i, arr, fn, done){
		if( i >= arr.length ){
			done();
			return;
		}
		fn(arr[i], function(err){
			if( err ){
				done(err);
				return;
			}
			iterForEach(i+1, arr, fn, done);
		})
	}

	exports.forEach = function(arr, fn, done){
		arr = arr.slice();
		iterForEach(0, arr, fn, done);
	};

	exports.forEachPara = function(arr, fn, done){
		if( arr.length === 0 ){
			done();
			return;
		}
		arr = arr.slice();
		var n = arr.length;
		var no_more = false;
		arr.forEach(function(ele){
			if( no_more ){
				return;
			}
			fn(ele, function(err){
				if( no_more ){
					return;
				}
				if( err ){
					no_more = true;
					done(err);
					return;
				}
				n -= 1;
				if( n === 0 ){
					done();
				}
			})
		});
	};

	function Queue(){
		this.queue = [];
	}

	Queue.prototype.push = function(fn, cb){
		this.queue.push({
			fn: fn,
			cb: cb
		});
		if( this.queue.length === 1 ){
			this.run();
		}
	}

	Queue.prototype.run = function(){
		if( this.queue.length === 0 ){
			return;
		}
		var entry = this.queue[0];
		var fn = entry.fn;
		var cb = entry.cb;
		var self = this;
		fn(function(){
			var args = [].slice.call(arguments);
			cb.apply(undefined, args);
			if( self.queue.length > 0 && self.queue[0] === entry ){
				self.queue.shift();
				self.run();
			}
		})
	}

	var theQueue = new Queue();

	exports.enqueue = function(fn, cb){
		theQueue.push(fn, cb);
	};

	exports.mapPara = function(arr, fn, cb){
		var index = 0;
		var dataArr = arr.map(function(value){
			return {
				index: index++,
				value: value
			}
		});
		var retArr = [];
		exports.forEachPara(dataArr, function(data, done){
			var value = fn(data.value, function(err, result){
				if( err ){
					done(err);
					return;
				}
				retArr[data.index] = result;
				done();
			});
		}, function(err){
			if( err ){
				cb(err);
				return;
			}
			cb(undefined, retArr);
		})
	};

	exports.fetch = function(url, opt, op, cb){
		fetch(url, opt)
		.then(function(response){
			if( response.ok ){
				response[op]()
				.then(function(result){
					cb(undefined, result);
				})
				.catch(function(err){
					cb(err.message);
				})
			} else { 
				response.text()
				.then(function(text){
					cb(text);
				})
				.catch(function(err){
					cb(err.message);
				})
			}
		})
		.catch(function(err){
			cb(err.message);
		})
	}

	exports.fetchJson = function (url, opt, cb){
		exports.fetch(url, opt, "json", function(err, result){
			setImmediate(function(){
				cb(err, result);
			});
		});
	}

	exports.fetchText = function (url, opt, cb){
		exports.fetch(url, opt, "text", function(err, result){
			setImmediate(function(){
				cb(err, result);
			});
		});
	}

	})( true ? exports : (window.conti = {}));

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).setImmediate))

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(4).nextTick;
	var apply = Function.prototype.apply;
	var slice = Array.prototype.slice;
	var immediateIds = {};
	var nextImmediateId = 0;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) { timeout.close(); };

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};

	// That's not how node.js implements it but the exposed api is the same.
	exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
	  var id = nextImmediateId++;
	  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

	  immediateIds[id] = true;

	  nextTick(function onNextTick() {
	    if (immediateIds[id]) {
	      // fn.call() is faster so we optimize for the common use-case
	      // @see http://jsperf.com/call-apply-segu
	      if (args) {
	        fn.apply(null, args);
	      } else {
	        fn.call(null);
	      }
	      // Prevent ids from leaking
	      exports.clearImmediate(id);
	    }
	  });

	  return id;
	};

	exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
	  delete immediateIds[id];
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).setImmediate, __webpack_require__(6).clearImmediate))

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var conti = __webpack_require__(5);

	exports.run = function(fun, cb){
		var f;
		if( fun instanceof Array ){
			f = function(done){
				conti.exec(fun, done);
			};
		} else {
			f = fun;
		}
		conti.enqueue(f, cb);
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.Shohousen = __webpack_require__(9);
	exports.Refer = __webpack_require__(14);
	exports.DrugBag = __webpack_require__(15);
	exports.PrescContent = __webpack_require__(16);




/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var Compiler = __webpack_require__(10).Compiler;
	var Box = __webpack_require__(10).Box;

	function Shohousen(){
		this.compiler = new Compiler();
		this.setup();
	}

	Shohousen.prototype.getOps = function(){
		return this.compiler.getOps();
	};

	Shohousen.prototype.setup = function(){
		var compiler = this.compiler;
		var page = Box.createA5Box();
		var wrap = page.clone().shrinkWidth(1, "left").shiftUp(2).inset(2);
		var r, rr, box2;
		var pat, issue, drugs, memo, chouzai1, chouzai2, patient, clinic;
		this.wrap = wrap;
		//compiler.box(this.wrap);
		compiler.createFont("mincho-5", "MS Mincho", 5);
		compiler.createFont("mincho-4.5", "MS Mincho", 4.5);
		compiler.createFont("mincho-4", "MS Mincho", 4);
		compiler.createFont("mincho-3.5", "MS Mincho", 3.5);
		compiler.createFont("mincho-3", "MS Mincho", 3);
		compiler.createFont("mincho-2.5", "MS Mincho", 2.5);
		compiler.createFont("mincho-2", "MS Mincho", 2);
		compiler.createFont("mincho-1.8", "MS Mincho", 1.8);
		compiler.createFont("mincho-1.5", "MS Mincho", 1.5);
		compiler.createFont("mincho-1.4", "MS Mincho", 1.4);
	    compiler.createFont("gothic-4.5", "MS Gothic", 4.5);
	    compiler.createFont("gothic-4", "MS Gothic", 4);
	    compiler.createFont("gothic-3", "MS Gothic", 3);
		compiler.createFont("gothic-2.5", "MS Gothic", 2.5);
		compiler.setTextColor(0, 255, 0);
		compiler.createPen("default-pen", 0, 255, 0, 0.1);
		compiler.setPen("default-pen");
		this.drawTitle();
		r = wrap.clone().shiftDown(13).setHeight(10.5, "top");
		rr = r.splitToColumns(62);
		this.frameKouhi(rr[0].shrinkWidth(2, "left"));
		this.frameHoken(rr[1]);
		box2 = wrap.clone().setTop(r.bottom()+2).setHeight(154.5, "top");
		rr = box2.splitToRows(18, 24.5, 109, 143, 149.5);
		pat = rr[0];
		issue = rr[1];
		drugs = rr[2];
		memo = rr[3];
		chouzai1 = rr[4];
		chouzai2 = rr[5];
		rr = pat.splitToColumns(55);
		patient = rr[0];
		clinic = rr[1].shrinkWidth(1, "right");
		this.framePatient(patient);
		this.frameClinic(clinic);
		this.frameIssue(issue);
		this.frameDrugs(drugs);
		this.frameMemo(memo);
		this.frameChouzai1(chouzai1);
		this.frameChouzai2(chouzai2);
		r = wrap.clone();
		r.setTop(box2.bottom() + 1);
		r.setHeight(24.5, "top");
		this.framePharmacy(r);
	};

	Shohousen.prototype.drawTitle = function(){
		var c = this.compiler;
		var b = this.wrap.clone();
		b.shiftDown(1).setLeft(51).setRight(93);
		c.setFont("mincho-5");
		c.textAtJustified("処方せん", b.left(), b.right(), b.top(), "top");
		b.shiftDown(6);
		c.setFont("mincho-2.5");
		c.textIn("(この処方せんは、どの保険薬局でも有効です。)", b, "center", "top");
	};

	Shohousen.prototype.frameKouhi = function(r){
		var c = this.compiler;
		var rr = r.splitToEvenRows(2);
		var row1 = rr[0], row2 = rr[1], cc;
		c.box(row1);
		cc = row1.splitToColumns(14.3);
		c.frameRight(cc[0]);
		c.setFont("mincho-2");
		c.textAtJustified("公費負担者番号", cc[0].left()+0.5, cc[0].right()-0.5, cc[0].cy(), "center");
		c.setBox("futanshaBangou", cc[1]);
		c.drawEvenInnerColumnBorders(cc[1], 8);
		row2.shrinkWidth(cc[1].width()/8, "left");
		c.box(row2);
		cc = row2.splitToColumns(14.3);
		c.frameRight(cc[0]);
		c.textAtJustified("公費負担医療", cc[0].left()+0.5, cc[0].right()-0.5, cc[0].top()+cc[0].height()/4, "center");
		c.textAtJustified("の受給者番号", cc[0].left()+0.5, cc[0].right()-0.5, cc[0].top()+cc[0].height()/4*3, "center");
		c.setBox("jukyuushaBangou", cc[1]);
		c.drawEvenInnerColumnBorders(cc[1], 7);
	}

	Shohousen.prototype.frameHoken = function(r){
		var c = this.compiler;
		var rr = r.splitToEvenRows(2);
		var upper = rr[0], lower = rr[1], left, right;
		upper.setWidth(58, "left");
		c.box(upper);
		rr = upper.splitToColumns(13);
		left = rr[0];
		right = rr[1];
		c.frameRight(left);
		c.setFont("mincho-2");
		c.textAtJustified("保険者番号", left.left()+0.5, left.right()-0.5, left.cy(), "center");
		c.setBox("hokenshaBangou", right);
		c.drawEvenInnerColumnBorders(right, 8);
		c.box(lower);
		rr = lower.splitToColumns(13);
		left = rr[0];
		right = rr[1];
		c.setBox("hihokensha", right);
		c.frameRight(left);
		c.setFont("mincho-1.4");
		c.textAtJustified("被保険者証・被保険", left.left()+0.5, left.right()-0.5, left.top()+left.height()/4, "center");
		c.textAtJustified("者手帳の記号・番号", left.left()+0.5, left.right()-0.5, left.top()+left.height()/4*3, "center");
	}

	Shohousen.prototype.framePatient = function(r){
		var c = this.compiler;
		var p, rr, upper, middle, lower, dd;
		c.box(r);
		p = r.clone();
		p.setWidth(4, "left");
		c.frameRight(p);
		c.setFont("mincho-2.5");
		c.textAtVertJustified("患者", p.cx(), p.top()+4, p.bottom()-4, "center");
		p.setLeft(p.right()).setRight(r.right());
		rr = p.splitToRows(9.5, 13.8);
		c.frameBottom(rr[0]);
		c.frameBottom(rr[1]);
		upper = rr[0];
		middle = rr[1];
		lower = rr[2];
		rr = upper.splitToColumns(10.5);
		p = rr[0];
		c.setBox("patientName", rr[1]);
		c.frameRight(p);
		c.setFont("mincho-2.5");
		c.textAtJustified("氏名", p.left()+2, p.right()-2, p.cy(), "center");
		rr = middle.splitToColumns(10.5, 39);
		p = rr[0];
		c.frameRight(p);
		c.setFont("mincho-2");
		c.textAtJustified("生年月日", p.left()+0.5, p.right()-0.5, p.cy(), "center");
		p = rr[1];
		c.frameRight(p);
		dd = p.splitToColumns(9, 17, 25);
		c.setBox("birthdayYear", dd[0]);
		c.setBox("birthdayMonth", dd[1]);
		c.setBox("birthdayDay", dd[2]);
		this.labelDate(dd);
		p = rr[2];
		dd = p.splitToEvenColumns(3);
		c.setBox("sexMale", dd[0]);
		c.setBox("sexFemale", dd[2]);
		c.textIn("男", dd[0], "center", "center");
		c.textIn("・", dd[1], "center", "center");
		c.textIn("女", dd[2], "center", "center");
		rr = lower.splitToColumns(10.5, 24, 37.3);
		c.setBox("patientHihokensha", rr[1]);
		c.setBox("patientHifuyousha", rr[2]);
		c.setBox("patientFutan", rr[3].clone().shrinkWidth(4, "left"));
		c.drawInnerColumnBorders(rr);
		c.setFont("mincho-2.5");
		c.textAtJustified("区分", rr[0].left()+2, rr[0].right()-2, rr[0].cy(), "center");
		c.textIn("被保険者", c.getBox("patientHihokensha").clone().inset(1.5, 0), "justified", "center");
		c.textIn("被扶養者", c.getBox("patientHifuyousha").clone().inset(1.5, 0), "justified", "center");
		c.textIn("割", c.getBox("patientFutan").clone().shiftToRight(3), "right", "center");
	};

	Shohousen.prototype.frameClinic = function(box){
		var c = this.compiler;
		var rr = box.splitToRows(9.5, 13.8);
		var upper = rr[0];
		var middle = rr[1];
		var lower = rr[2];
		rr = upper.splitToColumns(11);
		var p = rr[0];
		c.setBox("clinicInfo", rr[1]);
		p.shrinkHeight(1.5, "bottom");
		p.shrinkHeight(0.5, "bottom");
		var pp = p.splitToEvenRows(3);
		c.setFont("mincho-1.5");
		c.textIn("保険医療機関", pp[0], "justified", "top");
		c.setFont("mincho-1.8");
		c.textIn("の所在地", pp[1], "justified", "center");
		c.textIn("及び名称", pp[2], "justified", "bottom");
		rr = middle.splitToColumns(11);
		c.setBox("clinicPhone", rr[1]);
		c.textIn("電話番号", rr[0], "justified", "center");
		rr = lower.splitToColumns(11);
		c.setBox("clinicDoctor", rr[1]);
		c.textIn("保険医氏名", rr[0], "justified", "center");
		c.setBox("clinicHanko", new Box(
			box.left() + 53.5+7, box.bottom() - 5.5, box.left() + 56.5+7, box.bottom() - 2.5));
		c.textIn("印", c.getBox("clinicHanko"), "center", "center");
	};

	Shohousen.prototype.frameIssue = function(box){
		var c = this.compiler;
		c.box(box);
		var rr = box.splitToColumns(14.5, 55, 71.5);
		c.setFont("mincho-2.5");
		c.frameRight(rr[0]);
		c.frameRight(rr[1]);
		c.frameRight(rr[2]);
		c.textIn("交付年月日", rr[0].clone().inset(0.5, 0), "justified", "center");
		var pp = rr[1].splitToColumns(16, 24, 32);
		c.setBox("issueYear", pp[0]);
		c.setBox("issueMonth", pp[1]);
		c.setBox("issueDay", pp[2]);
		c.setFont("mincho-2");
		this.labelDate(pp);
		pp = rr[2].splitToEvenRows(2);
		c.textIn("処方せんの", pp[0].inset(0.5, 0), "justified", "center");
		c.textIn("使用期間", pp[1].inset(0.5, 0), "justified", "center");
		var b = rr[3];
		rr = b.splitToColumns(16, 25, 35);
		c.setBox("validYear", rr[0]);
		c.setBox("validMonth", rr[1]);
		c.setBox("validDay", rr[2]);
		this.labelDate(rr);
		b.shrinkWidth(40, "right");
		b.inset(1.5, 0);
		rr = b.splitToEvenRows(3);
		c.setFont("mincho-1.8");
		c.textIn("特に記載のある場合を除き、", rr[0], "center", "center");
		c.textIn("交付の日を含めて４日以内に保", rr[1], "center", "center");
		c.textIn("険薬局に提出すること。", rr[2], "center", "center");
	};

	Shohousen.prototype.frameDrugs = function(box){
		var c = this.compiler;
		c.box(box);
		var rr = box.splitToColumns(4);
		c.frameRight(rr[0]);
		c.setFont("mincho-2.5");
		c.textIn("処方", rr[0].clone().inset(0, 24), "center", "justified", "vertical");
		c.setBox("drugsPane", rr[1]);
	};

	Shohousen.prototype.frameMemo = function(r){
		var c = this.compiler;
		c.box(r);
		var rr = r.splitToColumns(4);
		c.frameRight(rr[0]);
		c.setFont("mincho-2.5");
		c.textIn("備考", rr[0].clone().inset(0, 7), "center", "justified", "vertical");
		c.setBox("memoPane", rr[1]);
	};

	Shohousen.prototype.frameChouzai1 = function(r){
		var c = this.compiler;
		c.box(r);
		var rr = r.splitToColumns(14.5, 82, 95.5);
		c.drawInnerColumnBorders(rr);
		c.setFont("mincho-2");
		c.textIn("調剤年月日", rr[0].clone().inset(1, 0), "justified", "center");
		var dd = rr[1].splitToColumns(28, 41, 53);
		this.labelDate(dd);
		c.setFont("mincho-1.5");
		c.textIn("公費負担者番号", rr[2].clone().inset(0.5, 0), "justified", "center");
		c.setBox("futanshaBangou2", rr[3]);
		c.drawEvenInnerColumnBorders(rr[3], 8);
	};

	Shohousen.prototype.frameChouzai2 = function(r){
		var c = this.compiler;
		var rr = r.splitToColumns(14.5, 82, 95.5);
		c.drawInnerColumnBorders(rr);
		c.setFont("mincho-2");
		var cc = rr[0].splitToEvenRows(3);
		c.setFont("mincho-1.5");
		c.textIn("保険薬局の所在", cc[0].clone().inset(0.5, 0), "justified", "center");
		c.textIn("地及び名称", cc[1].clone().inset(0.5, 0), "justified", "center");
		c.textIn("保険薬剤師氏名", cc[2].clone().inset(0.5, 0), "justified", "center");
		c.setFont("mincho-2");
		c.textIn("印", rr[1].clone().shiftToRight(59), "left", "center");
		c.setFont("mincho-1.5");
		cc = rr[2].clone().inset(0.5, 0).splitToEvenRows(2);
		c.textIn("公費負担医療", cc[0], "justified", "center");
		c.textIn("の受給者番号", cc[1], "justified", "center");
		var bb = rr[3].splitToEvenColumns(8);
		c.setBox("jukyuushaBangou2", rr[3]);
		c.getBox("jukyuushaBangou2").setRight(bb[7].left());
		c.drawEvenInnerColumnBorders(c.getBox("jukyuushaBangou2"), 7);
		r.setRight(bb[7].left());
		c.box(r);
	};

	Shohousen.prototype.framePharmacy = function(r){
		var c = this.compiler;
		var rr = r.splitToColumns(85);
		var left = rr[0];
		var right = rr[1];
		c.box(left);
		c.box(right);
		c.setFont("mincho-2");

		var pp = left.splitToRows(3, 10, 17);
		c.frameBottom(pp[0]);
		c.frameBottom(pp[1]);
		c.frameBottom(pp[2]);
		var qq = pp[0].splitToColumns(11.5, 27.8, 47, 57.3, 76.5);
		for (var i = 0; i < 5; i++)
			c.frameRight(qq[i]);
		c.textIn("調剤料", qq[0].clone().inset(1, 0), "justified", "center");
		c.textIn("薬剤料", qq[1].clone().inset(3, 0), "justified", "center");
		c.textIn("計", qq[2], "center", "center");
		c.textIn("調剤数量", qq[3].clone().inset(0.5, 0), "justified", "center");
		c.textIn("合計", qq[4].clone().inset(4, 0), "justified", "center");
		c.textIn("加算", qq[5].clone().inset(1.5, 0), "justified", "center");
		for (var j = 1; j <= 3; j++) {
			qq = pp[j].splitToColumns(11.5, 27.8, 47, 57.3, 76.5);
			for (var i = 0; i < 5; i++)
				c.frameRight(qq[i]);
		}

		pp = right.splitToRows(3, 10, 13);
		for (var i = 0; i < 3; i++)
			c.frameBottom(pp[i]);
		qq = pp[0].splitToColumns(19.5, 39);
		for (var i = 0; i < 2; i++)
			c.frameRight(qq[i]);
		c.textIn("調剤基本料", qq[0].clone().inset(2, 0), "justified", "center");
		c.textIn("管理指導料", qq[1].clone().inset(2, 0), "justified", "center");
		c.textIn("総合計", qq[2].clone().inset(2, 0), "justified", "center");
		qq = pp[1].splitToColumns(19.5, 39);
		for (var i = 0; i < 2; i++)
			c.frameRight(qq[i]);
		qq = pp[2].splitToColumns(19.5, 39);
		for (var i = 0; i < 2; i++)
			c.frameRight(qq[i]);
		c.textIn("患者負担金", qq[0].clone().inset(2, 0), "justified", "center");
		c.textIn("請求金額", qq[1].clone().inset(2, 0), "justified", "center");
		c.textIn("調剤済印", qq[2].clone().inset(2, 0), "justified", "center");
		qq = pp[3].splitToColumns(19.5, 39);
		for (var i = 0; i < 2; i++)
			c.frameRight(qq[i]);
	};

	Shohousen.prototype.labelDate = function(cols){
		var c = this.compiler;
		var offset = 1;
		c.textIn("年", cols[0].clone().flipRight().shiftToRight(offset), "left", "center");
		c.textIn("月", cols[1].clone().flipRight().shiftToRight(offset), "left", "center");
		c.textIn("日", cols[2].clone().flipRight().shiftToRight(offset), "left", "center");
	};

	Shohousen.prototype.setHakkouKikan = function(address, name, phone, kikancode){
		var c = this.compiler;
		var clinic_info = c.getBox("clinicInfo");
		var clinic_phone = c.getBox("clinicPhone");
		var r = clinic_info.clone().shift(2, 1);
	    c.setTextColor(0, 255, 0);
		c.setFont("mincho-3");
		c.textIn(address, r, "left", "top");
		r.shift(4, 4);
		c.setFont("mincho-4");
		c.textIn(name, r, "left", "top");
		var rr = r.clone();
		rr.shrinkWidth(34, "right");
		rr.shrinkHeight(0.5, "bottom");
		c.setFont("mincho-3");
		c.textIn("(機関コード " + kikancode + ")", rr, "left", "top");
		r = clinic_phone.clone().shift(6, 0);
		c.setFont("mincho-3");
		c.textIn(phone, r, "left", "top");
	};

	Shohousen.prototype.setDoctor = function(name){
		var c = this.compiler;
		var clinic_doctor = c.getBox("clinicDoctor");
		var r = clinic_doctor.clone().shift(35, 0);
	    c.setTextColor(0, 255, 0);
		c.setFont("mincho-3.5");
		c.textIn(name, r, "left", "top");
	};

	Shohousen.prototype.setHokenshaBangou = function(str){
		var c = this.compiler;
		var hokensha_bangou = c.getBox("hokenshaBangou");
		var box = hokensha_bangou.clone();
	    c.setTextColor(0, 0, 0);
		c.setFont("gothic-4");
		c.textInEvenColumns(str, box, 8, "right");
	};

	Shohousen.prototype.setHihokensha = function(str){
		var c = this.compiler;
		var box = c.getBox("hihokensha").clone();
		box.shrinkWidth(5, "right");
	    c.setTextColor(0, 0, 0);
		c.setFont("gothic-4");
		c.textIn(str, box, "left", "center");
	};

	Shohousen.prototype.setKouhi1Futansha = function(str){
		var c = this.compiler;
		var box = c.getBox("futanshaBangou");
	    c.setTextColor(0, 0, 0);
		c.setFont("gothic-4");
		c.textInEvenColumns(str, box, 8, "right");
	};

	Shohousen.prototype.setKouhi1Jukyuusha = function(str){
		var c = this.compiler;
		var box = c.getBox("jukyuushaBangou");
	    c.setTextColor(0, 0, 0);
		c.setFont("gothic-4");
		c.textInEvenColumns(str, box, 7, "right");
	};

	Shohousen.prototype.setKouhi2Futansha = function(str){
		var c = this.compiler;
		var box = c.getBox("futanshaBangou2");
	    c.setTextColor(0, 0, 0);
		c.setFont("gothic-4");
		c.textInEvenColumns(str, box, 8, "right");
	};

	Shohousen.prototype.setKouhi2Jukyuusha = function(str){
		var c = this.compiler;
		var box = c.getBox("jukyuushaBangou2");
	    c.setTextColor(0, 0, 0);
		c.setFont("gothic-4");
		c.textInEvenColumns(str, box, 7, "right");
	};

	Shohousen.prototype.setShimei = function(str, nameSmaller){
		var c = this.compiler;
		var box = c.getBox("patientName").clone();
		box.shrinkWidth(2, "right");
		var size = 4.5;
		if (nameSmaller)
			size = 3.5;
	    c.setTextColor(0, 0, 0);
		c.setFont("mincho-" + size);
	    c.textIn(str, box, "left", "center");
	};

	Shohousen.prototype.setBirthday = function(nen, tsuki, hi){
		var c = this.compiler;
	    c.setTextColor(0, 0, 0);
	    c.setFont("gothic-2.5");
	    var box = c.getBox("birthdayYear");
	    c.textIn("" + nen, box, "right", "center");
	    box = c.getBox("birthdayMonth");
	    c.textIn("" + tsuki, box, "right", "center");
	    box = c.getBox("birthdayDay");
	    c.textIn("" + hi, box, "right", "center");
	};

	Shohousen.prototype.setSexMale = function(){
		var c = this.compiler;
	    c.setTextColor(0, 0, 0);
	    c.setFont("gothic-3");
	    var box = c.getBox("sexMale");
	    c.textIn("○", box.clone().shiftUp(0.3), "center", "center");
	};

	Shohousen.prototype.setSexFemale = function(){
		var c = this.compiler;
	    c.setTextColor(0, 0, 0);
	    c.setFont("gothic-3");
	    var box = c.getBox("sexFemale");
	    c.textIn("○", box.clone().shiftUp(0.3), "center", "center");
	};

	Shohousen.prototype.setKubunHihokensha = function(){
		var c = this.compiler;
	    c.setTextColor(0, 0, 0);
	    c.setFont("gothic-3");
	    var box = c.getBox("patientHihokensha");
	    c.textIn("○", box.clone().shiftUp(0.3), "center", "center");
	};

	Shohousen.prototype.setKubunHifuyousha = function(){
		var c = this.compiler;
	    c.setTextColor(0, 0, 0);
	    c.setFont("gothic-3");
	    var box = c.getBox("patientHifuyousha");
	    c.textIn("○", box.clone().shiftUp(0.3), "center", "center");
	};

	Shohousen.prototype.setFutanwari = function(str){
		var c = this.compiler;
	    c.setTextColor(0, 0, 0);
		c.setFont("gothic-3");
		var box = c.getBox("patientFutan");
		c.textIn("" + str, box, "right", "center");
	};

	Shohousen.prototype.setKoufuDate = function(nen, tsuki, hi){
		var c = this.compiler;
	    c.setTextColor(0, 0, 0);
	    c.setFont("gothic-2.5");
	    var box = c.getBox("issueYear");
	    c.textIn("" + nen, box, "right", "center");
	    box = c.getBox("issueMonth");
	    c.textIn("" + tsuki, box, "right", "center");
	    box = c.getBox("issueDay");
	    c.textIn("" + hi, box, "right", "center");
	};

	Shohousen.prototype.setValidUptoDate = function(nen, tsuki, hi){
		var c = this.compiler;
	    c.setTextColor(0, 0, 0);
	    c.setFont("gothic-2.5");
	    var box = c.getBox("validYear");
	    c.textIn("" + nen, box, "right", "center");
	    box = c.getBox("validMonth");
	    c.textIn("" + tsuki, box, "right", "center");
	    box = c.getBox("validDay");
	    c.textIn("" + hi, box, "right", "center");
	};

	Shohousen.prototype.setDrugs = function(text){
		var c = this.compiler;
		var lines = text.trim().split(/\s*(?:\r\n|\r|\n)/g);
		if( lines[0] === "院外処方" ){
			lines = lines.slice(1);
		}
		if( lines.length > 0 ){
			lines.push("------以下余白------");
		}
		c.setTextColor(0, 0, 0);
		c.setFont("gothic-4.5");
		c.multilineText(lines, c.getBox("drugsPane"), "left", "top");
	};

	module.exports = Shohousen;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var Ops = __webpack_require__(11);
	var Box = __webpack_require__(12);
	var Compiler = __webpack_require__(13);

	exports.op = Ops;
	exports.Box = Box;
	exports.Compiler = Compiler;




/***/ },
/* 11 */
/***/ function(module, exports) {

	"use strict";

	exports.moveTo = function(x, y){
		return ["move_to", x, y];
	};

	exports.lineTo = function(x, y){
		return ["line_to", x, y];
	}

	exports.createFont = function(name, fontName, size, weight, italic){
		weight = weight ? 1 : 0;
		italic = italic ? 1 : 0;
		return ["create_font", name, fontName, size, weight, italic];
	};

	exports.setFont = function(name){
		return ["set_font", name];
	};

	exports.drawChars = function(chars, x_or_xs, y_or_ys){
		return ["draw_chars", chars, x_or_xs, y_or_ys];
	}

	// exports.drawText = function(text, x, y, halign, valign){
	// 	return ["draw_text", text, x, y, halign, valign];
	// };

	// exports.drawTextJustified = function(text, left, right, y, valign){
	// 	return ["draw_text_justified", text, left, right, y, valign];
	// };

	exports.setTextColor = function(r, g, b){
		return ["set_text_color", r, g, b];
	};

	exports.createPen = function(name, r, g, b, opt_width){
		var width = opt_width === undefined ? 0.1 : opt_width;
		return ["create_pen", name, r, g, b, width];
	};

	exports.setPen = function(name){
		return ["set_pen", name];
	};


/***/ },
/* 12 */
/***/ function(module, exports) {

	"use strict";

	function Box(left, top, right, bottom){
		this.left_ = left;
		this.top_ = top;
		this.right_ = right;
		this.bottom_ = bottom;
	}

	Box.prototype.clone = function(){
		return new Box(this.left_, this.top_, this.right_, this.bottom_);
	}

	Box.prototype.innerBox = function(left, top, right, bottom){
		return new Box(this.left_ + left, this.top_ + top, this.left_ + right, this.top_ + bottom);
	};

	Box.prototype.left = function(){
		return this.left_;
	};

	Box.prototype.top = function(){
		return this.top_;
	};

	Box.prototype.right = function(){
		return this.right_;
	};

	Box.prototype.bottom = function(){
		return this.bottom_;
	};

	Box.prototype.width = function(){
		return this.right_ - this.left_;
	};

	Box.prototype.height = function(){
		return this.bottom_ - this.top_;
	};

	Box.prototype.cx = function(){
		return (this.left_ + this.right_)/2;
	};

	Box.prototype.cy = function(){
		return (this.top_ + this.bottom_)/2;
	};

	Box.prototype.setLeft = function(left){
		this.left_ = left;
		return this;
	};

	Box.prototype.displaceLeftEdge = function(dx){
	    this.left_ += dx;
	    return this;
	}

	Box.prototype.setTop = function(top){
		this.top_ = top;
		return this;
	}

	Box.prototype.setRight = function(right){
		this.right_ = right;
		return this;
	};

	Box.prototype.displaceRightEdge = function(dx){
	    this.right_ += dx;
	    return this;
	}

	Box.prototype.setBottom = function(bottom){
		this.bottom_ = bottom;
		return this;
	}

	Box.prototype.inset = function(dx, dy){
		if( dy === undefined ){
			dy = dx;
		}
		this.left_ += dx;
		this.top_ += dy;
		this.right_ -= dx;
		this.bottom_ -= dy;
		return this;
	};

	Box.prototype.inset4 = function(dxLeft, dyTop, dxRight, dyBottom){
		this.left_ += dxLeft;
		this.top_ += dyTop;
		this.right_ -= dxRight;
		this.bottom_ -= dyBottom;
		return this;
	};

	Box.prototype.shift = function(dx, dy){
		this.left_ += dx;
		this.top_ += dy;
		this.right_ += dx;
		this.bottom_ += dy;	
		return this;
	};

	Box.prototype.shiftUp = function(dy){
		return this.shift(0, -dy);
	};

	Box.prototype.shiftDown = function(dy){
		return this.shift(0, dy);
	};

	Box.prototype.shiftToRight = function(dx){
		return this.shift(dx, 0);
	}

	Box.prototype.shiftToLeft = function(dx){
		return this.shift(-dx, 0);
	}

	Box.prototype.shrinkWidth = function(dx, anchor){
		var half;
		switch(anchor){
			case "left": this.right_ -= dx; break;
			case "center": half = dx/2; this.left_ += dx; this.right_ -= dx; break;
			case "right": this.left_ += dx; break;
			default: throw new Error("invalid anchor:" + anchor);
		}
		return this;
	};

	Box.prototype.shrinkHeight = function(dy, anchor){
		var half;
		switch(anchor){
			case "top": this.bottom_ -= dy; break;
			case "center":
				half = dy/2;
				this.top_ += half;
				this.bottom_ -= half;
				break;
			case "bottom": this.top_ += dy; break;
			default: throw new Error("invalid anchor:" + anchor);
		}
		return this;
	}

	Box.prototype.setWidth = function(width, anchor){
		switch(anchor){
			case "left": this.right_ = this.left_ + width; break;
			case "center": 
				this.left_ = this.cx() - width/2;
				this.right_ = this.left_ + width;
				break;
			case "right": this.left_ = this.right_ - width; break;
			default: throw new Error("invalid anchor:" + anchor);
		}
		return this;
	}

	Box.prototype.setHeight = function(height, anchor){
		switch(anchor){
			case "top": this.bottom_ = this.top_ + height; break;
			case "center": 
				this.top_ = this.cy() - height/2;
				this.bottom_ = this.top_ + height;
				break;
			case "bottom": this.top_ = this.bottom_ - height; break;
			default: throw new Error("invalid anchor:" + anchor);
		}
		return this;
	};

	Box.prototype.flipRight = function(){
		var w = this.width();
		this.left_ = this.right_;
		this.right_ = this._left + w;
		return this;
	}

	Box.prototype.splitToColumns = function(){
		var divs = Array.prototype.slice.apply(arguments);
		var boxes = [], i, n = divs.length, left, top, right, bottom;
		top = this.top_;
		bottom = this.bottom_;
		for(i=0;i<=n;i++){
			left = this.left_ + (i === 0 ? 0 : divs[i-1]);
			right = i === n ? this.right_ : (this.left_ + divs[i]);
			boxes.push(new Box(left, top, right, bottom));
		}
		return boxes;
	};

	Box.prototype.splitToRows = function(){
		var divs = Array.prototype.slice.apply(arguments);
		var boxes = [], i, n = divs.length, left, top, right, bottom;
		left = this.left_;
		right = this.right_;
		for(i=0;i<=n;i++){
			top = this.top_ + (i === 0 ? 0 : divs[i-1]);
			bottom = i === n ? this.bottom_ : (this.top_ + divs[i]);
			boxes.push(new Box(left, top, right, bottom));
		}
		return boxes;
	};

	Box.prototype.splitToEvenColumns = function(nCols){
		var w = this.width() / nCols, divs = [], i;
		for(i=1;i<nCols;i++){
			divs.push(w*i);
		}
		return this.splitToColumns.apply(this, divs);
	}

	Box.prototype.splitToEvenRows = function(nRows){
		var h = this.height() / nRows, divs = [];
		var i;
		for(i=1;i<nRows;i++){
			divs.push(h*i);
		}
		return this.splitToRows.apply(this, divs);
	}

	Box.prototype.splitToEvenCells = function(nrows, ncols){
	    var rows = this.splitToEvenRows(nrows);
	    return rows.map(function(row){
	        return row.splitToEvenColumns(ncols);
	    });
	}

	function boundingBox2(a, b){
		var left = Math.min(a.left(), b.left());
		var top = Math.min(a.top(), b.top());
		var right = Math.max(a.right(), b.right());
		var bottom = Math.max(a.bottom(), b.bottom());
		return new Box(left, top, right, bottom);
	}

	Box.boundingBox = function(){
		var args = Array.prototype.slice.call(arguments);
		return args.reduce(function(curr, box){
			if( curr === null ) return box;
			return boundingBox2(curr, box);
		}, null);
	}

	var PAPER_A4 = [210, 297];  // mm
	var PAPER_A5 = [148, 210];
	var PAPER_A5_landscape = [210, 148];
	var PAPER_A6 = [105, 148];
	var PAPER_B4 = [257, 364];
	var PAPER_B5 = [182, 257];

	Box.createA4Box = function(){
		return new Box(0, 0, PAPER_A4[0], PAPER_A4[1]);
	}

	Box.createA5Box = function(){
		return new Box(0, 0, PAPER_A5[0], PAPER_A5[1]);
	}

	Box.createA5LandscapeBox = function(){
		return new Box(0, 0, PAPER_A5_landscape[0], PAPER_A5_landscape[1]);
	}

	Box.createA6Box = function(){
		return new Box(0, 0, PAPER_A6[0], PAPER_A6[1]);
	}

	Box.createB4Box = function(){
		return new Box(0, 0, PAPER_B4[0], PAPER_B4[1]);
	}

	Box.createB5Box = function(){
		return new Box(0, 0, PAPER_B5[0], PAPER_B5[1]);
	}

	module.exports = Box;




/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var drawerOps = __webpack_require__(11);
	var Box = __webpack_require__(12);

	function DrawerCompiler(){
	    this.ops = [];
	    this.fontDict = {}; // name => size
	    this.pointDict = {};
	    this.boxDict = {};
	    this.currentFontSize = null;
	}

	module.exports = DrawerCompiler;

	function sum(list, key){
	    return list.reduce(function(val, item){
	        if( key === undefined ){
	            return val + item;
	        } else {
	            return val + item[key];
	        }
	    }, 0);
	}

	function isHankaku(code){
	    return (code >= 0xff61 && code <= 0xff64) ||
	        (code >= 0xff65 && code <= 0xff9f) ||
	        (code >= 0xffa0 && code <= 0xffdc) ||
	        (code >= 0xffe8 && code <= 0xffee);
	}

	function charWidth(code, fontSize){
	    if( code < 256 || isHankaku(code) ){
	        return fontSize/2;
	    } else {
	        return fontSize;
	    }
	}

	function measureChars(str, fontSize){
	    return str.split("").map(function(ch){
	        return {
	            ch: ch,
	            width: charWidth(ch.charCodeAt(0), fontSize)
	        }
	    })
	}

	function calcTotalWidth(mes){
	    return sum(mes, "width");
	}

	DrawerCompiler.measureChars = measureChars;

	function min(args){
	    return Math.min.apply(Math, args);
	}

	function max(args){
	    return Math.max.apply(Math, args);
	}

	function breakLines(str, width, fontSize){
	    var parts = measureChars(str, fontSize);
	    var i, len;
	    var lines = [];
	    var curChars = [], curWidth = 0, nextWidth, part;
	    for(i=0,len=parts.length;i<len;){
	        part = parts[i];
	        if( curWidth === 0 ){
	            if( part.ch === " " ){
	                i += 1;
	            } else {
	                curChars.push(part.ch);
	                curWidth = part.width;
	                i += 1;
	            }
	        } else {
	            nextWidth = curWidth + part.width;
	            if( nextWidth > width ){
	                lines.push(curChars.join(""));
	                curChars = [];
	                curWidth = 0;
	            } else {
	                curChars.push(part.ch);
	                curWidth = nextWidth;
	                i += 1;
	            }
	        }
	    }
	    if( curChars.length > 0 ){
	        lines.push(curChars.join(""));
	    }
	    if( lines.length === 0 ){
	        lines = [""];
	    }
	    return lines;
	}

	DrawerCompiler.breakLines = breakLines;

	DrawerCompiler.prototype.getOps = function(){
	    return this.ops;
	}

	DrawerCompiler.prototype.moveTo = function(x, y){
	    this.ops.push(drawerOps.moveTo(x, y));
	};

	DrawerCompiler.prototype.lineTo = function(x, y){
	    this.ops.push(drawerOps.lineTo(x, y));
	};

	DrawerCompiler.prototype.line = function(x1, y1, x2, y2){
	    this.moveTo(x1, y1);
	    this.lineTo(x2, y2);
	};

	DrawerCompiler.prototype.rectangle = function(left, top, right, bottom){
	    this.moveTo(left, top);
	    this.lineTo(right, top);
	    this.lineTo(right, bottom);
	    this.lineTo(left, bottom);
	    this.lineTo(left, top);
	};

	DrawerCompiler.prototype.box = function(box){
	    this.rectangle(box.left(), box.top(), box.right(), box.bottom());
	}

	DrawerCompiler.prototype.createFont = function(name, fontName, fontSize, weight, italic){
	    if( name in this.fontDict ) return;
	    this.ops.push(drawerOps.createFont(name, fontName, fontSize, weight, italic));
	    this.fontDict[name] = fontSize;
	};

	DrawerCompiler.prototype.setFont = function(name){
	    this.ops.push(drawerOps.setFont(name));
	    this.currentFontSize = this.fontDict[name];
	};

	function composeXs(mes, left, extra){
	    var i, n = mes.length, xs = [];
	    for(i=0;i<n;i++){
	        xs.push(left);
	        left += mes[i].width;
	        if( extra ){
	            left += extra;
	        }
	    }
	    return xs;
	}

	function composeYs(nchars, top, fontSize, extra){
	    var ys = [];
	    var i;
	    for(i=0;i<nchars;i++){
	        ys.push(top);
	        top += fontSize;
	        if( extra ){
	            top += extra;
	        }
	    }
	    return ys;
	}

	DrawerCompiler.prototype.textAt = function(text, x, y, halign, valign, opt){
	    if( opt === undefined ) opt = {};
	    var extraSpace = opt.extraSpace || 0;
	    var fontSize = this.getCurrentFontSize();
	    var mes = measureChars(text, fontSize);
	    var totalWidth = sum(mes, "width") + (text.length > 1 ? (text.length - 1) * extraSpace : 0);
	    var left, top;
	    switch(halign){
	        case "left": left = x; break;
	        case "center": left = x - totalWidth/2.0; break;
	        case "right": left = x - totalWidth; break;
	        default: throw new Error("invalid halign: " + halign);
	    }
	    switch(valign){
	        case "top": top = y; break;
	        case "center": top = y - fontSize/2; break;
	        case "bottom": top = y - fontSize; break;
	        default: throw new Error("invalid valign: " + valign);
	    }
	    var xs = composeXs(mes, left, extraSpace);
	    var ys = top;
	    this.ops.push(drawerOps.drawChars(text, xs, ys));
	    return new Box(left, top, left + totalWidth, top + fontSize);
	}

	DrawerCompiler.prototype.textAtJustified = function(text, left, right, y, valign){
	    var fontSize = this.getCurrentFontSize();
	    var mes = measureChars(text, fontSize);
	    var totalWidth = sum(mes, "width");
	    var top, extra, xs;
	    if( text.length < 2 ){
	        return this.textAt(text, left, y, "left", valign);
	    } else {
	        switch(valign){
	            case "top": top = y; break;
	            case "center": top = y - fontSize/2; break;
	            case "bottom": top = y - fontSize; break;
	            default: throw new Error("invalid valign: " + valign);
	        }
	        extra = ((right - left) - totalWidth) / (text.length - 1);
	        xs = composeXs(mes, left, extra);
	        this.ops.push(drawerOps.drawChars(text, xs, top));
	        return new Box(left, top, right, top + fontSize);
	    }
	}

	DrawerCompiler.prototype.textAtVert = function(text, x, y, halign, valign){
	    var fontSize = this.getCurrentFontSize();
	    var mes = measureChars(text, fontSize);
	    var totalHeight = fontSize * mes.length;
	    var xs, top, ys;
	    xs = mes.map(function(m){
	        switch(halign){
	            case "left": return x;
	            case "center": return x - m.width / 2.0;
	            case "right": return x - m.width;
	            default: throw new Error("invalid halign: " + halign);
	        }
	    });
	    switch(valign){
	        case "top": top = y; break;
	        case "center": top = y - totalHeight/2; break;
	        case "bottom": top = y - totalHeight; break;
	        default: throw new Error("invalid valign: " + valign);
	    }
	    ys = composeYs(mes.length, top, fontSize);
	    this.ops.push(drawerOps.drawChars(text, xs, ys));
	    return new Box(min(xs), top, max(xs), top + totalHeight);
	}

	DrawerCompiler.prototype.textAtVertJustified = function(text, x, top, bottom, halign){
	    var fontSize = this.getCurrentFontSize();
	    var mes = measureChars(text, fontSize);
	    var xs, ys, totalHeight, extra;
	    if( text.length < 2 ){
	        return this.textAt(text, x, top, halign, "top");
	    } else {
	        xs = mes.map(function(m){
	            switch(halign){
	                case "left": return x;
	                case "center": return x - m.width / 2.0;
	                case "right": return x - m.width;
	                default: throw new Error("invalid halign: " + halign);
	            }
	        });
	        totalHeight = fontSize * mes.length;
	        extra = ((bottom - top) - totalHeight) / (mes.length - 1);
	        ys = composeYs(mes.length, top, fontSize, extra);
	        this.ops.push(drawerOps.drawChars(text, xs, ys));
	        return new Box(min(xs), top, max(xs), bottom);
	    }
	}

	DrawerCompiler.prototype.textIn = function(text, box, halign, valign, direction){
	    var x, y;
	    if( halign !== "justified" ){
	        switch(halign){
	            case "left": x = box.left(); break;
	            case "center": x = box.cx(); break;
	            case "right": x = box.right(); break;
	            default: throw new Error("invalid halign:" + halign);
	        }
	    }
	    if( valign !== "justified" ){
	        switch(valign){
	            case "top": y = box.top(); break;
	            case "center": y = box.cy(); break;
	            case "bottom": y = box.bottom(); break;
	            default: throw new Error("invalid valign: " + valign);
	        }
	    }
	    if( direction === undefined ) direction = "horizontal";
	    if( direction === "horizontal" ){
	        if( halign === "justified" ){
	            return this.textAtJustified(text, box.left(), box.right(), y, valign);
	        } else {
	            return this.textAt(text, x, y, halign, valign);
	        }
	    } else if( direction === "vertical" ){
	        if( valign === "justified" ){
	            return this.textAtVertJustified(text, x, box.top(), box.bottom(), halign);
	        } else {
	            return this.textAtVert(text, x, y, halign, valign);
	        }
	    } else {
	        throw new Error("invalid direction: " + direction);
	    }
	}

	DrawerCompiler.prototype.textInEvenColumns = function(text, box, nCols, justifyTo){
	    var textLength = text.length, i, cols, j;
	    if( justifyTo === undefined ){
	        justifyTo = "left";
	    }
	    if( justifyTo === "left" ){
	        i = 0;
	    } else if( justifyTo === "right" ){
	        i = nCols - textLength;
	        if( i < 0 ){
	            console.log("too few columns in textInEvenColumns", text, nCols)
	            throw new Error("too few columns");
	        }
	    } else {
	        throw new Error("invalid justifyTo: " + justifyTo);
	    }
	    cols = box.splitToEvenColumns(nCols);
	    for(j=0;i<nCols;i++,j++){
	        this.textIn(text[j], cols[i], "center", "center");
	    }
	}

	DrawerCompiler.prototype.setTextColor = function(r, g, b){
	    if( r instanceof Array ){
	        (function(){
	            var color = r;
	            r = color[0];
	            g = color[1];
	            b = color[2];
	        })();
	    }
	    this.ops.push(["set_text_color", r, g, b]);
	};

	DrawerCompiler.prototype.createPen = function(name, r, g, b, width){
	    if( r instanceof Array ){
	        (function(){
	            var color = r;
	            width = g === undefined ? 0.1 : g;
	            r = color[0];
	            g = color[1];
	            b = color[2];
	        })();
	    } else {
	        if( width === undefined ){
	            width = 0.1;
	        }
	    }
	    this.ops.push(["create_pen", name, r, g, b, width]);
	};

	DrawerCompiler.prototype.setPen = function(name){
	    this.ops.push(["set_pen", name]);
	};

	DrawerCompiler.prototype.getCurrentFont = function(){
	    return this.currentFont;
	};

	DrawerCompiler.prototype.getFontInfo = function(name){
	    return this.fontDict[name];
	};

	DrawerCompiler.prototype.getCurrentFontInfo = function(){
	    return this.fontDict[this.currentFont];
	}

	DrawerCompiler.prototype.getCurrentFontSize = function(){
	    if( this.currentFontSize === null ){
	        throw new Error("cannot resolve current font size");
	    }
	    return this.currentFontSize;
	}

	DrawerCompiler.prototype.setPoint = function(name, x, y){
	    this.pointDict[name] = {x:x, y:y};
	};

	DrawerCompiler.prototype.getPoint = function(name){
	    return this.pointDict[name];
	};

	DrawerCompiler.prototype.setBox = function(name, box){
	    this.boxDict[name] = box.clone();
	};

	DrawerCompiler.prototype.getBox = function(name){
	    return this.boxDict[name];
	};

	DrawerCompiler.prototype.frameRight = function(box){
	    this.line(box.right(), box.top(), box.right(), box.bottom());
	};

	DrawerCompiler.prototype.frameTop = function(box){
	    this.line(box.left(), box.top(), box.right(), box.top());
	};

	DrawerCompiler.prototype.frameBottom = function(box){
	    this.line(box.left(), box.bottom(), box.right(), box.bottom());
	};

	DrawerCompiler.prototype.frameCells = function(cells){
	    cells.forEach(function(cols){
	        cols.forEach(function(cell){
	            this.box(cell);
	        }.bind(this))
	    }.bind(this));
	};

	DrawerCompiler.prototype.frameColumnsRight = function(cells, icol, opt){
	    var rowSize = cells.length;
	    var topCell = cells[0][icol];
	    var botCell = cells[rowSize-1][icol];
	    var top = topCell.top();
	    var bot = botCell.bottom();
	    var x = topCell.right();
	    if( opt.dx ){
	        x += opt.dx;
	    }
	    this.line(x, top, x, bot);
	}

	DrawerCompiler.prototype.drawEvenInnerColumnBorders = function(box, nRows){
	    var left = box.left(), top = box.top(), bottom = box.bottom(),
	        w = box.width() / nRows;
	    var i, x;
	    for(i=1;i<nRows;i++){
	        x = left + w * i;
	        this.line(x, top, x, bottom);
	    }
	};

	DrawerCompiler.prototype.drawInnerColumnBorders = function(boxes){
	    var i, n = boxes.length - 1;
	    for(i=0;i<n;i++){
	        this.frameRight(boxes[i]);
	    }
	}

	DrawerCompiler.prototype.multilineText = function(texts, box, halign, valign, leading){
	    if( !texts ){
	        texts = [];
	    }
	    if( leading === undefined ){
	        leading = 0;
	    }
	    var fontSize = this.getCurrentFontSize();
	    var nLines = texts.length;
	    var y;
	    switch(valign){
	        case "top": y = box.top(); break;
	        case "center": y = box.top() + (box.height() - calcTotalHeight())/ 2; break;
	        case "bottom": y = box.top() + box.height() - calcTotalHeight(); break;
	        default: throw new Error("invalid valign: " + valign);
	    }
	    var x;
	    switch(halign){
	        case "left": x = box.left(); break;
	        case "center": x = box.cx(); break;
	        case "right": x = box.right(); break;
	        default: throw new Error("invalid halign: " + halign);
	    }
	    var bound = null, render;
	    texts.forEach(function(line){
	        render = this.textAt(line, x, y, halign, "top");
	        bound = Box.boundingBox(bound, render);
	        y += fontSize + leading;
	    }.bind(this));
	    return bound;
	    
	    function calcTotalHeight(){
	        return fontSize * nLines + leading * (nLines - 1);
	    }
	}

	DrawerCompiler.prototype.measureText = function(text){
	    var fontSize = this.getCurrentFontSize();
	    var mes = measureChars(text, fontSize);
	    return {
	        cx: sum(mes, "width"),
	        cy: fontSize
	    };
	}

	DrawerCompiler.prototype.breakLines = function(text, width, fontSize){
	    if( fontSize === undefined ) fontSize = this.getCurrentFontSize();
	    return breakLines(text, width, fontSize);
	}


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var Compiler = __webpack_require__(10).Compiler;
	var Box = __webpack_require__(10).Box;

	function Refer(data){
		this.compiler = new Compiler();
		this.pointDict = {};
		this.boxDict = {};
		this.setup();
		if( data ){
			this.setData(data);
		}
	}

	Refer.prototype.setup = function(){
		var compiler = this.compiler;
		var page = Box.createA4Box();
		compiler.createFont("serif-6", "MS Mincho", 6);
		compiler.createFont("serif-5", "MS Mincho", 5);
		compiler.createFont("serif-5-bold", "MS Mincho", 5, "bold");
		compiler.createFont("serif-4", "MS Mincho", 4);
		compiler.setPoint("title", page.cx(), 41);
		compiler.setPoint("referHospital", 30, 58);
		compiler.setPoint("referDoctor", 30, 58+6);
		compiler.setPoint("patientName", 30, 80);
		compiler.setPoint("patientInfo", 50, 90);
		compiler.setPoint("diagnosis", 30, 102);
		compiler.setPoint("issueDate", 30, 220);
		compiler.setPoint("address", 118, 220);
		compiler.setBox("content", new Box(30, 115, 170, 210));
	};

	Refer.prototype.setTitle = function(title){
		var c = this.compiler,
			p = c.getPoint("title");
		c.setFont("serif-5-bold");
		c.textAt(title, p.x, p.y, "center", "center", {extraSpace: 5});

	};
	Refer.prototype.setReferHospital = function(name){
		var c = this.compiler,
			p = c.getPoint("referHospital");
		c.setFont("serif-4");
		c.textAt(name, p.x, p.y, "left", "bottom");
	};

	Refer.prototype.setReferDoctor = function(text){
		var c = this.compiler,
			p = c.getPoint("referDoctor");
		c.setFont("serif-4");
		c.textAt(text, p.x, p.y, "left", "bottom");	
	};

	Refer.prototype.setPatientName = function(name){
		var c = this.compiler,
			p = c.getPoint("patientName");
		c.setFont("serif-5");
		c.textAt(name, p.x, p.y, "left", "bottom");	
	};

	Refer.prototype.setPatientInfo = function(text){
		var c = this.compiler,
			p = c.getPoint("patientInfo");
		c.setFont("serif-4");
		c.textAt(text, p.x, p.y, "left", "bottom");	
	};

	Refer.prototype.setDiagnosis = function(text){
		var c = this.compiler,
			p = c.getPoint("diagnosis");
		c.setFont("serif-5");
		c.textAt(text, p.x, p.y, "left", "bottom");	
	};

	Refer.prototype.setIssueDate = function(text){
		var c = this.compiler,
			p = c.getPoint("issueDate");
		c.setFont("serif-4");
		c.textAt(text, p.x, p.y, "left", "bottom");	
	};

	Refer.prototype.setAddress = function(addr1, addr2, addr3, addr4, clinicName, doctorName){
		var c = this.compiler,
			p = c.getPoint("address");
		c.setFont("serif-4");
		var x = p.x, y = p.y + 4;
		var lineHeight = 4 + 2;
		c.textAt(addr1, x, y, "left", "bottom");
		y += lineHeight;
		c.textAt(addr2, x, y, "left", "bottom");
		y += lineHeight;
		c.textAt(addr3, x, y, "left", "bottom");
		y += lineHeight;
		c.textAt(addr4, x, y, "left", "bottom");
		y += lineHeight;
		y += 4;
		c.textAt(clinicName, x, y, "left", "bottom");
		y += lineHeight;
		var txt = "院長";
		var mes = c.measureText(txt);
		c.textAt(txt, x, y, "left", "center");
		x += mes.cx + 4;
		c.setFont("serif-6");
		mes = c.measureText(doctorName);
		c.textAt(doctorName, x, y, "left", "center");
		x += mes.cx + 8;
		c.setFont("serif-4");
		c.textAt("㊞", x, y, "left", "center");
	};

	Refer.prototype.setContent = function(content){
		var c = this.compiler,
			box = c.getBox("content");
		var contentLines = content.split(/\r\n|\r|\n/g);
		c.setFont("serif-4");
		var lines = contentLines.reduce(function(cur, line){
			return cur.concat(c.breakLines(line, box.width()));
		}.bind(this), []);
		var leading = 0.8;
		c.multilineText(lines, box, "left", "top", leading);
		// var x = box.left(), y = box.top();
		// var fontInfo = c.getCurrentFontInfo(), leading = 0;
		// lines.forEach(function(line){
		// 	c.textAt(line, x, y, "left", "top");
		// 	y += fontInfo.fontSize + leading;
		// });
	};

	Refer.prototype.setData = function(data){
		if( "title" in data ){
			this.setTitle(data.title);
		}
		if( "referHospital" in data ){
			this.setReferHospital(data.referHospital);
		}
		if( "referDoctor" in data ){
			this.setReferDoctor(data.referDoctor);
		}
		if( "patientName" in data ){
			this.setPatientName(data.patientName);
		}
		if( "patientInfo" in data ){
			this.setPatientInfo(data.patientInfo);
		}
		if( "diagnosis" in data ){
			this.setDiagnosis(data.diagnosis);
		}
		if( "issueDate" in data ){
			this.setIssueDate(data.issueDate);
		}
		if( "address" in data ){
			this.setAddress.apply(this, data.address);
		}
		if( "content" in data ){
			this.setContent(data.content);
		}
	};

	Refer.prototype.getOps = function(){
		return this.compiler.getOps();
	};

	module.exports = Refer;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var Compiler = __webpack_require__(10).Compiler;
	var Box = __webpack_require__(10).Box;

	var GOTHIC = "MS GOTHIC";
	var MINCHO = "MS MINCHO";
	var LARGE_FONT = "large-font";
	var MEDIUM_FONT = "medium-font";
	var REGULAR_FONT = "regular-font";
	var SMALL_FONT = "small-font";

	var LARGE_FONT_SIZE = 9.88;
	var MEDIUM_FONT_SIZE = 6.35;
	var REGULAR_FONT_SIZE = 4.94;
	var SMALL_FONT_SIZE = 3.43;
	var DRUGBOX_FONT_SIZE = REGULAR_FONT_SIZE;

	function kindColor(kind){
	    switch(kind){
	        case "naifuku": return [0, 0, 255];
	        case "tonpuku": return [0, 255, 0];
	        case "gaiyou":  return [255, 0, 0];
	        default: return [0, 0, 0];
	    }
	}

	function kindLabel(kind){
	    switch(kind){
	        case "naifuku": return "内服薬";
	        case "tonpuku": return "頓服薬";
	        case "gaiyou":  return "外用薬";
	        default: return "おくすり";
	    }
	}

	function Drugbag(data){
	    data = data || {};
	    this.compiler = new Compiler();
	    this.pointDict = {};
	    this.boxDict = {};
	    this.kind = data.kind || "sonota";
	    this.setup(data);
	}

	Drugbag.prototype.getOps = function(){
	    return this.compiler.getOps();
	};

	Drugbag.prototype.setup = function(data){
	    var layout = getDrugbagLayout();
	    var c = this.compiler;
	    var color = kindColor(this.kind);
	    this.registerFonts();
	    c.createPen("regular-pen", color);
	    c.setPen("regular-pen");
	    c.setTextColor(color);
	    this.setupTitle(c, layout.title_box, kindLabel(this.kind));
	    this.setupPatientName(c, layout.patient_name_box, data.patient_name);
	    this.setupPatientNameYomi(c, layout.patient_name_yomi_box, data.patient_name_yomi);
	    this.setupDrugBox(c, layout.drug_box, data.instructions);
	    this.setupDrugName(c, layout.name_box, data.drug_name);
	    this.setupDesc(c, layout.desc_box, data.desc);
	    this.setupPrescribedAt(c, layout.prescribed_at_box, data.prescribed_at);
	    c.frameTop(layout.footer_box);
	    c.box(layout.stamp_box);
	    this.setupStampLabel(c, layout.stamp_label_box);
	    this.setupClinicName(c, layout.clinic_name_box, data.clinic_name);
	    this.setupClinicAddr(c, layout.clinic_addr_box, data.clinic_address);
	};

	Drugbag.prototype.setupClinicAddr = function(c, box, addr){
	    if( !addr ) return;
	    c.setFont(SMALL_FONT);
	    c.multilineText(addr, box, "left", "top", 1.4);
	};

	Drugbag.prototype.setupClinicName = function(c, box, name){
	    if( !name ) return;
	    c.setFont(MEDIUM_FONT);
	    c.textIn(name, box, "left", "top");
	};

	Drugbag.prototype.setupStampLabel = function(c, box){
	    c.setFont(SMALL_FONT);
	    c.textIn("調剤者の印", box, "center", "top");
	};

	Drugbag.prototype.setupPrescribedAt = function(c, box, at){
	    if( !at ) return;
	    c.setFont(SMALL_FONT);
	    c.textIn("調剤年月日 " + at, box, "left", "top")
	};

	Drugbag.prototype.setupDesc = function(c, box, desc){
	    var lines;
	    c.box(box);
	    if( !desc ) return;
	    lines = desc.split(/\r\n|\n|\r/g);
	    box = box.clone();
	    box.inset(1, 0.8);
	    c.setFont(SMALL_FONT);
	    c.multilineText(lines, box, "left", "top", 0.65);
	}

	Drugbag.prototype.setupDrugName = function(c, box, name){
	    if( !name ) return;
	    c.setFont(REGULAR_FONT);
	    if( name.indexOf("\n") >= 0 ){
	        c.multilineText(name.split(/\r\n|\n|\r/g), box, "left", "bottom", 0.5);
	    } else {
	        c.textIn(name, box, "center", "bottom");
	    }
	};

	Drugbag.prototype.setupDrugBox = function(c, box, instructions){
	    var h, leading = 2.0;
	    if( !instructions ) return;
	    c.setFont(REGULAR_FONT);
	    box = box.clone();
	    instructions.forEach(function(text){
	        if( text.indexOf("\n") >= 0 ){
	            h = c.multilineText(text.split(/\r\n|\n|\r/g), box, "left", "top", leading);
	        } else {
	            h = c.textIn(text, box, "center", "top");
	        }
	        box.setTop(h.bottom() + leading);
	    });
	}

	Drugbag.prototype.setupPatientNameYomi = function(c, box, yomi){
	    yomi = yomi || "　　　 　　　　";
	    yomi = "(" + yomi + ")";
	    c.setFont(REGULAR_FONT);
	    c.textIn(yomi, box, "center", "top");
	}

	Drugbag.prototype.setupPatientName = function(c, box, name){
	    name = name || "　　　 　　　";
	    name += " 様";
	    c.setFont(MEDIUM_FONT);
	    c.textIn(name, box, "center", "top");
	}

	Drugbag.prototype.setupTitle = function(c, box, title){
	    c.setFont(LARGE_FONT);
	    c.textIn(title, box, "center", "center");
	}

	Drugbag.prototype.registerFonts = function(){
	    var c = this.compiler;
	    c.createFont(LARGE_FONT, GOTHIC, LARGE_FONT_SIZE)
	    c.createFont(MEDIUM_FONT, GOTHIC, MEDIUM_FONT_SIZE)
	    c.createFont(REGULAR_FONT, GOTHIC, REGULAR_FONT_SIZE)
	    c.createFont(SMALL_FONT, GOTHIC, SMALL_FONT_SIZE)
	};

	Drugbag.drugBoxWidth = 98; // mm
	Drugbag.drugBoxFontSize = DRUGBOX_FONT_SIZE; // mm
	Drugbag.drugBoxFontFace = GOTHIC;
	Drugbag.descFontFace = GOTHIC;
	Drugbag.descFontSize = SMALL_FONT_SIZE;
	Drugbag.descBoxWidth = 74 + 0.8; // mm
	Drugbag.descContentBoxWidth = Drugbag.descBoxWidth - 2;

	function getDrugbagLayout(){
	    var paperWidth = 128,
	        paperHeight = 182,
	        paper = new Box(0, 0, paperWidth, paperHeight),
	        footer = innerBox(paper, 10, 140, 108, 37);
	    return {
	        "paper": paper.clone(),
	        "title_box": innerBox(paper, 0, 35, 128, 9.88),
	        "patient_name_box": innerBox(paper, 10, 52.88, 108, 6.35),
	        "patient_name_yomi_box": innerBox(paper, 10, 61.23, 108, 4.94),
	        "drug_box": innerBox(paper, 15, 71.17, Drugbag.drugBoxWidth, 17.83),
	        "name_box": innerBox(paper, 18+1.5, 91, 84, 16),
	        "desc_box": innerBox(paper, 27.5, 111, Drugbag.descBoxWidth, 20+1),
	        "prescribed_at_box": innerBox(paper, 64, 134, 54, 3.53),
	        "footer_box": footer,
	        "clinic_name_box": innerBox(footer, 0, 5, 70, 6.35),
	        "clinic_addr_box": innerBox(footer, 0, 14.35, 70, 22.65),
	        "stamp_box": innerBox(footer, 78, 5, 20, 20),
	        "stamp_label_box": innerBox(footer, 78, 27, 20, 3.53),
	    };
	    
	    function innerBox(parent, left, top, width, height){
	        return parent.innerBox(left, top, left + width, top + height);
	    }
	}

	module.exports = Drugbag;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var Compiler = __webpack_require__(10).Compiler;
	var Box = __webpack_require__(10).Box;

	exports.getOps = function(data, config){
	    config = setup(config || {});
		var comp = new Compiler();
		var lines = [];
		lines.push(data.name + "様" + " " + data.at);
		lines.push("");
		lines = lines.concat(drugPart(data.drugs));
		lines.push("");
		lines = lines.concat(data.clinic);
		comp.createFont("regular", "MS Gothic", config.fontSize);
		comp.setFont("regular");
		var box = new Box(0, 0, config.width, 210).inset(config.inset);
		lines = breakToParagraph(comp, lines, box.width());
		comp.multilineText(lines, box, "left", "top");
		return comp.getOps();

	    function setup(config){
	        var defaultConfig = {
	            fontSize: 4.6,
	            inset: 5,
	            width: 148
	        }
	        for(var key in config){
	            defaultConfig[key] = config[key];
	        }
	        return defaultConfig;
	    }
	};

	function breakToParagraph(compiler, lines, width){
		var result = [];
		lines.forEach(function(line){
			var lines = compiler.breakLines(line, width);
			result = result.concat(lines);
		});
		return result;
	}

	function drugPart(drugs){
		return drugs.map(function(drug, index){
			return (index+1)+") " + drug;
		});
	}

	// function clinicPart(){
	// 	return [
	//         "CLINIC_NAME",
	//         "CLINIC_ADDRESS",
	//         "CLINIC_PHONE",
	//         "CLINIC_DOCTOR"
	// 	];
	// }

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


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	// TODO: implement text_vertically_justified

	(function(exports){

	exports.drawerToSvg = function(ops, options){
	    options = options || {};

	    // var attr = {};
	    // ['width', 'height'].forEach(function(key){
	    //     if( key in options ){
	    //         attr[key] = options[key];
	    //     }
	    // })

	    var ns = "http://www.w3.org/2000/svg";
	    var pen_color = "rgb(0,0,0)";
	    var pen_width = "1px";
	    var pen_dict = {};
	    var font_name, font_size, font_weight, font_italic;
	    var font_dict = {};
	    var text_color = "rgb(0,0,0)";
	    var i, n, op;
	    var curr_x, curr_y;

	    var svg = document.createElementNS(ns, "svg");
	    ['width', 'height', "viewBox"].forEach(function(key){
	        if( key in options ){
	            svg.setAttributeNS(null, key, options[key]);
	        }
	    })
	    
	    function draw_move_to(x, y){
	        curr_x = x;
	        curr_y = y;
	    }

	    function draw_line_to(x, y){
	    	var e = document.createElementNS(ns, "line");
	    	e.setAttributeNS(null, "x1", curr_x);
	    	e.setAttributeNS(null, "y1", curr_y);
	    	e.setAttributeNS(null, "x2", x);
	    	e.setAttributeNS(null, "y2", y);
	    	e.setAttributeNS(null, "style", "stroke:" + pen_color + ";stroke-width:" + pen_width);
	        curr_x = x;
	        curr_y = y;
	        return e;
	    }

	    function create_pen(name, r, g, b, width){
	        var color = "rgb(" + r + "," + g + "," + b + ")";
	        pen_dict[name] = {width: width + "px", color: color};
	    }

	    function set_pen(name){
	        var pen = pen_dict[name];
	        pen_color = pen.color;
	        pen_width = pen.width;
	    }

	    function mmToPixel(dpi, mm){
	        var inch = mm/25.4;
	        return Math.floor(dpi * inch);
	    };
	    
	    function pixelToMm(dpi, px){
	        var inch = px / dpi;
	        return inch * 25.4;
	    }

	    function create_font(name, font_name, size, weight, italic){
	        font_dict[name] = {font_name: font_name, font_size: size, font_weight: weight, font_italic: italic};
	    }

	    function set_font(name){
	        var font = font_dict[name];
	        font_name = font.font_name;
	        font_size = font.font_size;
	        font_weight = font.font_weight;
	        font_italic = font.font_italic;
	    }

	    function set_text_color(r, g, b){
	        text_color = "rgb(" + r + "," + g + "," + b + ")";
	    }

	    function draw_chars(chars, xs, ys){
	        var e = document.createElementNS(ns, "text");
	        var attrs = {
	            fill: text_color,
	            "font-family": font_name,
	            "font-size": font_size,
	            "font-weight": font_weight ? "bold" : "normal",
	            "font-italic": font_italic ? "italic": "normal",
	            "text-anchor": "start",
	            //'dominant-baseline': "text-after-edge",
	            "dy": "1em"
	        };
	        for(var key in attrs){
	        	e.setAttributeNS(null, key, attrs[key]);
	        }
	        if( typeof xs === "number" || xs instanceof Number ){
	        	e.setAttributeNS(null, "x", xs);
	        } else {
	            e.setAttributeNS(null, "x", xs.join(","));
	        }
	        if( typeof ys === "number" || ys instanceof Number){
	        	e.setAttributeNS(null, "y", ys);
	        } else {
	        	e.setAttributeNS(null, "y", ys.join(","));
	        }
	        e.appendChild(document.createTextNode(chars));
	        return e;
	    }

	    for(i=0,n=ops.length;i<n;i++){
	        op = ops[i];
	        switch(op[0]){
	            case "move_to":
	                draw_move_to(op[1], op[2]);
	                break;
	            case "line_to":
	                svg.appendChild(draw_line_to(op[1], op[2]));
	                break;
	            case "create_pen":
	                create_pen(op[1], op[2], op[3], op[4], op[5]);
	                break;
	            case "set_pen":
	                set_pen(op[1]);
	                break;
	            case "create_font":
	                create_font(op[1], op[2], op[3], op[4], op[5]);
	                break;
	            case "set_font":
	                set_font(op[1]);
	                break;
	            case "set_text_color":
	                set_text_color(op[1], op[2], op[3]);
	                break;
	            case "draw_chars":
	                svg.appendChild(draw_chars(op[1], op[2], op[3]));
	                break;
	            default:
	                throw new Error("unknown drawer op:", op);
	                break;
	        }
	    }
	    return svg;	
	}
	})( false ? window : exports);

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	(function(exports){

	"use strict";

	var trunc = Math.trunc || function(x){
		if( x >= 0 ){
			return Math.floor(x);
		} else {
			return Math.ceil(x);
		}
	};

	function ge(year1, month1, day1, year2, month2, day2){
		if( year1 > year2 ){
			return true;
		}
		if( year1 < year2 ){
			return false;
		}
		if( month1 > month2 ){
			return true;
		}
		if( month1 < month2 ){
			return false;
		}
		return day1 >= day2;
	}

	function gengouToAlpha(gengou){
		switch(gengou){
			case "平成": return "Heisei";
			case "昭和": return "Shouwa";
			case "大正": return "Taishou";
			case "明治": return "Meiji";
			default: throw new Error("unknown gengou: " + gengou);
		}
	}

	function padLeft(str, n, ch){
		var m = n - str.length;
		var pad = "";
		while( m-- > 0 ){
			pad += ch;
		}
		return pad + str;
	}

	var zenkakuDigits = ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９"];
	var alphaDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

	function isZenkakuDigit(ch){
		return zenkakuDigits.indexOf(ch) >= 0;
	}

	function isAlphaDigit(ch){
		return alphaDigits.indexOf(ch) >= 0;
	}

	function alphaDigitToZenkaku(ch){
		var i = alphaDigits.indexOf(ch);
		return i >= 0 ? zenkakuDigits[i] : ch;
	}

	function isDateObject(obj){
		return obj instanceof Date;
	}

	function removeOpt(opts, what){
		var result = [];
		for(var i=0;i<opts.length;i++){
			var opt = opts[i];
			if( opt === what ){
				continue;
			} else {
				result.push(opt);
			}
		}
		return result;
	}

	function toGengou(year, month, day){
		if( ge(year, month, day, 1989, 1, 8) ){
			return { gengou:"平成", nen:year - 1988 };
		}
		if( ge(year, month, day, 1926, 12, 25) ){
			return { gengou:"昭和", nen:year - 1925 };
		}
		if( ge(year, month, day, 1912, 7, 30) ){
			return { gengou:"大正", nen:year - 1911 };
		}
		if( ge(year, month, day, 1873, 1, 1) ){
			return { gengou: "明治", nen: year - 1867 };
		}
		return { gengou: "西暦", nen: year };
	}

	exports.toGengou = toGengou;

	function fromGengou(gengou, nen){
	    nen = Math.floor(+nen);
	    if( nen < 0 ){
	    	throw new Error("invalid nen: " + nen);
	    }
	    switch (gengou) {
	        case "平成":
	            return 1988 + nen;
	        case "昭和":
	            return 1925 + nen;
	        case "大正":
	            return 1911 + nen;
	        case "明治":
	            return 1867 + nen;
	        case "西暦":
	            return nen;
	        default:
	            throw new Error("invalid gengou: " + gengou);
	    }
	}

	exports.fromGengou = fromGengou;

	var youbi = ["日", "月", "火", "水", "木", "金", "土"];

	function toYoubi(dayOfWeek){
		return youbi[dayOfWeek];
	}

	exports.toYoubi = toYoubi;

	function KanjiDate(date){
		this.year = date.getFullYear();
		this.month = date.getMonth()+1;
		this.day = date.getDate();
		this.hour = date.getHours();
		this.minute = date.getMinutes();
		this.second = date.getSeconds();
		this.msec = date.getMilliseconds();
		this.dayOfWeek = date.getDay();
		var g = toGengou(this.year, this.month, this.day);
		this.gengou = g.gengou;
		this.nen = g.nen;
		this.youbi = youbi[this.dayOfWeek];
	}

	function KanjiDateExplicit(year, month, day, hour, minute, second, millisecond){
		if( hour === undefined ) hour = 0;
		if( minute === undefined ) minute = 0;
		if( second === undefined ) second = 0;
		if( millisecond === undefined ) millisecond = 0;
		var date = new Date(year, month-1, day, hour, minute, second, millisecond);
		return new KanjiDate(date);
	}

	function KanjiDateFromString(str){
		var m;
		m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
		if( m ){
			return KanjiDateExplicit(+m[1], +m[2], +m[3]);
		}
		m = str.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
		if( m ){
			return KanjiDateExplicit(+m[1], +m[2], +m[3], +m[4], +m[5], +m[6]);
		}
		throw new Error("cannot convert to KanjiDate");
	}

	function parseFormatString(fmtStr){
		var result = [];
		var parts = fmtStr.split(/(\{[^}]+)\}/);
		parts.forEach(function(part){
			if( part === "" ) return;
			if( part[0] === "{" ){
				part = part.substring(1);
				var token = {opts: []};
				var colon = part.indexOf(":");
				if( part.indexOf(":") >= 0 ){
					token.part = part.substring(0, colon);
					var optStr = part.substring(colon+1).trim();
					if( optStr !== "" ){
						if( optStr.indexOf(",") >= 0 ){
							token.opts = optStr.split(/\s*,\s*/);
						} else {
							token.opts = [optStr];
						}
					}
				} else {
					token.part = part;
				}
				result.push(token);
			} else {
				result.push(part);
			}
		});
		return result;
	}

	var format1 = "{G}{N}年{M}月{D}日（{W}）";
	var format2 = "{G}{N}年{M}月{D}日";
	var format3 = "{G:a}{N}.{M}.{D}";
	var format4 = "{G}{N:2}年{M:2}月{D:2}日（{W}）";
	var format5 = "{G}{N:2}年{M:2}月{D:2}日";
	var format6 = "{G:a}{N:2}.{M:2}.{D:2}";
	var format7 = "{G}{N}年{M}月{D}日（{W}） {a}{h:12}時{m}分{s}秒";
	var format8 = "{G}{N:2}年{M:2}月{D:2}日（{W}） {a}{h:12,2}時{m:2}分{s:2}秒";
	var format9 = "{G}{N}年{M}月{D}日（{W}） {a}{h:12}時{m}分";
	var format10 = "{G}{N:2}年{M:2}月{D:2}日（{W}） {a}{h:12,2}時{m:2}分";
	var format11 = "{G}{N:z}年{M:z}月{D:z}日";
	var format12 = "{G}{N:z,2}年{M:z,2}月{D:z,2}日";
	var format13 = "{Y}-{M:2}-{D:2}";
	var format14 = "{Y}-{M:2}-{D:2} {h:2}:{m:2}:{s:2}";

	exports.f1 = format1;
	exports.f2 = format2;
	exports.f3 = format3;
	exports.f4 = format4;
	exports.f5 = format5;
	exports.f6 = format6;
	exports.f7 = format7;
	exports.f8 = format8;
	exports.f9 = format9;
	exports.f10 = format10;
	exports.f11 = format11;
	exports.f12 = format12;
	exports.f13 = format13;
	exports.f14 = format14;
	exports.fSqlDate = format13;
	exports.fSqlDateTime = format14;

	function gengouPart(kdate, opts){
		var style = "2";
		opts.forEach(function(opt){
			if( ["2", "1", "a", "alpha"].indexOf(opt) >= 0 ){
				style = opt;
			}
		})
		switch(style){
			case "2": return kdate.gengou;
			case "1": return kdate.gengou[0]; 
			case "a": return gengouToAlpha(kdate.gengou)[0]; 
			case "alpha": return gengouToAlpha(kdate.gengou);
			default: return kdate.gengou;
		}
	}

	function numberPart(num, opts){
		var zenkaku = false;
		var width = 1;
		opts.forEach(function(opt){
			switch(opt){
				case "1": width = 1; break;
				case "2": width = 2; break;
				case "z": zenkaku = true; break;
			}
		});
		var result = num.toString();
		if( zenkaku ){
			result = result.split("").map(alphaDigitToZenkaku).join("");
		}
		if( width > 1 && num < 10 ){
			result = (zenkaku ? "０" : "0") + result;
		}
		return result;
	}

	function nenPart(kdate, opts){
		if( kdate.nen === 1 && opts.indexOf("g") >= 0 ){
			return "元";
		} else {
			return numberPart(kdate.nen, opts);
		}
	}

	function youbiPart(kdate, opts){
		var style;
		opts.forEach(function(opt){
			if( ["1", "2", "3", "alpha"].indexOf(opt) >= 0 ){
				style = opt;
			}
		})
		switch(style){
			case "1": return kdate.youbi;
			case "2": return kdate.youbi + "曜";
			case "3": return kdate.youbi + "曜日";
			case "alpha": return dayOfWeek[kdate.dayOfWeek];
			default: return kdate.youbi;
		}
	}

	function hourPart(hour, opts){
		var ampm = false;
		if( opts.indexOf("12") >= 0 ){
			ampm = true;
			opts = removeOpt(opts, "12");
		}
		if( ampm ){
			hour = hour % 12;
		}
		return numberPart(hour, opts);
	}

	function ampmPart(kdate, opts){
		var style = "kanji";
		opts.forEach(function(opt){
			switch(opt){
				case "am/pm": style = "am/pm"; break;
				case "AM/PM": style = "AM/PM"; break;
			}
		});
		var am = kdate.hour < 12;
		switch(style){
			case "kanji": return am ? "午前" : "午後";
			case "am/pm": return am ? "am" : "pm";
			case "AM/PM": return am ? "AM" : "PM";
			default : throw new Error("unknown style for AM/PM");
		}
	}

	function yearPart(year, opts){
		return year.toString();
	}

	function format(formatStr, kdate){
		var output = [];
		var tokens = parseFormatString(formatStr);
		tokens.forEach(function(token){
			if( typeof token === "string" ){
				output.push(token);
			} else {
				switch(token.part){
					case "G": output.push(gengouPart(kdate, token.opts)); break;
					case "N": output.push(nenPart(kdate, token.opts)); break;
					case "M": output.push(numberPart(kdate.month, token.opts)); break;
					case "D": output.push(numberPart(kdate.day, token.opts)); break;
					case "W": output.push(youbiPart(kdate, token.opts)); break;
					case "h": output.push(hourPart(kdate.hour, token.opts)); break;
					case "m": output.push(numberPart(kdate.minute, token.opts)); break;
					case "s": output.push(numberPart(kdate.second, token.opts)); break;
					case "a": output.push(ampmPart(kdate, token.opts)); break;
					case "Y": output.push(yearPart(kdate.year, token.opts)); break;
				}
			}
		})
		return output.join("");
	}

	exports.format = function(){
		var narg = arguments.length;
		var formatStr, args, i;
		if( narg === 0 ){
			return format(format1, new KanjiDate(new Date()));
		} else if( narg === 1 ){
			return format(format1, cvt(arguments[0]));
		} else {
			formatStr = arguments[0];
			if( formatStr == null ){
				formatStr = format1;
			}
			args = [];
			for(i=1;i<arguments.length;i++){
				args.push(arguments[i]);
			}
			if( args.length === 1 ){
				return format(formatStr, cvt(args[0]));
			} else {
				return format(formatStr, KanjiDateExplicit.apply(null, args));
			}
		}
		throw new Error("invalid format call");

		function cvt(x){
			if( isDateObject(x) ){
				return new KanjiDate(x);
			} else if( typeof x === "string" ){
				return KanjiDateFromString(x);
			}
			throw new Error("cannot convert to KanjiDate");
		}
	}

	})( false ? (window.kanjidate = {}) : exports);

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var mConsts = __webpack_require__(20);
	var conti = __webpack_require__(5);
	var service = __webpack_require__(1);
	var PrescContent = __webpack_require__(8).PrescContent;
	var kanjidate = __webpack_require__(18);
	var DrugBagData = __webpack_require__(21);
	var DrugBag = __webpack_require__(8).DrugBag;

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

	exports.fetchAllDrugsData = function(visitId, cb){
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
				});
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
				});
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
			var data = drugs.map(function(drug){
				return DrugBagData.createData(drug, visit, patient, drug.pharmaDrug, 
						config.drugbag.clinic_name, config.drugbag.clinic_address);
			});
			cb(undefined, data);
		});
	};

	exports.composeDrugBagOps = function(data){
		var compiler = new DrugBag(data);
		return compiler.getOps();
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


/***/ },
/* 20 */
/***/ function(module, exports) {

	"use strict";

	exports.WqueueStateWaitExam = 0;
	exports.WqueueStateInExam = 1;
	exports.WqueueStateWaitCashier = 2;
	exports.WqueueStateWaitDrug = 3;
	exports.WqueueStateWaitReExam = 4;
	exports.WqueueStateWaitAppoint = 5;

	exports.PharmaQueueStateWaitPack = 0;
	exports.PharmaQueueStateInPack   = 1;
	exports.PharmaQueueStatePackDone = 2;

	exports.DiseaseEndReasonNotEnded = "N";
	exports.DiseaseEndReasonCured = "C";
	exports.DiseaseEndReasonStopped = "S";
	exports.DiseaseEndReasonDead = "D";

	exports.DrugCategoryNaifuku = 0;
	exports.DrugCategoryTonpuku = 1;
	exports.DrugCategoryGaiyou  = 2;

	exports.ConductKindHikaChuusha = 0;
	exports.ConductKindJoumyakuChuusha = 1;
	exports.ConductKindOtherChuusha = 2;
	exports.ConductKindGazou = 3;

	exports.ZaikeiNaifuku = 1;
	exports.ZaikeiOther = 3;
	exports.ZaikeiChuusha = 4;
	exports.ZaikeiGaiyou = 6;
	exports.ZaikeiShikaYakuzai = 8;
	exports.ZaikeiShikaTokutei = 9;

	exports.SmallestPostfixShuushokugoCode = 8000;
	exports.LargestPostfixShuushookugoCode = 8999;

	exports.MeisaiSections = [
	        "初・再診料", "医学管理等", "在宅医療", "検査", "画像診断",
	        "投薬", "注射", "処置", "その他"       
	    ];

	exports.SHUUKEI_SHOSHIN = "110";
	exports.SHUUKEI_SAISHIN_SAISHIN = "120";
	exports.SHUUKEI_SAISHIN_GAIRAIKANRI = "122";
	exports.SHUUKEI_SAISHIN_JIKANGAI = "123";
	exports.SHUUKEI_SAISHIN_KYUUJITSU = "124";
	exports.SHUUKEI_SAISHIN_SHINYA = "125";
	exports.SHUUKEI_SHIDO = "130";
	exports.SHUUKEI_ZAITAKU = "140";
	exports.SHUUKEI_TOYAKU_NAIFUKUTONPUKUCHOZAI = "210";
	exports.SHUUKEI_TOYAKU_GAIYOCHOZAI = "230";
	exports.SHUUKEI_TOYAKU_SHOHO = "250";
	exports.SHUUKEI_TOYAKU_MADOKU = "260";
	exports.SHUUKEI_TOYAKU_CHOKI = "270";
	exports.SHUUKEI_CHUSHA_SEIBUTSUETC = "300";
	exports.SHUUKEI_CHUSHA_HIKA = "311";
	exports.SHUUKEI_CHUSHA_JOMYAKU = "321";
	exports.SHUUKEI_CHUSHA_OTHERS = "331";
	exports.SHUUKEI_SHOCHI = "400";
	exports.SHUUKEI_SHUJUTSU_SHUJUTSU = "500";
	exports.SHUUKEI_SHUJUTSU_YUKETSU = "502";
	exports.SHUUKEI_MASUI = "540";
	exports.SHUUKEI_KENSA = "600";
	exports.SHUUKEI_GAZOSHINDAN = "700";
	exports.SHUUKEI_OTHERS = "800";

	exports.HOUKATSU_NONE = '00';
	exports.HOUKATSU_KETSUEKIKageKU = "01";
	exports.HOUKATSU_ENDOCRINE = "02";
	exports.HOUKATSU_HEPATITIS = "03";
	exports.HOUKATSU_TUMOR = "04";
	exports.HOUKATSU_TUMORMISC = "05";
	exports.HOUKATSU_COAGULO = "06";
	exports.HOUKATSU_AUTOANTIBODY = "07";
	exports.HOUKATSU_TOLERANCE = "08";


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	// var service = require("./pharma-service");
	// var task = require("./task");
	var mConsts = __webpack_require__(20);
	var DrugBag = __webpack_require__(8).DrugBag;
	var DrawerCompiler = __webpack_require__(10).Compiler;
	var kanjidate = __webpack_require__(18);

	exports.createData = function(drug, visit, patient, pharmaDrug, clinicName, clinicAddr){
		return {
			kind: drugCategoryToSlug(drug.d_category),
			instructions: composeInstructions(drug.d_category, 
	            drug.d_usage, drug.d_amount, drug.unit, drug.d_days, drug.d_iyakuhincode),
			drug_name: composeDrugName(drug.name, drug.d_iyakuhincode),
			patient_name: patient.last_name + " " + patient.first_name,
			patient_name_yomi: patient.last_name_yomi + " " + patient.first_name_yomi,
			desc: pharmaDrug ? composeDesc(pharmaDrug.description, pharmaDrug.sideeffect) : "",
			prescribed_at: kanjidate.format(kanjidate.f2, visit.v_datetime),
			clinic_name: clinicName,
			clinic_address: clinicAddr
		};
	}

	function drugCategoryToSlug(category){
	    switch(category){
	        case mConsts.DrugCategoryNaifuku: return "naifuku";
	        case mConsts.DrugCategoryTonpuku: return "tonpuku";
	        case mConsts.DrugCategoryGaiyou:  return "gaiyou";
	        default: return "sonota";
	    }
	}

	var PrinterFont = DrugBag.drugBoxFontSize;
	var DrugBoxWidth = DrugBag.drugBoxWidth;
	var DescFont = DrugBag.descFontSize;
	var DescWidth = DrugBag.descContentBoxWidth;

	function breakLines(line, font, width){
		var lines = DrawerCompiler.breakLines(line, width, font);
		if( lines.length > 1 ){
			return lines.map(function(part){
				return part.replace(/^(\s|[　])+/, "");
			}).join("\n");
		} else {
			return line;
		}
	}

	var PowderDrugs = {  // iyakuhincode =>  pack
		"620000007": 0.5,  // アトミフェンＤＳ
		"620721001": 1.0,  // シーピーＧ
		"613180070": 1.0,  // シーピーＧ
		"620420001": 1.0,  // ビオフェルミン
		"612370050": 1.0,  // ビオフェルミン
		"620160501": 1.0,  // ＰＬ
		"611180001": 1.0,  // ＰＬ
		"620161301": 1.0,  // 幼児用ＰＬ
		"620459001": 0.67,  // マーズレンＳ
		"612320261": 0.67,  // マーズレンＳ
		"613940051": 1.0,  // ウラリットーＵ
		"620491801": 0.5,  // アローゼン
		"612350003": 0.5,  // アローゼン
		"610462036": 1.0,  // コデイン散
		"620392528": 1.0,  // コデイン散
	};

	function kanjiToDigit(s){
		switch(s){
			case "０": return "0";
			case "１": return "1";
			case "２": return "2";
			case "３": return "3";
			case "４": return "4";
			case "５": return "5";
			case "６": return "6";
			case "７": return "7";
			case "８": return "8";
			case "９": return "9";
			default: return s;
		}
	}

	function digitToKanji(s){
		switch(s){
			case "0": return "０";
			case "1": return "１";
			case "2": return "２";
			case "3": return "３";
			case "4": return "４";
			case "5": return "５";
			case "6": return "６";
			case "7": return "７";
			case "8": return "８";
			case "9": return "９";
			default: return s;
		}
	}

	function numToKanji(s){
		switch(s){
			case ".": "．";
			default: return digitToKanji(s);
		}
	}

	function kanjiStringToDigitString(str){
		return str.split("").map(kanjiToDigit).join("");
	}

	function digitStringToKanjiString(str){
		return str.split("").map(digitToKanji).join("");
	}

	function numStringToKanjiString(str){
		return str.split("").map(numToKanji).join("");
	}

	function extractTimesParts(src){
		var parts = src.split(/,|、/);
		var results = [];
		parts.forEach(function(part){
			var m;
			part = part.trim();
			if( m = part.match(/^毎食(.+)/) ){
				["朝", "昼", "夕"].forEach(function(d){
					results.push(d + "食" + m[1]);
				})
			} else if( m = part.match(/^(朝|昼|夕)食(.+)/)){
				m[1].split("").forEach(function(d){
					results.push(d + "食" + m[1]);
				})
			} else {
				results.push(part);
			}
		});
		return results;
	}

	function parseUnevenWeights(uneven){
		uneven = uneven.split("").map(function(ch){
			if( ch === "-" || ch === "ー" || ch === "－" ){
				return "-";
			} else if( ch === " " || ch === "\t" ){
				return "";
			} else if( ch === "." || ch === "．" ){
				return ".";
			} else {
				ch = kanjiToDigit(ch);
				if( ch >= "0" && ch <= "9" ){
					return ch;
				} else {
					throw new Error("invalid char in uneven weights");
				}
			}
		}).join("");
		return uneven.split("-").map(function(part){
			return Number(part);
		});
	}

	function dosageRep(dose, unit){
		// if( dose == 0.5 && unit === "包" ){
		// 	return "半包";
		// }
	    return numStringToKanjiString("" + dose) + unit;
	}

	function probeUneven(usage){
		return usage.match(/^(.*)[(（]([- 　0-9０-９.．ー－]+)[)）](.*)/);
	}

	function naifukuNoTimes(usage, amount, unit, days){
		return [
			"１日" + dosageRep(amount, unit) + " " + 
				numStringToKanjiString("" + days) + "日分",
			usage
		]
	}

	function naifukuUneven(instr, times, pre, uneven, post, amount, unit){
		var usage = (pre + post.trim()).trim();
		var timings = extractTimesParts(usage);
		if( times !== timings.length ){
			throw new Error("inconsistent uneven usage timings");
		}
		var weights = parseUnevenWeights(uneven);
		var totalWeights = weights.reduce(function(sum, val){ return sum + val; }, 0);
		var doses = weights.map(function(w){
			return amount / totalWeights * w;
		});
		var i, n = timings.length;
		var parts = [];
		for(i=0;i<n;i++){
			parts.push(timings[i] + " " + dosageRep(doses[i], unit));
		}
		if( parts.length > 3 ){
			instr.push(parts.join("、"))
		} else {
			for(i=0,n=parts.length;i<n;i++){
				instr.push(parts[i]);
			}
		}
		return instr;
	}

	function naifukuDosage(divide, amount, unit, iyakuhincode){
		var dose = amount / divide;
		if( iyakuhincode in PowderDrugs ){
			dose = dose / PowderDrugs[iyakuhincode];
			if( dose > 0.98 && dose < 1.02 ){
				dose = 1;
			}
			unit = "包";
		}
		return {
			amount: dose,
			unit: unit
		}
	}

	function naifukuEven(instr, times, usage, amount, unit, iyakuhincode){
		var dose;
		instr.push(usage);
		dose =naifukuDosage(times, amount, unit, iyakuhincode);
		instr.push("１回" + dosageRep(dose.amount, dose.unit));
		return instr;
	}

	function naifukuWithTimes(times, usage, amount, unit, days, iyakuhincode){
		var instr = [
			"１日" + numStringToKanjiString("" + times) + "回 " + 
				numStringToKanjiString("" + days) + "日分"
		];
		var m = probeUneven(usage);
		if( m ){
			naifukuUneven(instr, times, m[1], m[2], m[3], amount, unit, iyakuhincode);
		} else {
			naifukuEven(instr, times, usage, amount, unit, iyakuhincode);
		}
		return instr.map(breakLines, PrinterFont, DrugBoxWidth);
	}

	function naifukuInstructions(usage, amount, unit, days, iyakuhincode){
		var m, times;
		usage = usage.trim();
		m = usage.match(/^分([0-9０-９]+)(.*)/);
		if( m ){
			times = Number(kanjiStringToDigitString(m[1]));
			return naifukuWithTimes(times, m[2].trim(), amount, unit, days, iyakuhincode);
		} else {
			return naifukuNoTimes(usage, amount, unit, days);
		}
	}

	function tonpukuInstructions(usage, amount, unit, days, iyakuhincode){
		var first, second;
		first = "１回" + amount + unit + "　" + days + "回分";
		first = numStringToKanjiString(first);
		second = usage;
		return [first, second];
	}

	function composeInstructions(category, usage, amount, unit, days, iyakuhincode){
		if( category === mConsts.DrugCategoryNaifuku ){
			return naifukuInstructions(usage, amount, unit, days, iyakuhincode);
		} else if( category === mConsts.DrugCategoryTonpuku ){
			return tonpukuInstructions(usage, amount, unit, days, iyakuhincode);
		} else if( category === mConsts.DrugCategoryGaiyou ){
			return [usage];
		} else {
			return [];
		}
	};

	function composeDrugName(name, iyakuhincode){
		if( iyakuhincode in PowderDrugs ){
			name += " （１包" + numStringToKanjiString("" + PowderDrugs[iyakuhincode]) + "ｇ）";
		}
		return breakLines(name, PrinterFont, DrugBoxWidth);
	}

	function composeDesc(description, sideEffect){
		return breakLines("【効能】" + description + "【副作用】" + sideEffect, DescFont, DescWidth);
		
	}



/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var conti = __webpack_require__(5);

	var printServerPort = 8082;

	function printServerUrl(){
		return "/printer";
		// return location.protocol + "//" + "localhost" + ":" + printServerPort;
	}

	exports.setPrintServerPort = function(port){
		printServerPort = port;
	};

	exports.print = function(pages, setting, done){
		conti.fetchText(printServerUrl() + "/print", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				pages: pages,
				setting: setting
			}),
			mode: "cors",
			cache: "no-cache"
		}, function(err, ret){
			if( err ){
				done(err);
				return;
			}
			if( ret === "ok" ){
				done();
			} else {
				done(ret);
			}
		});
	};

	exports.listSettings = function(cb){
		conti.fetchJson(printServerUrl() + "/setting", {
			method: "GET",
			mode: "cors",
			cache: "no-cache"
		}, cb);
	};

	exports.getSetting = function(key){
		return window.localStorage.getItem(key);
	};

	exports.setSetting = function(key, value){
		if( value ){
			window.localStorage.setItem(key, value);
		} else {
			removeSetting(key);
		}
	};

	function removeSetting(key){
		window.localStorage.removeItem(key);
	}

	exports.openManagePage = function(target){
		open(printServerUrl(), target);
	}





/***/ },
/* 23 */
/***/ function(module, exports) {

	"use strict";

	exports.prescPrinterSettingKey = "pharma:presc-printer-setting";
	exports.drugbagPrinterSettingKey = "pharma:drugbag-printer-setting";
	exports.techouPrinterSettingKey = "pharma:techou-printer-setting";


/***/ }
/******/ ]);