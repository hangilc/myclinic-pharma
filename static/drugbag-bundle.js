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
	var task = __webpack_require__(2);
	var DrugBagData = __webpack_require__(4);
	var DrugBag = __webpack_require__(6).DrugBag;
	var DrawerSVG = __webpack_require__(15);
	var moment = __webpack_require__(16);
	var kanjidate = __webpack_require__(18);

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



/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";

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
	}

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

	exports.findPharmaDrug = function(drugId, cb){
		cb(undefined, {
			description: "DESCRIPTION",
			sideeffect: "SIDEEFFECT"
		})
	};

	exports.prescDone = function(visitId, done){
		done();
	};


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var conti = __webpack_require__(3);

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
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

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
		exports.fetch(url, opt, "json", cb);
	}

	exports.fetchText = function (url, opt, cb){
		exports.fetch(url, opt, "text", cb);
	}

	})( true ? exports : (window.conti = {}));

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var service = __webpack_require__(1);
	var task = __webpack_require__(2);
	var mConsts = __webpack_require__(5);
	var DrugBag = __webpack_require__(6).DrugBag;
	var DrawerCompiler = __webpack_require__(8).Compiler;

	exports.composeData = function(drugId, cb){
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
			var data = {
				kind: drugCategoryToSlug(drug.d_category),
				instructions: composeInstructions(drug.d_category, 
	                drug.d_usage, drug.d_amount, drug.unit, drug.d_days, drug.d_iyakuhincode),
				drug_name: composeDrugName(drug.name, drug.d_iyakuhincode),
				patient_name: patient.last_name + " " + patient.first_name,
				patient_name_yomi: patient.last_name_yomi + " " + patient.first_name_yomi,
				desc: pharmaDrug ? composeDesc(pharmaDrug.description, pharmaDrug.sideeffect) : ""
			}
			cb(undefined, data);
		})
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
/* 5 */
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
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.Shohousen = __webpack_require__(7);
	exports.Refer = __webpack_require__(12);
	exports.DrugBag = __webpack_require__(13);
	exports.PrescContent = __webpack_require__(14);




/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var Compiler = __webpack_require__(8).Compiler;
	var Box = __webpack_require__(8).Box;

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
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var Ops = __webpack_require__(9);
	var Box = __webpack_require__(10);
	var Compiler = __webpack_require__(11);

	exports.op = Ops;
	exports.Box = Box;
	exports.Compiler = Compiler;




/***/ },
/* 9 */
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
/* 10 */
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
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var drawerOps = __webpack_require__(9);
	var Box = __webpack_require__(10);

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
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var Compiler = __webpack_require__(8).Compiler;
	var Box = __webpack_require__(8).Box;

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
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var Compiler = __webpack_require__(8).Compiler;
	var Box = __webpack_require__(8).Box;

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
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var Compiler = __webpack_require__(8).Compiler;
	var Box = __webpack_require__(8).Box;

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
/* 15 */
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
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {//! moment.js
	//! version : 2.15.0
	//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
	//! license : MIT
	//! momentjs.com

	;(function (global, factory) {
	     true ? module.exports = factory() :
	    typeof define === 'function' && define.amd ? define(factory) :
	    global.moment = factory()
	}(this, function () { 'use strict';

	    var hookCallback;

	    function utils_hooks__hooks () {
	        return hookCallback.apply(null, arguments);
	    }

	    // This is done to register the method called with moment()
	    // without creating circular dependencies.
	    function setHookCallback (callback) {
	        hookCallback = callback;
	    }

	    function isArray(input) {
	        return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
	    }

	    function isObject(input) {
	        // IE8 will treat undefined and null as object if it wasn't for
	        // input != null
	        return input != null && Object.prototype.toString.call(input) === '[object Object]';
	    }

	    function isObjectEmpty(obj) {
	        var k;
	        for (k in obj) {
	            // even if its not own property I'd still call it non-empty
	            return false;
	        }
	        return true;
	    }

	    function isDate(input) {
	        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
	    }

	    function map(arr, fn) {
	        var res = [], i;
	        for (i = 0; i < arr.length; ++i) {
	            res.push(fn(arr[i], i));
	        }
	        return res;
	    }

	    function hasOwnProp(a, b) {
	        return Object.prototype.hasOwnProperty.call(a, b);
	    }

	    function extend(a, b) {
	        for (var i in b) {
	            if (hasOwnProp(b, i)) {
	                a[i] = b[i];
	            }
	        }

	        if (hasOwnProp(b, 'toString')) {
	            a.toString = b.toString;
	        }

	        if (hasOwnProp(b, 'valueOf')) {
	            a.valueOf = b.valueOf;
	        }

	        return a;
	    }

	    function create_utc__createUTC (input, format, locale, strict) {
	        return createLocalOrUTC(input, format, locale, strict, true).utc();
	    }

	    function defaultParsingFlags() {
	        // We need to deep clone this object.
	        return {
	            empty           : false,
	            unusedTokens    : [],
	            unusedInput     : [],
	            overflow        : -2,
	            charsLeftOver   : 0,
	            nullInput       : false,
	            invalidMonth    : null,
	            invalidFormat   : false,
	            userInvalidated : false,
	            iso             : false,
	            parsedDateParts : [],
	            meridiem        : null
	        };
	    }

	    function getParsingFlags(m) {
	        if (m._pf == null) {
	            m._pf = defaultParsingFlags();
	        }
	        return m._pf;
	    }

	    var some;
	    if (Array.prototype.some) {
	        some = Array.prototype.some;
	    } else {
	        some = function (fun) {
	            var t = Object(this);
	            var len = t.length >>> 0;

	            for (var i = 0; i < len; i++) {
	                if (i in t && fun.call(this, t[i], i, t)) {
	                    return true;
	                }
	            }

	            return false;
	        };
	    }

	    function valid__isValid(m) {
	        if (m._isValid == null) {
	            var flags = getParsingFlags(m);
	            var parsedParts = some.call(flags.parsedDateParts, function (i) {
	                return i != null;
	            });
	            var isNowValid = !isNaN(m._d.getTime()) &&
	                flags.overflow < 0 &&
	                !flags.empty &&
	                !flags.invalidMonth &&
	                !flags.invalidWeekday &&
	                !flags.nullInput &&
	                !flags.invalidFormat &&
	                !flags.userInvalidated &&
	                (!flags.meridiem || (flags.meridiem && parsedParts));

	            if (m._strict) {
	                isNowValid = isNowValid &&
	                    flags.charsLeftOver === 0 &&
	                    flags.unusedTokens.length === 0 &&
	                    flags.bigHour === undefined;
	            }

	            if (Object.isFrozen == null || !Object.isFrozen(m)) {
	                m._isValid = isNowValid;
	            }
	            else {
	                return isNowValid;
	            }
	        }
	        return m._isValid;
	    }

	    function valid__createInvalid (flags) {
	        var m = create_utc__createUTC(NaN);
	        if (flags != null) {
	            extend(getParsingFlags(m), flags);
	        }
	        else {
	            getParsingFlags(m).userInvalidated = true;
	        }

	        return m;
	    }

	    function isUndefined(input) {
	        return input === void 0;
	    }

	    // Plugins that add properties should also add the key here (null value),
	    // so we can properly clone ourselves.
	    var momentProperties = utils_hooks__hooks.momentProperties = [];

	    function copyConfig(to, from) {
	        var i, prop, val;

	        if (!isUndefined(from._isAMomentObject)) {
	            to._isAMomentObject = from._isAMomentObject;
	        }
	        if (!isUndefined(from._i)) {
	            to._i = from._i;
	        }
	        if (!isUndefined(from._f)) {
	            to._f = from._f;
	        }
	        if (!isUndefined(from._l)) {
	            to._l = from._l;
	        }
	        if (!isUndefined(from._strict)) {
	            to._strict = from._strict;
	        }
	        if (!isUndefined(from._tzm)) {
	            to._tzm = from._tzm;
	        }
	        if (!isUndefined(from._isUTC)) {
	            to._isUTC = from._isUTC;
	        }
	        if (!isUndefined(from._offset)) {
	            to._offset = from._offset;
	        }
	        if (!isUndefined(from._pf)) {
	            to._pf = getParsingFlags(from);
	        }
	        if (!isUndefined(from._locale)) {
	            to._locale = from._locale;
	        }

	        if (momentProperties.length > 0) {
	            for (i in momentProperties) {
	                prop = momentProperties[i];
	                val = from[prop];
	                if (!isUndefined(val)) {
	                    to[prop] = val;
	                }
	            }
	        }

	        return to;
	    }

	    var updateInProgress = false;

	    // Moment prototype object
	    function Moment(config) {
	        copyConfig(this, config);
	        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
	        // Prevent infinite loop in case updateOffset creates new moment
	        // objects.
	        if (updateInProgress === false) {
	            updateInProgress = true;
	            utils_hooks__hooks.updateOffset(this);
	            updateInProgress = false;
	        }
	    }

	    function isMoment (obj) {
	        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
	    }

	    function absFloor (number) {
	        if (number < 0) {
	            // -0 -> 0
	            return Math.ceil(number) || 0;
	        } else {
	            return Math.floor(number);
	        }
	    }

	    function toInt(argumentForCoercion) {
	        var coercedNumber = +argumentForCoercion,
	            value = 0;

	        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
	            value = absFloor(coercedNumber);
	        }

	        return value;
	    }

	    // compare two arrays, return the number of differences
	    function compareArrays(array1, array2, dontConvert) {
	        var len = Math.min(array1.length, array2.length),
	            lengthDiff = Math.abs(array1.length - array2.length),
	            diffs = 0,
	            i;
	        for (i = 0; i < len; i++) {
	            if ((dontConvert && array1[i] !== array2[i]) ||
	                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
	                diffs++;
	            }
	        }
	        return diffs + lengthDiff;
	    }

	    function warn(msg) {
	        if (utils_hooks__hooks.suppressDeprecationWarnings === false &&
	                (typeof console !==  'undefined') && console.warn) {
	            console.warn('Deprecation warning: ' + msg);
	        }
	    }

	    function deprecate(msg, fn) {
	        var firstTime = true;

	        return extend(function () {
	            if (utils_hooks__hooks.deprecationHandler != null) {
	                utils_hooks__hooks.deprecationHandler(null, msg);
	            }
	            if (firstTime) {
	                var args = [];
	                var arg;
	                for (var i = 0; i < arguments.length; i++) {
	                    arg = '';
	                    if (typeof arguments[i] === 'object') {
	                        arg += '\n[' + i + '] ';
	                        for (var key in arguments[0]) {
	                            arg += key + ': ' + arguments[0][key] + ', ';
	                        }
	                        arg = arg.slice(0, -2); // Remove trailing comma and space
	                    } else {
	                        arg = arguments[i];
	                    }
	                    args.push(arg);
	                }
	                warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + (new Error()).stack);
	                firstTime = false;
	            }
	            return fn.apply(this, arguments);
	        }, fn);
	    }

	    var deprecations = {};

	    function deprecateSimple(name, msg) {
	        if (utils_hooks__hooks.deprecationHandler != null) {
	            utils_hooks__hooks.deprecationHandler(name, msg);
	        }
	        if (!deprecations[name]) {
	            warn(msg);
	            deprecations[name] = true;
	        }
	    }

	    utils_hooks__hooks.suppressDeprecationWarnings = false;
	    utils_hooks__hooks.deprecationHandler = null;

	    function isFunction(input) {
	        return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
	    }

	    function locale_set__set (config) {
	        var prop, i;
	        for (i in config) {
	            prop = config[i];
	            if (isFunction(prop)) {
	                this[i] = prop;
	            } else {
	                this['_' + i] = prop;
	            }
	        }
	        this._config = config;
	        // Lenient ordinal parsing accepts just a number in addition to
	        // number + (possibly) stuff coming from _ordinalParseLenient.
	        this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + (/\d{1,2}/).source);
	    }

	    function mergeConfigs(parentConfig, childConfig) {
	        var res = extend({}, parentConfig), prop;
	        for (prop in childConfig) {
	            if (hasOwnProp(childConfig, prop)) {
	                if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
	                    res[prop] = {};
	                    extend(res[prop], parentConfig[prop]);
	                    extend(res[prop], childConfig[prop]);
	                } else if (childConfig[prop] != null) {
	                    res[prop] = childConfig[prop];
	                } else {
	                    delete res[prop];
	                }
	            }
	        }
	        for (prop in parentConfig) {
	            if (hasOwnProp(parentConfig, prop) &&
	                    !hasOwnProp(childConfig, prop) &&
	                    isObject(parentConfig[prop])) {
	                // make sure changes to properties don't modify parent config
	                res[prop] = extend({}, res[prop]);
	            }
	        }
	        return res;
	    }

	    function Locale(config) {
	        if (config != null) {
	            this.set(config);
	        }
	    }

	    var keys;

	    if (Object.keys) {
	        keys = Object.keys;
	    } else {
	        keys = function (obj) {
	            var i, res = [];
	            for (i in obj) {
	                if (hasOwnProp(obj, i)) {
	                    res.push(i);
	                }
	            }
	            return res;
	        };
	    }

	    var defaultCalendar = {
	        sameDay : '[Today at] LT',
	        nextDay : '[Tomorrow at] LT',
	        nextWeek : 'dddd [at] LT',
	        lastDay : '[Yesterday at] LT',
	        lastWeek : '[Last] dddd [at] LT',
	        sameElse : 'L'
	    };

	    function locale_calendar__calendar (key, mom, now) {
	        var output = this._calendar[key] || this._calendar['sameElse'];
	        return isFunction(output) ? output.call(mom, now) : output;
	    }

	    var defaultLongDateFormat = {
	        LTS  : 'h:mm:ss A',
	        LT   : 'h:mm A',
	        L    : 'MM/DD/YYYY',
	        LL   : 'MMMM D, YYYY',
	        LLL  : 'MMMM D, YYYY h:mm A',
	        LLLL : 'dddd, MMMM D, YYYY h:mm A'
	    };

	    function longDateFormat (key) {
	        var format = this._longDateFormat[key],
	            formatUpper = this._longDateFormat[key.toUpperCase()];

	        if (format || !formatUpper) {
	            return format;
	        }

	        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
	            return val.slice(1);
	        });

	        return this._longDateFormat[key];
	    }

	    var defaultInvalidDate = 'Invalid date';

	    function invalidDate () {
	        return this._invalidDate;
	    }

	    var defaultOrdinal = '%d';
	    var defaultOrdinalParse = /\d{1,2}/;

	    function ordinal (number) {
	        return this._ordinal.replace('%d', number);
	    }

	    var defaultRelativeTime = {
	        future : 'in %s',
	        past   : '%s ago',
	        s  : 'a few seconds',
	        m  : 'a minute',
	        mm : '%d minutes',
	        h  : 'an hour',
	        hh : '%d hours',
	        d  : 'a day',
	        dd : '%d days',
	        M  : 'a month',
	        MM : '%d months',
	        y  : 'a year',
	        yy : '%d years'
	    };

	    function relative__relativeTime (number, withoutSuffix, string, isFuture) {
	        var output = this._relativeTime[string];
	        return (isFunction(output)) ?
	            output(number, withoutSuffix, string, isFuture) :
	            output.replace(/%d/i, number);
	    }

	    function pastFuture (diff, output) {
	        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
	        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
	    }

	    var aliases = {};

	    function addUnitAlias (unit, shorthand) {
	        var lowerCase = unit.toLowerCase();
	        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
	    }

	    function normalizeUnits(units) {
	        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
	    }

	    function normalizeObjectUnits(inputObject) {
	        var normalizedInput = {},
	            normalizedProp,
	            prop;

	        for (prop in inputObject) {
	            if (hasOwnProp(inputObject, prop)) {
	                normalizedProp = normalizeUnits(prop);
	                if (normalizedProp) {
	                    normalizedInput[normalizedProp] = inputObject[prop];
	                }
	            }
	        }

	        return normalizedInput;
	    }

	    var priorities = {};

	    function addUnitPriority(unit, priority) {
	        priorities[unit] = priority;
	    }

	    function getPrioritizedUnits(unitsObj) {
	        var units = [];
	        for (var u in unitsObj) {
	            units.push({unit: u, priority: priorities[u]});
	        }
	        units.sort(function (a, b) {
	            return a.priority - b.priority;
	        });
	        return units;
	    }

	    function makeGetSet (unit, keepTime) {
	        return function (value) {
	            if (value != null) {
	                get_set__set(this, unit, value);
	                utils_hooks__hooks.updateOffset(this, keepTime);
	                return this;
	            } else {
	                return get_set__get(this, unit);
	            }
	        };
	    }

	    function get_set__get (mom, unit) {
	        return mom.isValid() ?
	            mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
	    }

	    function get_set__set (mom, unit, value) {
	        if (mom.isValid()) {
	            mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
	        }
	    }

	    // MOMENTS

	    function stringGet (units) {
	        units = normalizeUnits(units);
	        if (isFunction(this[units])) {
	            return this[units]();
	        }
	        return this;
	    }


	    function stringSet (units, value) {
	        if (typeof units === 'object') {
	            units = normalizeObjectUnits(units);
	            var prioritized = getPrioritizedUnits(units);
	            for (var i = 0; i < prioritized.length; i++) {
	                this[prioritized[i].unit](units[prioritized[i].unit]);
	            }
	        } else {
	            units = normalizeUnits(units);
	            if (isFunction(this[units])) {
	                return this[units](value);
	            }
	        }
	        return this;
	    }

	    function zeroFill(number, targetLength, forceSign) {
	        var absNumber = '' + Math.abs(number),
	            zerosToFill = targetLength - absNumber.length,
	            sign = number >= 0;
	        return (sign ? (forceSign ? '+' : '') : '-') +
	            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
	    }

	    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

	    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

	    var formatFunctions = {};

	    var formatTokenFunctions = {};

	    // token:    'M'
	    // padded:   ['MM', 2]
	    // ordinal:  'Mo'
	    // callback: function () { this.month() + 1 }
	    function addFormatToken (token, padded, ordinal, callback) {
	        var func = callback;
	        if (typeof callback === 'string') {
	            func = function () {
	                return this[callback]();
	            };
	        }
	        if (token) {
	            formatTokenFunctions[token] = func;
	        }
	        if (padded) {
	            formatTokenFunctions[padded[0]] = function () {
	                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
	            };
	        }
	        if (ordinal) {
	            formatTokenFunctions[ordinal] = function () {
	                return this.localeData().ordinal(func.apply(this, arguments), token);
	            };
	        }
	    }

	    function removeFormattingTokens(input) {
	        if (input.match(/\[[\s\S]/)) {
	            return input.replace(/^\[|\]$/g, '');
	        }
	        return input.replace(/\\/g, '');
	    }

	    function makeFormatFunction(format) {
	        var array = format.match(formattingTokens), i, length;

	        for (i = 0, length = array.length; i < length; i++) {
	            if (formatTokenFunctions[array[i]]) {
	                array[i] = formatTokenFunctions[array[i]];
	            } else {
	                array[i] = removeFormattingTokens(array[i]);
	            }
	        }

	        return function (mom) {
	            var output = '', i;
	            for (i = 0; i < length; i++) {
	                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
	            }
	            return output;
	        };
	    }

	    // format date using native date object
	    function formatMoment(m, format) {
	        if (!m.isValid()) {
	            return m.localeData().invalidDate();
	        }

	        format = expandFormat(format, m.localeData());
	        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

	        return formatFunctions[format](m);
	    }

	    function expandFormat(format, locale) {
	        var i = 5;

	        function replaceLongDateFormatTokens(input) {
	            return locale.longDateFormat(input) || input;
	        }

	        localFormattingTokens.lastIndex = 0;
	        while (i >= 0 && localFormattingTokens.test(format)) {
	            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
	            localFormattingTokens.lastIndex = 0;
	            i -= 1;
	        }

	        return format;
	    }

	    var match1         = /\d/;            //       0 - 9
	    var match2         = /\d\d/;          //      00 - 99
	    var match3         = /\d{3}/;         //     000 - 999
	    var match4         = /\d{4}/;         //    0000 - 9999
	    var match6         = /[+-]?\d{6}/;    // -999999 - 999999
	    var match1to2      = /\d\d?/;         //       0 - 99
	    var match3to4      = /\d\d\d\d?/;     //     999 - 9999
	    var match5to6      = /\d\d\d\d\d\d?/; //   99999 - 999999
	    var match1to3      = /\d{1,3}/;       //       0 - 999
	    var match1to4      = /\d{1,4}/;       //       0 - 9999
	    var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

	    var matchUnsigned  = /\d+/;           //       0 - inf
	    var matchSigned    = /[+-]?\d+/;      //    -inf - inf

	    var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
	    var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

	    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

	    // any word (or two) characters or numbers including two/three word month in arabic.
	    // includes scottish gaelic two word and hyphenated months
	    var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;


	    var regexes = {};

	    function addRegexToken (token, regex, strictRegex) {
	        regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
	            return (isStrict && strictRegex) ? strictRegex : regex;
	        };
	    }

	    function getParseRegexForToken (token, config) {
	        if (!hasOwnProp(regexes, token)) {
	            return new RegExp(unescapeFormat(token));
	        }

	        return regexes[token](config._strict, config._locale);
	    }

	    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
	    function unescapeFormat(s) {
	        return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
	            return p1 || p2 || p3 || p4;
	        }));
	    }

	    function regexEscape(s) {
	        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	    }

	    var tokens = {};

	    function addParseToken (token, callback) {
	        var i, func = callback;
	        if (typeof token === 'string') {
	            token = [token];
	        }
	        if (typeof callback === 'number') {
	            func = function (input, array) {
	                array[callback] = toInt(input);
	            };
	        }
	        for (i = 0; i < token.length; i++) {
	            tokens[token[i]] = func;
	        }
	    }

	    function addWeekParseToken (token, callback) {
	        addParseToken(token, function (input, array, config, token) {
	            config._w = config._w || {};
	            callback(input, config._w, config, token);
	        });
	    }

	    function addTimeToArrayFromToken(token, input, config) {
	        if (input != null && hasOwnProp(tokens, token)) {
	            tokens[token](input, config._a, config, token);
	        }
	    }

	    var YEAR = 0;
	    var MONTH = 1;
	    var DATE = 2;
	    var HOUR = 3;
	    var MINUTE = 4;
	    var SECOND = 5;
	    var MILLISECOND = 6;
	    var WEEK = 7;
	    var WEEKDAY = 8;

	    var indexOf;

	    if (Array.prototype.indexOf) {
	        indexOf = Array.prototype.indexOf;
	    } else {
	        indexOf = function (o) {
	            // I know
	            var i;
	            for (i = 0; i < this.length; ++i) {
	                if (this[i] === o) {
	                    return i;
	                }
	            }
	            return -1;
	        };
	    }

	    function daysInMonth(year, month) {
	        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
	    }

	    // FORMATTING

	    addFormatToken('M', ['MM', 2], 'Mo', function () {
	        return this.month() + 1;
	    });

	    addFormatToken('MMM', 0, 0, function (format) {
	        return this.localeData().monthsShort(this, format);
	    });

	    addFormatToken('MMMM', 0, 0, function (format) {
	        return this.localeData().months(this, format);
	    });

	    // ALIASES

	    addUnitAlias('month', 'M');

	    // PRIORITY

	    addUnitPriority('month', 8);

	    // PARSING

	    addRegexToken('M',    match1to2);
	    addRegexToken('MM',   match1to2, match2);
	    addRegexToken('MMM',  function (isStrict, locale) {
	        return locale.monthsShortRegex(isStrict);
	    });
	    addRegexToken('MMMM', function (isStrict, locale) {
	        return locale.monthsRegex(isStrict);
	    });

	    addParseToken(['M', 'MM'], function (input, array) {
	        array[MONTH] = toInt(input) - 1;
	    });

	    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
	        var month = config._locale.monthsParse(input, token, config._strict);
	        // if we didn't find a month name, mark the date as invalid.
	        if (month != null) {
	            array[MONTH] = month;
	        } else {
	            getParsingFlags(config).invalidMonth = input;
	        }
	    });

	    // LOCALES

	    var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/;
	    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
	    function localeMonths (m, format) {
	        if (!m) {
	            return this._months;
	        }
	        return isArray(this._months) ? this._months[m.month()] :
	            this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
	    }

	    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
	    function localeMonthsShort (m, format) {
	        if (!m) {
	            return this._monthsShort;
	        }
	        return isArray(this._monthsShort) ? this._monthsShort[m.month()] :
	            this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
	    }

	    function units_month__handleStrictParse(monthName, format, strict) {
	        var i, ii, mom, llc = monthName.toLocaleLowerCase();
	        if (!this._monthsParse) {
	            // this is not used
	            this._monthsParse = [];
	            this._longMonthsParse = [];
	            this._shortMonthsParse = [];
	            for (i = 0; i < 12; ++i) {
	                mom = create_utc__createUTC([2000, i]);
	                this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
	                this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
	            }
	        }

	        if (strict) {
	            if (format === 'MMM') {
	                ii = indexOf.call(this._shortMonthsParse, llc);
	                return ii !== -1 ? ii : null;
	            } else {
	                ii = indexOf.call(this._longMonthsParse, llc);
	                return ii !== -1 ? ii : null;
	            }
	        } else {
	            if (format === 'MMM') {
	                ii = indexOf.call(this._shortMonthsParse, llc);
	                if (ii !== -1) {
	                    return ii;
	                }
	                ii = indexOf.call(this._longMonthsParse, llc);
	                return ii !== -1 ? ii : null;
	            } else {
	                ii = indexOf.call(this._longMonthsParse, llc);
	                if (ii !== -1) {
	                    return ii;
	                }
	                ii = indexOf.call(this._shortMonthsParse, llc);
	                return ii !== -1 ? ii : null;
	            }
	        }
	    }

	    function localeMonthsParse (monthName, format, strict) {
	        var i, mom, regex;

	        if (this._monthsParseExact) {
	            return units_month__handleStrictParse.call(this, monthName, format, strict);
	        }

	        if (!this._monthsParse) {
	            this._monthsParse = [];
	            this._longMonthsParse = [];
	            this._shortMonthsParse = [];
	        }

	        // TODO: add sorting
	        // Sorting makes sure if one month (or abbr) is a prefix of another
	        // see sorting in computeMonthsParse
	        for (i = 0; i < 12; i++) {
	            // make the regex if we don't have it already
	            mom = create_utc__createUTC([2000, i]);
	            if (strict && !this._longMonthsParse[i]) {
	                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
	                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
	            }
	            if (!strict && !this._monthsParse[i]) {
	                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
	                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
	            }
	            // test the regex
	            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
	                return i;
	            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
	                return i;
	            } else if (!strict && this._monthsParse[i].test(monthName)) {
	                return i;
	            }
	        }
	    }

	    // MOMENTS

	    function setMonth (mom, value) {
	        var dayOfMonth;

	        if (!mom.isValid()) {
	            // No op
	            return mom;
	        }

	        if (typeof value === 'string') {
	            if (/^\d+$/.test(value)) {
	                value = toInt(value);
	            } else {
	                value = mom.localeData().monthsParse(value);
	                // TODO: Another silent failure?
	                if (typeof value !== 'number') {
	                    return mom;
	                }
	            }
	        }

	        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
	        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
	        return mom;
	    }

	    function getSetMonth (value) {
	        if (value != null) {
	            setMonth(this, value);
	            utils_hooks__hooks.updateOffset(this, true);
	            return this;
	        } else {
	            return get_set__get(this, 'Month');
	        }
	    }

	    function getDaysInMonth () {
	        return daysInMonth(this.year(), this.month());
	    }

	    var defaultMonthsShortRegex = matchWord;
	    function monthsShortRegex (isStrict) {
	        if (this._monthsParseExact) {
	            if (!hasOwnProp(this, '_monthsRegex')) {
	                computeMonthsParse.call(this);
	            }
	            if (isStrict) {
	                return this._monthsShortStrictRegex;
	            } else {
	                return this._monthsShortRegex;
	            }
	        } else {
	            if (!hasOwnProp(this, '_monthsShortRegex')) {
	                this._monthsShortRegex = defaultMonthsShortRegex;
	            }
	            return this._monthsShortStrictRegex && isStrict ?
	                this._monthsShortStrictRegex : this._monthsShortRegex;
	        }
	    }

	    var defaultMonthsRegex = matchWord;
	    function monthsRegex (isStrict) {
	        if (this._monthsParseExact) {
	            if (!hasOwnProp(this, '_monthsRegex')) {
	                computeMonthsParse.call(this);
	            }
	            if (isStrict) {
	                return this._monthsStrictRegex;
	            } else {
	                return this._monthsRegex;
	            }
	        } else {
	            if (!hasOwnProp(this, '_monthsRegex')) {
	                this._monthsRegex = defaultMonthsRegex;
	            }
	            return this._monthsStrictRegex && isStrict ?
	                this._monthsStrictRegex : this._monthsRegex;
	        }
	    }

	    function computeMonthsParse () {
	        function cmpLenRev(a, b) {
	            return b.length - a.length;
	        }

	        var shortPieces = [], longPieces = [], mixedPieces = [],
	            i, mom;
	        for (i = 0; i < 12; i++) {
	            // make the regex if we don't have it already
	            mom = create_utc__createUTC([2000, i]);
	            shortPieces.push(this.monthsShort(mom, ''));
	            longPieces.push(this.months(mom, ''));
	            mixedPieces.push(this.months(mom, ''));
	            mixedPieces.push(this.monthsShort(mom, ''));
	        }
	        // Sorting makes sure if one month (or abbr) is a prefix of another it
	        // will match the longer piece.
	        shortPieces.sort(cmpLenRev);
	        longPieces.sort(cmpLenRev);
	        mixedPieces.sort(cmpLenRev);
	        for (i = 0; i < 12; i++) {
	            shortPieces[i] = regexEscape(shortPieces[i]);
	            longPieces[i] = regexEscape(longPieces[i]);
	        }
	        for (i = 0; i < 24; i++) {
	            mixedPieces[i] = regexEscape(mixedPieces[i]);
	        }

	        this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
	        this._monthsShortRegex = this._monthsRegex;
	        this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
	        this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
	    }

	    // FORMATTING

	    addFormatToken('Y', 0, 0, function () {
	        var y = this.year();
	        return y <= 9999 ? '' + y : '+' + y;
	    });

	    addFormatToken(0, ['YY', 2], 0, function () {
	        return this.year() % 100;
	    });

	    addFormatToken(0, ['YYYY',   4],       0, 'year');
	    addFormatToken(0, ['YYYYY',  5],       0, 'year');
	    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

	    // ALIASES

	    addUnitAlias('year', 'y');

	    // PRIORITIES

	    addUnitPriority('year', 1);

	    // PARSING

	    addRegexToken('Y',      matchSigned);
	    addRegexToken('YY',     match1to2, match2);
	    addRegexToken('YYYY',   match1to4, match4);
	    addRegexToken('YYYYY',  match1to6, match6);
	    addRegexToken('YYYYYY', match1to6, match6);

	    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
	    addParseToken('YYYY', function (input, array) {
	        array[YEAR] = input.length === 2 ? utils_hooks__hooks.parseTwoDigitYear(input) : toInt(input);
	    });
	    addParseToken('YY', function (input, array) {
	        array[YEAR] = utils_hooks__hooks.parseTwoDigitYear(input);
	    });
	    addParseToken('Y', function (input, array) {
	        array[YEAR] = parseInt(input, 10);
	    });

	    // HELPERS

	    function daysInYear(year) {
	        return isLeapYear(year) ? 366 : 365;
	    }

	    function isLeapYear(year) {
	        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	    }

	    // HOOKS

	    utils_hooks__hooks.parseTwoDigitYear = function (input) {
	        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
	    };

	    // MOMENTS

	    var getSetYear = makeGetSet('FullYear', true);

	    function getIsLeapYear () {
	        return isLeapYear(this.year());
	    }

	    function createDate (y, m, d, h, M, s, ms) {
	        //can't just apply() to create a date:
	        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
	        var date = new Date(y, m, d, h, M, s, ms);

	        //the date constructor remaps years 0-99 to 1900-1999
	        if (y < 100 && y >= 0 && isFinite(date.getFullYear())) {
	            date.setFullYear(y);
	        }
	        return date;
	    }

	    function createUTCDate (y) {
	        var date = new Date(Date.UTC.apply(null, arguments));

	        //the Date.UTC function remaps years 0-99 to 1900-1999
	        if (y < 100 && y >= 0 && isFinite(date.getUTCFullYear())) {
	            date.setUTCFullYear(y);
	        }
	        return date;
	    }

	    // start-of-first-week - start-of-year
	    function firstWeekOffset(year, dow, doy) {
	        var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
	            fwd = 7 + dow - doy,
	            // first-week day local weekday -- which local weekday is fwd
	            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

	        return -fwdlw + fwd - 1;
	    }

	    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
	    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
	        var localWeekday = (7 + weekday - dow) % 7,
	            weekOffset = firstWeekOffset(year, dow, doy),
	            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
	            resYear, resDayOfYear;

	        if (dayOfYear <= 0) {
	            resYear = year - 1;
	            resDayOfYear = daysInYear(resYear) + dayOfYear;
	        } else if (dayOfYear > daysInYear(year)) {
	            resYear = year + 1;
	            resDayOfYear = dayOfYear - daysInYear(year);
	        } else {
	            resYear = year;
	            resDayOfYear = dayOfYear;
	        }

	        return {
	            year: resYear,
	            dayOfYear: resDayOfYear
	        };
	    }

	    function weekOfYear(mom, dow, doy) {
	        var weekOffset = firstWeekOffset(mom.year(), dow, doy),
	            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
	            resWeek, resYear;

	        if (week < 1) {
	            resYear = mom.year() - 1;
	            resWeek = week + weeksInYear(resYear, dow, doy);
	        } else if (week > weeksInYear(mom.year(), dow, doy)) {
	            resWeek = week - weeksInYear(mom.year(), dow, doy);
	            resYear = mom.year() + 1;
	        } else {
	            resYear = mom.year();
	            resWeek = week;
	        }

	        return {
	            week: resWeek,
	            year: resYear
	        };
	    }

	    function weeksInYear(year, dow, doy) {
	        var weekOffset = firstWeekOffset(year, dow, doy),
	            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
	        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
	    }

	    // FORMATTING

	    addFormatToken('w', ['ww', 2], 'wo', 'week');
	    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

	    // ALIASES

	    addUnitAlias('week', 'w');
	    addUnitAlias('isoWeek', 'W');

	    // PRIORITIES

	    addUnitPriority('week', 5);
	    addUnitPriority('isoWeek', 5);

	    // PARSING

	    addRegexToken('w',  match1to2);
	    addRegexToken('ww', match1to2, match2);
	    addRegexToken('W',  match1to2);
	    addRegexToken('WW', match1to2, match2);

	    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
	        week[token.substr(0, 1)] = toInt(input);
	    });

	    // HELPERS

	    // LOCALES

	    function localeWeek (mom) {
	        return weekOfYear(mom, this._week.dow, this._week.doy).week;
	    }

	    var defaultLocaleWeek = {
	        dow : 0, // Sunday is the first day of the week.
	        doy : 6  // The week that contains Jan 1st is the first week of the year.
	    };

	    function localeFirstDayOfWeek () {
	        return this._week.dow;
	    }

	    function localeFirstDayOfYear () {
	        return this._week.doy;
	    }

	    // MOMENTS

	    function getSetWeek (input) {
	        var week = this.localeData().week(this);
	        return input == null ? week : this.add((input - week) * 7, 'd');
	    }

	    function getSetISOWeek (input) {
	        var week = weekOfYear(this, 1, 4).week;
	        return input == null ? week : this.add((input - week) * 7, 'd');
	    }

	    // FORMATTING

	    addFormatToken('d', 0, 'do', 'day');

	    addFormatToken('dd', 0, 0, function (format) {
	        return this.localeData().weekdaysMin(this, format);
	    });

	    addFormatToken('ddd', 0, 0, function (format) {
	        return this.localeData().weekdaysShort(this, format);
	    });

	    addFormatToken('dddd', 0, 0, function (format) {
	        return this.localeData().weekdays(this, format);
	    });

	    addFormatToken('e', 0, 0, 'weekday');
	    addFormatToken('E', 0, 0, 'isoWeekday');

	    // ALIASES

	    addUnitAlias('day', 'd');
	    addUnitAlias('weekday', 'e');
	    addUnitAlias('isoWeekday', 'E');

	    // PRIORITY
	    addUnitPriority('day', 11);
	    addUnitPriority('weekday', 11);
	    addUnitPriority('isoWeekday', 11);

	    // PARSING

	    addRegexToken('d',    match1to2);
	    addRegexToken('e',    match1to2);
	    addRegexToken('E',    match1to2);
	    addRegexToken('dd',   function (isStrict, locale) {
	        return locale.weekdaysMinRegex(isStrict);
	    });
	    addRegexToken('ddd',   function (isStrict, locale) {
	        return locale.weekdaysShortRegex(isStrict);
	    });
	    addRegexToken('dddd',   function (isStrict, locale) {
	        return locale.weekdaysRegex(isStrict);
	    });

	    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
	        var weekday = config._locale.weekdaysParse(input, token, config._strict);
	        // if we didn't get a weekday name, mark the date as invalid
	        if (weekday != null) {
	            week.d = weekday;
	        } else {
	            getParsingFlags(config).invalidWeekday = input;
	        }
	    });

	    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
	        week[token] = toInt(input);
	    });

	    // HELPERS

	    function parseWeekday(input, locale) {
	        if (typeof input !== 'string') {
	            return input;
	        }

	        if (!isNaN(input)) {
	            return parseInt(input, 10);
	        }

	        input = locale.weekdaysParse(input);
	        if (typeof input === 'number') {
	            return input;
	        }

	        return null;
	    }

	    function parseIsoWeekday(input, locale) {
	        if (typeof input === 'string') {
	            return locale.weekdaysParse(input) % 7 || 7;
	        }
	        return isNaN(input) ? null : input;
	    }

	    // LOCALES

	    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
	    function localeWeekdays (m, format) {
	        if (!m) {
	            return this._weekdays;
	        }
	        return isArray(this._weekdays) ? this._weekdays[m.day()] :
	            this._weekdays[this._weekdays.isFormat.test(format) ? 'format' : 'standalone'][m.day()];
	    }

	    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
	    function localeWeekdaysShort (m) {
	        return (m) ? this._weekdaysShort[m.day()] : this._weekdaysShort;
	    }

	    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
	    function localeWeekdaysMin (m) {
	        return (m) ? this._weekdaysMin[m.day()] : this._weekdaysMin;
	    }

	    function day_of_week__handleStrictParse(weekdayName, format, strict) {
	        var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
	        if (!this._weekdaysParse) {
	            this._weekdaysParse = [];
	            this._shortWeekdaysParse = [];
	            this._minWeekdaysParse = [];

	            for (i = 0; i < 7; ++i) {
	                mom = create_utc__createUTC([2000, 1]).day(i);
	                this._minWeekdaysParse[i] = this.weekdaysMin(mom, '').toLocaleLowerCase();
	                this._shortWeekdaysParse[i] = this.weekdaysShort(mom, '').toLocaleLowerCase();
	                this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
	            }
	        }

	        if (strict) {
	            if (format === 'dddd') {
	                ii = indexOf.call(this._weekdaysParse, llc);
	                return ii !== -1 ? ii : null;
	            } else if (format === 'ddd') {
	                ii = indexOf.call(this._shortWeekdaysParse, llc);
	                return ii !== -1 ? ii : null;
	            } else {
	                ii = indexOf.call(this._minWeekdaysParse, llc);
	                return ii !== -1 ? ii : null;
	            }
	        } else {
	            if (format === 'dddd') {
	                ii = indexOf.call(this._weekdaysParse, llc);
	                if (ii !== -1) {
	                    return ii;
	                }
	                ii = indexOf.call(this._shortWeekdaysParse, llc);
	                if (ii !== -1) {
	                    return ii;
	                }
	                ii = indexOf.call(this._minWeekdaysParse, llc);
	                return ii !== -1 ? ii : null;
	            } else if (format === 'ddd') {
	                ii = indexOf.call(this._shortWeekdaysParse, llc);
	                if (ii !== -1) {
	                    return ii;
	                }
	                ii = indexOf.call(this._weekdaysParse, llc);
	                if (ii !== -1) {
	                    return ii;
	                }
	                ii = indexOf.call(this._minWeekdaysParse, llc);
	                return ii !== -1 ? ii : null;
	            } else {
	                ii = indexOf.call(this._minWeekdaysParse, llc);
	                if (ii !== -1) {
	                    return ii;
	                }
	                ii = indexOf.call(this._weekdaysParse, llc);
	                if (ii !== -1) {
	                    return ii;
	                }
	                ii = indexOf.call(this._shortWeekdaysParse, llc);
	                return ii !== -1 ? ii : null;
	            }
	        }
	    }

	    function localeWeekdaysParse (weekdayName, format, strict) {
	        var i, mom, regex;

	        if (this._weekdaysParseExact) {
	            return day_of_week__handleStrictParse.call(this, weekdayName, format, strict);
	        }

	        if (!this._weekdaysParse) {
	            this._weekdaysParse = [];
	            this._minWeekdaysParse = [];
	            this._shortWeekdaysParse = [];
	            this._fullWeekdaysParse = [];
	        }

	        for (i = 0; i < 7; i++) {
	            // make the regex if we don't have it already

	            mom = create_utc__createUTC([2000, 1]).day(i);
	            if (strict && !this._fullWeekdaysParse[i]) {
	                this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\.?') + '$', 'i');
	                this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\.?') + '$', 'i');
	                this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\.?') + '$', 'i');
	            }
	            if (!this._weekdaysParse[i]) {
	                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
	                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
	            }
	            // test the regex
	            if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
	                return i;
	            } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
	                return i;
	            } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
	                return i;
	            } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
	                return i;
	            }
	        }
	    }

	    // MOMENTS

	    function getSetDayOfWeek (input) {
	        if (!this.isValid()) {
	            return input != null ? this : NaN;
	        }
	        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
	        if (input != null) {
	            input = parseWeekday(input, this.localeData());
	            return this.add(input - day, 'd');
	        } else {
	            return day;
	        }
	    }

	    function getSetLocaleDayOfWeek (input) {
	        if (!this.isValid()) {
	            return input != null ? this : NaN;
	        }
	        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
	        return input == null ? weekday : this.add(input - weekday, 'd');
	    }

	    function getSetISODayOfWeek (input) {
	        if (!this.isValid()) {
	            return input != null ? this : NaN;
	        }

	        // behaves the same as moment#day except
	        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
	        // as a setter, sunday should belong to the previous week.

	        if (input != null) {
	            var weekday = parseIsoWeekday(input, this.localeData());
	            return this.day(this.day() % 7 ? weekday : weekday - 7);
	        } else {
	            return this.day() || 7;
	        }
	    }

	    var defaultWeekdaysRegex = matchWord;
	    function weekdaysRegex (isStrict) {
	        if (this._weekdaysParseExact) {
	            if (!hasOwnProp(this, '_weekdaysRegex')) {
	                computeWeekdaysParse.call(this);
	            }
	            if (isStrict) {
	                return this._weekdaysStrictRegex;
	            } else {
	                return this._weekdaysRegex;
	            }
	        } else {
	            if (!hasOwnProp(this, '_weekdaysRegex')) {
	                this._weekdaysRegex = defaultWeekdaysRegex;
	            }
	            return this._weekdaysStrictRegex && isStrict ?
	                this._weekdaysStrictRegex : this._weekdaysRegex;
	        }
	    }

	    var defaultWeekdaysShortRegex = matchWord;
	    function weekdaysShortRegex (isStrict) {
	        if (this._weekdaysParseExact) {
	            if (!hasOwnProp(this, '_weekdaysRegex')) {
	                computeWeekdaysParse.call(this);
	            }
	            if (isStrict) {
	                return this._weekdaysShortStrictRegex;
	            } else {
	                return this._weekdaysShortRegex;
	            }
	        } else {
	            if (!hasOwnProp(this, '_weekdaysShortRegex')) {
	                this._weekdaysShortRegex = defaultWeekdaysShortRegex;
	            }
	            return this._weekdaysShortStrictRegex && isStrict ?
	                this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
	        }
	    }

	    var defaultWeekdaysMinRegex = matchWord;
	    function weekdaysMinRegex (isStrict) {
	        if (this._weekdaysParseExact) {
	            if (!hasOwnProp(this, '_weekdaysRegex')) {
	                computeWeekdaysParse.call(this);
	            }
	            if (isStrict) {
	                return this._weekdaysMinStrictRegex;
	            } else {
	                return this._weekdaysMinRegex;
	            }
	        } else {
	            if (!hasOwnProp(this, '_weekdaysMinRegex')) {
	                this._weekdaysMinRegex = defaultWeekdaysMinRegex;
	            }
	            return this._weekdaysMinStrictRegex && isStrict ?
	                this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
	        }
	    }


	    function computeWeekdaysParse () {
	        function cmpLenRev(a, b) {
	            return b.length - a.length;
	        }

	        var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [],
	            i, mom, minp, shortp, longp;
	        for (i = 0; i < 7; i++) {
	            // make the regex if we don't have it already
	            mom = create_utc__createUTC([2000, 1]).day(i);
	            minp = this.weekdaysMin(mom, '');
	            shortp = this.weekdaysShort(mom, '');
	            longp = this.weekdays(mom, '');
	            minPieces.push(minp);
	            shortPieces.push(shortp);
	            longPieces.push(longp);
	            mixedPieces.push(minp);
	            mixedPieces.push(shortp);
	            mixedPieces.push(longp);
	        }
	        // Sorting makes sure if one weekday (or abbr) is a prefix of another it
	        // will match the longer piece.
	        minPieces.sort(cmpLenRev);
	        shortPieces.sort(cmpLenRev);
	        longPieces.sort(cmpLenRev);
	        mixedPieces.sort(cmpLenRev);
	        for (i = 0; i < 7; i++) {
	            shortPieces[i] = regexEscape(shortPieces[i]);
	            longPieces[i] = regexEscape(longPieces[i]);
	            mixedPieces[i] = regexEscape(mixedPieces[i]);
	        }

	        this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
	        this._weekdaysShortRegex = this._weekdaysRegex;
	        this._weekdaysMinRegex = this._weekdaysRegex;

	        this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
	        this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
	        this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
	    }

	    // FORMATTING

	    function hFormat() {
	        return this.hours() % 12 || 12;
	    }

	    function kFormat() {
	        return this.hours() || 24;
	    }

	    addFormatToken('H', ['HH', 2], 0, 'hour');
	    addFormatToken('h', ['hh', 2], 0, hFormat);
	    addFormatToken('k', ['kk', 2], 0, kFormat);

	    addFormatToken('hmm', 0, 0, function () {
	        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
	    });

	    addFormatToken('hmmss', 0, 0, function () {
	        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) +
	            zeroFill(this.seconds(), 2);
	    });

	    addFormatToken('Hmm', 0, 0, function () {
	        return '' + this.hours() + zeroFill(this.minutes(), 2);
	    });

	    addFormatToken('Hmmss', 0, 0, function () {
	        return '' + this.hours() + zeroFill(this.minutes(), 2) +
	            zeroFill(this.seconds(), 2);
	    });

	    function meridiem (token, lowercase) {
	        addFormatToken(token, 0, 0, function () {
	            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
	        });
	    }

	    meridiem('a', true);
	    meridiem('A', false);

	    // ALIASES

	    addUnitAlias('hour', 'h');

	    // PRIORITY
	    addUnitPriority('hour', 13);

	    // PARSING

	    function matchMeridiem (isStrict, locale) {
	        return locale._meridiemParse;
	    }

	    addRegexToken('a',  matchMeridiem);
	    addRegexToken('A',  matchMeridiem);
	    addRegexToken('H',  match1to2);
	    addRegexToken('h',  match1to2);
	    addRegexToken('HH', match1to2, match2);
	    addRegexToken('hh', match1to2, match2);

	    addRegexToken('hmm', match3to4);
	    addRegexToken('hmmss', match5to6);
	    addRegexToken('Hmm', match3to4);
	    addRegexToken('Hmmss', match5to6);

	    addParseToken(['H', 'HH'], HOUR);
	    addParseToken(['a', 'A'], function (input, array, config) {
	        config._isPm = config._locale.isPM(input);
	        config._meridiem = input;
	    });
	    addParseToken(['h', 'hh'], function (input, array, config) {
	        array[HOUR] = toInt(input);
	        getParsingFlags(config).bigHour = true;
	    });
	    addParseToken('hmm', function (input, array, config) {
	        var pos = input.length - 2;
	        array[HOUR] = toInt(input.substr(0, pos));
	        array[MINUTE] = toInt(input.substr(pos));
	        getParsingFlags(config).bigHour = true;
	    });
	    addParseToken('hmmss', function (input, array, config) {
	        var pos1 = input.length - 4;
	        var pos2 = input.length - 2;
	        array[HOUR] = toInt(input.substr(0, pos1));
	        array[MINUTE] = toInt(input.substr(pos1, 2));
	        array[SECOND] = toInt(input.substr(pos2));
	        getParsingFlags(config).bigHour = true;
	    });
	    addParseToken('Hmm', function (input, array, config) {
	        var pos = input.length - 2;
	        array[HOUR] = toInt(input.substr(0, pos));
	        array[MINUTE] = toInt(input.substr(pos));
	    });
	    addParseToken('Hmmss', function (input, array, config) {
	        var pos1 = input.length - 4;
	        var pos2 = input.length - 2;
	        array[HOUR] = toInt(input.substr(0, pos1));
	        array[MINUTE] = toInt(input.substr(pos1, 2));
	        array[SECOND] = toInt(input.substr(pos2));
	    });

	    // LOCALES

	    function localeIsPM (input) {
	        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
	        // Using charAt should be more compatible.
	        return ((input + '').toLowerCase().charAt(0) === 'p');
	    }

	    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
	    function localeMeridiem (hours, minutes, isLower) {
	        if (hours > 11) {
	            return isLower ? 'pm' : 'PM';
	        } else {
	            return isLower ? 'am' : 'AM';
	        }
	    }


	    // MOMENTS

	    // Setting the hour should keep the time, because the user explicitly
	    // specified which hour he wants. So trying to maintain the same hour (in
	    // a new timezone) makes sense. Adding/subtracting hours does not follow
	    // this rule.
	    var getSetHour = makeGetSet('Hours', true);

	    var baseConfig = {
	        calendar: defaultCalendar,
	        longDateFormat: defaultLongDateFormat,
	        invalidDate: defaultInvalidDate,
	        ordinal: defaultOrdinal,
	        ordinalParse: defaultOrdinalParse,
	        relativeTime: defaultRelativeTime,

	        months: defaultLocaleMonths,
	        monthsShort: defaultLocaleMonthsShort,

	        week: defaultLocaleWeek,

	        weekdays: defaultLocaleWeekdays,
	        weekdaysMin: defaultLocaleWeekdaysMin,
	        weekdaysShort: defaultLocaleWeekdaysShort,

	        meridiemParse: defaultLocaleMeridiemParse
	    };

	    // internal storage for locale config files
	    var locales = {};
	    var globalLocale;

	    function normalizeLocale(key) {
	        return key ? key.toLowerCase().replace('_', '-') : key;
	    }

	    // pick the locale from the array
	    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
	    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
	    function chooseLocale(names) {
	        var i = 0, j, next, locale, split;

	        while (i < names.length) {
	            split = normalizeLocale(names[i]).split('-');
	            j = split.length;
	            next = normalizeLocale(names[i + 1]);
	            next = next ? next.split('-') : null;
	            while (j > 0) {
	                locale = loadLocale(split.slice(0, j).join('-'));
	                if (locale) {
	                    return locale;
	                }
	                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
	                    //the next array item is better than a shallower substring of this one
	                    break;
	                }
	                j--;
	            }
	            i++;
	        }
	        return null;
	    }

	    function loadLocale(name) {
	        var oldLocale = null;
	        // TODO: Find a better way to register and load all the locales in Node
	        if (!locales[name] && (typeof module !== 'undefined') &&
	                module && module.require) {
	            try {
	                oldLocale = globalLocale._abbr;
	                module.require('./locale/' + name);
	                // because defineLocale currently also sets the global locale, we
	                // want to undo that for lazy loaded locales
	                locale_locales__getSetGlobalLocale(oldLocale);
	            } catch (e) { }
	        }
	        return locales[name];
	    }

	    // This function will load locale and then set the global locale.  If
	    // no arguments are passed in, it will simply return the current global
	    // locale key.
	    function locale_locales__getSetGlobalLocale (key, values) {
	        var data;
	        if (key) {
	            if (isUndefined(values)) {
	                data = locale_locales__getLocale(key);
	            }
	            else {
	                data = defineLocale(key, values);
	            }

	            if (data) {
	                // moment.duration._locale = moment._locale = data;
	                globalLocale = data;
	            }
	        }

	        return globalLocale._abbr;
	    }

	    function defineLocale (name, config) {
	        if (config !== null) {
	            var parentConfig = baseConfig;
	            config.abbr = name;
	            if (locales[name] != null) {
	                deprecateSimple('defineLocaleOverride',
	                        'use moment.updateLocale(localeName, config) to change ' +
	                        'an existing locale. moment.defineLocale(localeName, ' +
	                        'config) should only be used for creating a new locale ' +
	                        'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
	                parentConfig = locales[name]._config;
	            } else if (config.parentLocale != null) {
	                if (locales[config.parentLocale] != null) {
	                    parentConfig = locales[config.parentLocale]._config;
	                } else {
	                    // treat as if there is no base config
	                    deprecateSimple('parentLocaleUndefined',
	                            'specified parentLocale is not defined yet. See http://momentjs.com/guides/#/warnings/parent-locale/');
	                }
	            }
	            locales[name] = new Locale(mergeConfigs(parentConfig, config));

	            // backwards compat for now: also set the locale
	            locale_locales__getSetGlobalLocale(name);

	            return locales[name];
	        } else {
	            // useful for testing
	            delete locales[name];
	            return null;
	        }
	    }

	    function updateLocale(name, config) {
	        if (config != null) {
	            var locale, parentConfig = baseConfig;
	            // MERGE
	            if (locales[name] != null) {
	                parentConfig = locales[name]._config;
	            }
	            config = mergeConfigs(parentConfig, config);
	            locale = new Locale(config);
	            locale.parentLocale = locales[name];
	            locales[name] = locale;

	            // backwards compat for now: also set the locale
	            locale_locales__getSetGlobalLocale(name);
	        } else {
	            // pass null for config to unupdate, useful for tests
	            if (locales[name] != null) {
	                if (locales[name].parentLocale != null) {
	                    locales[name] = locales[name].parentLocale;
	                } else if (locales[name] != null) {
	                    delete locales[name];
	                }
	            }
	        }
	        return locales[name];
	    }

	    // returns locale data
	    function locale_locales__getLocale (key) {
	        var locale;

	        if (key && key._locale && key._locale._abbr) {
	            key = key._locale._abbr;
	        }

	        if (!key) {
	            return globalLocale;
	        }

	        if (!isArray(key)) {
	            //short-circuit everything else
	            locale = loadLocale(key);
	            if (locale) {
	                return locale;
	            }
	            key = [key];
	        }

	        return chooseLocale(key);
	    }

	    function locale_locales__listLocales() {
	        return keys(locales);
	    }

	    function checkOverflow (m) {
	        var overflow;
	        var a = m._a;

	        if (a && getParsingFlags(m).overflow === -2) {
	            overflow =
	                a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
	                a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
	                a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
	                a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
	                a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
	                a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
	                -1;

	            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
	                overflow = DATE;
	            }
	            if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
	                overflow = WEEK;
	            }
	            if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
	                overflow = WEEKDAY;
	            }

	            getParsingFlags(m).overflow = overflow;
	        }

	        return m;
	    }

	    // iso 8601 regex
	    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
	    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/;
	    var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/;

	    var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

	    var isoDates = [
	        ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
	        ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
	        ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
	        ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
	        ['YYYY-DDD', /\d{4}-\d{3}/],
	        ['YYYY-MM', /\d{4}-\d\d/, false],
	        ['YYYYYYMMDD', /[+-]\d{10}/],
	        ['YYYYMMDD', /\d{8}/],
	        // YYYYMM is NOT allowed by the standard
	        ['GGGG[W]WWE', /\d{4}W\d{3}/],
	        ['GGGG[W]WW', /\d{4}W\d{2}/, false],
	        ['YYYYDDD', /\d{7}/]
	    ];

	    // iso time formats and regexes
	    var isoTimes = [
	        ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
	        ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
	        ['HH:mm:ss', /\d\d:\d\d:\d\d/],
	        ['HH:mm', /\d\d:\d\d/],
	        ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
	        ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
	        ['HHmmss', /\d\d\d\d\d\d/],
	        ['HHmm', /\d\d\d\d/],
	        ['HH', /\d\d/]
	    ];

	    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

	    // date from iso format
	    function configFromISO(config) {
	        var i, l,
	            string = config._i,
	            match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
	            allowTime, dateFormat, timeFormat, tzFormat;

	        if (match) {
	            getParsingFlags(config).iso = true;

	            for (i = 0, l = isoDates.length; i < l; i++) {
	                if (isoDates[i][1].exec(match[1])) {
	                    dateFormat = isoDates[i][0];
	                    allowTime = isoDates[i][2] !== false;
	                    break;
	                }
	            }
	            if (dateFormat == null) {
	                config._isValid = false;
	                return;
	            }
	            if (match[3]) {
	                for (i = 0, l = isoTimes.length; i < l; i++) {
	                    if (isoTimes[i][1].exec(match[3])) {
	                        // match[2] should be 'T' or space
	                        timeFormat = (match[2] || ' ') + isoTimes[i][0];
	                        break;
	                    }
	                }
	                if (timeFormat == null) {
	                    config._isValid = false;
	                    return;
	                }
	            }
	            if (!allowTime && timeFormat != null) {
	                config._isValid = false;
	                return;
	            }
	            if (match[4]) {
	                if (tzRegex.exec(match[4])) {
	                    tzFormat = 'Z';
	                } else {
	                    config._isValid = false;
	                    return;
	                }
	            }
	            config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
	            configFromStringAndFormat(config);
	        } else {
	            config._isValid = false;
	        }
	    }

	    // date from iso format or fallback
	    function configFromString(config) {
	        var matched = aspNetJsonRegex.exec(config._i);

	        if (matched !== null) {
	            config._d = new Date(+matched[1]);
	            return;
	        }

	        configFromISO(config);
	        if (config._isValid === false) {
	            delete config._isValid;
	            utils_hooks__hooks.createFromInputFallback(config);
	        }
	    }

	    utils_hooks__hooks.createFromInputFallback = deprecate(
	        'value provided is not in a recognized ISO format. moment construction falls back to js Date(), ' +
	        'which is not reliable across all browsers and versions. Non ISO date formats are ' +
	        'discouraged and will be removed in an upcoming major release. Please refer to ' +
	        'http://momentjs.com/guides/#/warnings/js-date/ for more info.',
	        function (config) {
	            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
	        }
	    );

	    // Pick the first defined of two or three arguments.
	    function defaults(a, b, c) {
	        if (a != null) {
	            return a;
	        }
	        if (b != null) {
	            return b;
	        }
	        return c;
	    }

	    function currentDateArray(config) {
	        // hooks is actually the exported moment object
	        var nowValue = new Date(utils_hooks__hooks.now());
	        if (config._useUTC) {
	            return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
	        }
	        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
	    }

	    // convert an array to a date.
	    // the array should mirror the parameters below
	    // note: all values past the year are optional and will default to the lowest possible value.
	    // [year, month, day , hour, minute, second, millisecond]
	    function configFromArray (config) {
	        var i, date, input = [], currentDate, yearToUse;

	        if (config._d) {
	            return;
	        }

	        currentDate = currentDateArray(config);

	        //compute day of the year from weeks and weekdays
	        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
	            dayOfYearFromWeekInfo(config);
	        }

	        //if the day of the year is set, figure out what it is
	        if (config._dayOfYear) {
	            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

	            if (config._dayOfYear > daysInYear(yearToUse)) {
	                getParsingFlags(config)._overflowDayOfYear = true;
	            }

	            date = createUTCDate(yearToUse, 0, config._dayOfYear);
	            config._a[MONTH] = date.getUTCMonth();
	            config._a[DATE] = date.getUTCDate();
	        }

	        // Default to current date.
	        // * if no year, month, day of month are given, default to today
	        // * if day of month is given, default month and year
	        // * if month is given, default only year
	        // * if year is given, don't default anything
	        for (i = 0; i < 3 && config._a[i] == null; ++i) {
	            config._a[i] = input[i] = currentDate[i];
	        }

	        // Zero out whatever was not defaulted, including time
	        for (; i < 7; i++) {
	            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
	        }

	        // Check for 24:00:00.000
	        if (config._a[HOUR] === 24 &&
	                config._a[MINUTE] === 0 &&
	                config._a[SECOND] === 0 &&
	                config._a[MILLISECOND] === 0) {
	            config._nextDay = true;
	            config._a[HOUR] = 0;
	        }

	        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
	        // Apply timezone offset from input. The actual utcOffset can be changed
	        // with parseZone.
	        if (config._tzm != null) {
	            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
	        }

	        if (config._nextDay) {
	            config._a[HOUR] = 24;
	        }
	    }

	    function dayOfYearFromWeekInfo(config) {
	        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;

	        w = config._w;
	        if (w.GG != null || w.W != null || w.E != null) {
	            dow = 1;
	            doy = 4;

	            // TODO: We need to take the current isoWeekYear, but that depends on
	            // how we interpret now (local, utc, fixed offset). So create
	            // a now version of current config (take local/utc/offset flags, and
	            // create now).
	            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(local__createLocal(), 1, 4).year);
	            week = defaults(w.W, 1);
	            weekday = defaults(w.E, 1);
	            if (weekday < 1 || weekday > 7) {
	                weekdayOverflow = true;
	            }
	        } else {
	            dow = config._locale._week.dow;
	            doy = config._locale._week.doy;

	            weekYear = defaults(w.gg, config._a[YEAR], weekOfYear(local__createLocal(), dow, doy).year);
	            week = defaults(w.w, 1);

	            if (w.d != null) {
	                // weekday -- low day numbers are considered next week
	                weekday = w.d;
	                if (weekday < 0 || weekday > 6) {
	                    weekdayOverflow = true;
	                }
	            } else if (w.e != null) {
	                // local weekday -- counting starts from begining of week
	                weekday = w.e + dow;
	                if (w.e < 0 || w.e > 6) {
	                    weekdayOverflow = true;
	                }
	            } else {
	                // default to begining of week
	                weekday = dow;
	            }
	        }
	        if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
	            getParsingFlags(config)._overflowWeeks = true;
	        } else if (weekdayOverflow != null) {
	            getParsingFlags(config)._overflowWeekday = true;
	        } else {
	            temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
	            config._a[YEAR] = temp.year;
	            config._dayOfYear = temp.dayOfYear;
	        }
	    }

	    // constant that refers to the ISO standard
	    utils_hooks__hooks.ISO_8601 = function () {};

	    // date from string and format string
	    function configFromStringAndFormat(config) {
	        // TODO: Move this to another part of the creation flow to prevent circular deps
	        if (config._f === utils_hooks__hooks.ISO_8601) {
	            configFromISO(config);
	            return;
	        }

	        config._a = [];
	        getParsingFlags(config).empty = true;

	        // This array is used to make a Date, either with `new Date` or `Date.UTC`
	        var string = '' + config._i,
	            i, parsedInput, tokens, token, skipped,
	            stringLength = string.length,
	            totalParsedInputLength = 0;

	        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

	        for (i = 0; i < tokens.length; i++) {
	            token = tokens[i];
	            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
	            // console.log('token', token, 'parsedInput', parsedInput,
	            //         'regex', getParseRegexForToken(token, config));
	            if (parsedInput) {
	                skipped = string.substr(0, string.indexOf(parsedInput));
	                if (skipped.length > 0) {
	                    getParsingFlags(config).unusedInput.push(skipped);
	                }
	                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
	                totalParsedInputLength += parsedInput.length;
	            }
	            // don't parse if it's not a known token
	            if (formatTokenFunctions[token]) {
	                if (parsedInput) {
	                    getParsingFlags(config).empty = false;
	                }
	                else {
	                    getParsingFlags(config).unusedTokens.push(token);
	                }
	                addTimeToArrayFromToken(token, parsedInput, config);
	            }
	            else if (config._strict && !parsedInput) {
	                getParsingFlags(config).unusedTokens.push(token);
	            }
	        }

	        // add remaining unparsed input length to the string
	        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
	        if (string.length > 0) {
	            getParsingFlags(config).unusedInput.push(string);
	        }

	        // clear _12h flag if hour is <= 12
	        if (config._a[HOUR] <= 12 &&
	            getParsingFlags(config).bigHour === true &&
	            config._a[HOUR] > 0) {
	            getParsingFlags(config).bigHour = undefined;
	        }

	        getParsingFlags(config).parsedDateParts = config._a.slice(0);
	        getParsingFlags(config).meridiem = config._meridiem;
	        // handle meridiem
	        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

	        configFromArray(config);
	        checkOverflow(config);
	    }


	    function meridiemFixWrap (locale, hour, meridiem) {
	        var isPm;

	        if (meridiem == null) {
	            // nothing to do
	            return hour;
	        }
	        if (locale.meridiemHour != null) {
	            return locale.meridiemHour(hour, meridiem);
	        } else if (locale.isPM != null) {
	            // Fallback
	            isPm = locale.isPM(meridiem);
	            if (isPm && hour < 12) {
	                hour += 12;
	            }
	            if (!isPm && hour === 12) {
	                hour = 0;
	            }
	            return hour;
	        } else {
	            // this is not supposed to happen
	            return hour;
	        }
	    }

	    // date from string and array of format strings
	    function configFromStringAndArray(config) {
	        var tempConfig,
	            bestMoment,

	            scoreToBeat,
	            i,
	            currentScore;

	        if (config._f.length === 0) {
	            getParsingFlags(config).invalidFormat = true;
	            config._d = new Date(NaN);
	            return;
	        }

	        for (i = 0; i < config._f.length; i++) {
	            currentScore = 0;
	            tempConfig = copyConfig({}, config);
	            if (config._useUTC != null) {
	                tempConfig._useUTC = config._useUTC;
	            }
	            tempConfig._f = config._f[i];
	            configFromStringAndFormat(tempConfig);

	            if (!valid__isValid(tempConfig)) {
	                continue;
	            }

	            // if there is any input that was not parsed add a penalty for that format
	            currentScore += getParsingFlags(tempConfig).charsLeftOver;

	            //or tokens
	            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

	            getParsingFlags(tempConfig).score = currentScore;

	            if (scoreToBeat == null || currentScore < scoreToBeat) {
	                scoreToBeat = currentScore;
	                bestMoment = tempConfig;
	            }
	        }

	        extend(config, bestMoment || tempConfig);
	    }

	    function configFromObject(config) {
	        if (config._d) {
	            return;
	        }

	        var i = normalizeObjectUnits(config._i);
	        config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
	            return obj && parseInt(obj, 10);
	        });

	        configFromArray(config);
	    }

	    function createFromConfig (config) {
	        var res = new Moment(checkOverflow(prepareConfig(config)));
	        if (res._nextDay) {
	            // Adding is smart enough around DST
	            res.add(1, 'd');
	            res._nextDay = undefined;
	        }

	        return res;
	    }

	    function prepareConfig (config) {
	        var input = config._i,
	            format = config._f;

	        config._locale = config._locale || locale_locales__getLocale(config._l);

	        if (input === null || (format === undefined && input === '')) {
	            return valid__createInvalid({nullInput: true});
	        }

	        if (typeof input === 'string') {
	            config._i = input = config._locale.preparse(input);
	        }

	        if (isMoment(input)) {
	            return new Moment(checkOverflow(input));
	        } else if (isArray(format)) {
	            configFromStringAndArray(config);
	        } else if (isDate(input)) {
	            config._d = input;
	        } else if (format) {
	            configFromStringAndFormat(config);
	        }  else {
	            configFromInput(config);
	        }

	        if (!valid__isValid(config)) {
	            config._d = null;
	        }

	        return config;
	    }

	    function configFromInput(config) {
	        var input = config._i;
	        if (input === undefined) {
	            config._d = new Date(utils_hooks__hooks.now());
	        } else if (isDate(input)) {
	            config._d = new Date(input.valueOf());
	        } else if (typeof input === 'string') {
	            configFromString(config);
	        } else if (isArray(input)) {
	            config._a = map(input.slice(0), function (obj) {
	                return parseInt(obj, 10);
	            });
	            configFromArray(config);
	        } else if (typeof(input) === 'object') {
	            configFromObject(config);
	        } else if (typeof(input) === 'number') {
	            // from milliseconds
	            config._d = new Date(input);
	        } else {
	            utils_hooks__hooks.createFromInputFallback(config);
	        }
	    }

	    function createLocalOrUTC (input, format, locale, strict, isUTC) {
	        var c = {};

	        if (typeof(locale) === 'boolean') {
	            strict = locale;
	            locale = undefined;
	        }

	        if ((isObject(input) && isObjectEmpty(input)) ||
	                (isArray(input) && input.length === 0)) {
	            input = undefined;
	        }
	        // object construction must be done this way.
	        // https://github.com/moment/moment/issues/1423
	        c._isAMomentObject = true;
	        c._useUTC = c._isUTC = isUTC;
	        c._l = locale;
	        c._i = input;
	        c._f = format;
	        c._strict = strict;

	        return createFromConfig(c);
	    }

	    function local__createLocal (input, format, locale, strict) {
	        return createLocalOrUTC(input, format, locale, strict, false);
	    }

	    var prototypeMin = deprecate(
	        'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
	        function () {
	            var other = local__createLocal.apply(null, arguments);
	            if (this.isValid() && other.isValid()) {
	                return other < this ? this : other;
	            } else {
	                return valid__createInvalid();
	            }
	        }
	    );

	    var prototypeMax = deprecate(
	        'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
	        function () {
	            var other = local__createLocal.apply(null, arguments);
	            if (this.isValid() && other.isValid()) {
	                return other > this ? this : other;
	            } else {
	                return valid__createInvalid();
	            }
	        }
	    );

	    // Pick a moment m from moments so that m[fn](other) is true for all
	    // other. This relies on the function fn to be transitive.
	    //
	    // moments should either be an array of moment objects or an array, whose
	    // first element is an array of moment objects.
	    function pickBy(fn, moments) {
	        var res, i;
	        if (moments.length === 1 && isArray(moments[0])) {
	            moments = moments[0];
	        }
	        if (!moments.length) {
	            return local__createLocal();
	        }
	        res = moments[0];
	        for (i = 1; i < moments.length; ++i) {
	            if (!moments[i].isValid() || moments[i][fn](res)) {
	                res = moments[i];
	            }
	        }
	        return res;
	    }

	    // TODO: Use [].sort instead?
	    function min () {
	        var args = [].slice.call(arguments, 0);

	        return pickBy('isBefore', args);
	    }

	    function max () {
	        var args = [].slice.call(arguments, 0);

	        return pickBy('isAfter', args);
	    }

	    var now = function () {
	        return Date.now ? Date.now() : +(new Date());
	    };

	    function Duration (duration) {
	        var normalizedInput = normalizeObjectUnits(duration),
	            years = normalizedInput.year || 0,
	            quarters = normalizedInput.quarter || 0,
	            months = normalizedInput.month || 0,
	            weeks = normalizedInput.week || 0,
	            days = normalizedInput.day || 0,
	            hours = normalizedInput.hour || 0,
	            minutes = normalizedInput.minute || 0,
	            seconds = normalizedInput.second || 0,
	            milliseconds = normalizedInput.millisecond || 0;

	        // representation for dateAddRemove
	        this._milliseconds = +milliseconds +
	            seconds * 1e3 + // 1000
	            minutes * 6e4 + // 1000 * 60
	            hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
	        // Because of dateAddRemove treats 24 hours as different from a
	        // day when working around DST, we need to store them separately
	        this._days = +days +
	            weeks * 7;
	        // It is impossible translate months into days without knowing
	        // which months you are are talking about, so we have to store
	        // it separately.
	        this._months = +months +
	            quarters * 3 +
	            years * 12;

	        this._data = {};

	        this._locale = locale_locales__getLocale();

	        this._bubble();
	    }

	    function isDuration (obj) {
	        return obj instanceof Duration;
	    }

	    function absRound (number) {
	        if (number < 0) {
	            return Math.round(-1 * number) * -1;
	        } else {
	            return Math.round(number);
	        }
	    }

	    // FORMATTING

	    function offset (token, separator) {
	        addFormatToken(token, 0, 0, function () {
	            var offset = this.utcOffset();
	            var sign = '+';
	            if (offset < 0) {
	                offset = -offset;
	                sign = '-';
	            }
	            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
	        });
	    }

	    offset('Z', ':');
	    offset('ZZ', '');

	    // PARSING

	    addRegexToken('Z',  matchShortOffset);
	    addRegexToken('ZZ', matchShortOffset);
	    addParseToken(['Z', 'ZZ'], function (input, array, config) {
	        config._useUTC = true;
	        config._tzm = offsetFromString(matchShortOffset, input);
	    });

	    // HELPERS

	    // timezone chunker
	    // '+10:00' > ['10',  '00']
	    // '-1530'  > ['-15', '30']
	    var chunkOffset = /([\+\-]|\d\d)/gi;

	    function offsetFromString(matcher, string) {
	        var matches = ((string || '').match(matcher) || []);
	        var chunk   = matches[matches.length - 1] || [];
	        var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
	        var minutes = +(parts[1] * 60) + toInt(parts[2]);

	        return parts[0] === '+' ? minutes : -minutes;
	    }

	    // Return a moment from input, that is local/utc/zone equivalent to model.
	    function cloneWithOffset(input, model) {
	        var res, diff;
	        if (model._isUTC) {
	            res = model.clone();
	            diff = (isMoment(input) || isDate(input) ? input.valueOf() : local__createLocal(input).valueOf()) - res.valueOf();
	            // Use low-level api, because this fn is low-level api.
	            res._d.setTime(res._d.valueOf() + diff);
	            utils_hooks__hooks.updateOffset(res, false);
	            return res;
	        } else {
	            return local__createLocal(input).local();
	        }
	    }

	    function getDateOffset (m) {
	        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
	        // https://github.com/moment/moment/pull/1871
	        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
	    }

	    // HOOKS

	    // This function will be called whenever a moment is mutated.
	    // It is intended to keep the offset in sync with the timezone.
	    utils_hooks__hooks.updateOffset = function () {};

	    // MOMENTS

	    // keepLocalTime = true means only change the timezone, without
	    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
	    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
	    // +0200, so we adjust the time as needed, to be valid.
	    //
	    // Keeping the time actually adds/subtracts (one hour)
	    // from the actual represented time. That is why we call updateOffset
	    // a second time. In case it wants us to change the offset again
	    // _changeInProgress == true case, then we have to adjust, because
	    // there is no such time in the given timezone.
	    function getSetOffset (input, keepLocalTime) {
	        var offset = this._offset || 0,
	            localAdjust;
	        if (!this.isValid()) {
	            return input != null ? this : NaN;
	        }
	        if (input != null) {
	            if (typeof input === 'string') {
	                input = offsetFromString(matchShortOffset, input);
	            } else if (Math.abs(input) < 16) {
	                input = input * 60;
	            }
	            if (!this._isUTC && keepLocalTime) {
	                localAdjust = getDateOffset(this);
	            }
	            this._offset = input;
	            this._isUTC = true;
	            if (localAdjust != null) {
	                this.add(localAdjust, 'm');
	            }
	            if (offset !== input) {
	                if (!keepLocalTime || this._changeInProgress) {
	                    add_subtract__addSubtract(this, create__createDuration(input - offset, 'm'), 1, false);
	                } else if (!this._changeInProgress) {
	                    this._changeInProgress = true;
	                    utils_hooks__hooks.updateOffset(this, true);
	                    this._changeInProgress = null;
	                }
	            }
	            return this;
	        } else {
	            return this._isUTC ? offset : getDateOffset(this);
	        }
	    }

	    function getSetZone (input, keepLocalTime) {
	        if (input != null) {
	            if (typeof input !== 'string') {
	                input = -input;
	            }

	            this.utcOffset(input, keepLocalTime);

	            return this;
	        } else {
	            return -this.utcOffset();
	        }
	    }

	    function setOffsetToUTC (keepLocalTime) {
	        return this.utcOffset(0, keepLocalTime);
	    }

	    function setOffsetToLocal (keepLocalTime) {
	        if (this._isUTC) {
	            this.utcOffset(0, keepLocalTime);
	            this._isUTC = false;

	            if (keepLocalTime) {
	                this.subtract(getDateOffset(this), 'm');
	            }
	        }
	        return this;
	    }

	    function setOffsetToParsedOffset () {
	        if (this._tzm) {
	            this.utcOffset(this._tzm);
	        } else if (typeof this._i === 'string') {
	            var tZone = offsetFromString(matchOffset, this._i);

	            if (tZone === 0) {
	                this.utcOffset(0, true);
	            } else {
	                this.utcOffset(offsetFromString(matchOffset, this._i));
	            }
	        }
	        return this;
	    }

	    function hasAlignedHourOffset (input) {
	        if (!this.isValid()) {
	            return false;
	        }
	        input = input ? local__createLocal(input).utcOffset() : 0;

	        return (this.utcOffset() - input) % 60 === 0;
	    }

	    function isDaylightSavingTime () {
	        return (
	            this.utcOffset() > this.clone().month(0).utcOffset() ||
	            this.utcOffset() > this.clone().month(5).utcOffset()
	        );
	    }

	    function isDaylightSavingTimeShifted () {
	        if (!isUndefined(this._isDSTShifted)) {
	            return this._isDSTShifted;
	        }

	        var c = {};

	        copyConfig(c, this);
	        c = prepareConfig(c);

	        if (c._a) {
	            var other = c._isUTC ? create_utc__createUTC(c._a) : local__createLocal(c._a);
	            this._isDSTShifted = this.isValid() &&
	                compareArrays(c._a, other.toArray()) > 0;
	        } else {
	            this._isDSTShifted = false;
	        }

	        return this._isDSTShifted;
	    }

	    function isLocal () {
	        return this.isValid() ? !this._isUTC : false;
	    }

	    function isUtcOffset () {
	        return this.isValid() ? this._isUTC : false;
	    }

	    function isUtc () {
	        return this.isValid() ? this._isUTC && this._offset === 0 : false;
	    }

	    // ASP.NET json date format regex
	    var aspNetRegex = /^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;

	    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
	    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
	    // and further modified to allow for strings containing both week and day
	    var isoRegex = /^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/;

	    function create__createDuration (input, key) {
	        var duration = input,
	            // matching against regexp is expensive, do it on demand
	            match = null,
	            sign,
	            ret,
	            diffRes;

	        if (isDuration(input)) {
	            duration = {
	                ms : input._milliseconds,
	                d  : input._days,
	                M  : input._months
	            };
	        } else if (typeof input === 'number') {
	            duration = {};
	            if (key) {
	                duration[key] = input;
	            } else {
	                duration.milliseconds = input;
	            }
	        } else if (!!(match = aspNetRegex.exec(input))) {
	            sign = (match[1] === '-') ? -1 : 1;
	            duration = {
	                y  : 0,
	                d  : toInt(match[DATE])                         * sign,
	                h  : toInt(match[HOUR])                         * sign,
	                m  : toInt(match[MINUTE])                       * sign,
	                s  : toInt(match[SECOND])                       * sign,
	                ms : toInt(absRound(match[MILLISECOND] * 1000)) * sign // the millisecond decimal point is included in the match
	            };
	        } else if (!!(match = isoRegex.exec(input))) {
	            sign = (match[1] === '-') ? -1 : 1;
	            duration = {
	                y : parseIso(match[2], sign),
	                M : parseIso(match[3], sign),
	                w : parseIso(match[4], sign),
	                d : parseIso(match[5], sign),
	                h : parseIso(match[6], sign),
	                m : parseIso(match[7], sign),
	                s : parseIso(match[8], sign)
	            };
	        } else if (duration == null) {// checks for null or undefined
	            duration = {};
	        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
	            diffRes = momentsDifference(local__createLocal(duration.from), local__createLocal(duration.to));

	            duration = {};
	            duration.ms = diffRes.milliseconds;
	            duration.M = diffRes.months;
	        }

	        ret = new Duration(duration);

	        if (isDuration(input) && hasOwnProp(input, '_locale')) {
	            ret._locale = input._locale;
	        }

	        return ret;
	    }

	    create__createDuration.fn = Duration.prototype;

	    function parseIso (inp, sign) {
	        // We'd normally use ~~inp for this, but unfortunately it also
	        // converts floats to ints.
	        // inp may be undefined, so careful calling replace on it.
	        var res = inp && parseFloat(inp.replace(',', '.'));
	        // apply sign while we're at it
	        return (isNaN(res) ? 0 : res) * sign;
	    }

	    function positiveMomentsDifference(base, other) {
	        var res = {milliseconds: 0, months: 0};

	        res.months = other.month() - base.month() +
	            (other.year() - base.year()) * 12;
	        if (base.clone().add(res.months, 'M').isAfter(other)) {
	            --res.months;
	        }

	        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

	        return res;
	    }

	    function momentsDifference(base, other) {
	        var res;
	        if (!(base.isValid() && other.isValid())) {
	            return {milliseconds: 0, months: 0};
	        }

	        other = cloneWithOffset(other, base);
	        if (base.isBefore(other)) {
	            res = positiveMomentsDifference(base, other);
	        } else {
	            res = positiveMomentsDifference(other, base);
	            res.milliseconds = -res.milliseconds;
	            res.months = -res.months;
	        }

	        return res;
	    }

	    // TODO: remove 'name' arg after deprecation is removed
	    function createAdder(direction, name) {
	        return function (val, period) {
	            var dur, tmp;
	            //invert the arguments, but complain about it
	            if (period !== null && !isNaN(+period)) {
	                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' +
	                'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
	                tmp = val; val = period; period = tmp;
	            }

	            val = typeof val === 'string' ? +val : val;
	            dur = create__createDuration(val, period);
	            add_subtract__addSubtract(this, dur, direction);
	            return this;
	        };
	    }

	    function add_subtract__addSubtract (mom, duration, isAdding, updateOffset) {
	        var milliseconds = duration._milliseconds,
	            days = absRound(duration._days),
	            months = absRound(duration._months);

	        if (!mom.isValid()) {
	            // No op
	            return;
	        }

	        updateOffset = updateOffset == null ? true : updateOffset;

	        if (milliseconds) {
	            mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
	        }
	        if (days) {
	            get_set__set(mom, 'Date', get_set__get(mom, 'Date') + days * isAdding);
	        }
	        if (months) {
	            setMonth(mom, get_set__get(mom, 'Month') + months * isAdding);
	        }
	        if (updateOffset) {
	            utils_hooks__hooks.updateOffset(mom, days || months);
	        }
	    }

	    var add_subtract__add      = createAdder(1, 'add');
	    var add_subtract__subtract = createAdder(-1, 'subtract');

	    function getCalendarFormat(myMoment, now) {
	        var diff = myMoment.diff(now, 'days', true);
	        return diff < -6 ? 'sameElse' :
	                diff < -1 ? 'lastWeek' :
	                diff < 0 ? 'lastDay' :
	                diff < 1 ? 'sameDay' :
	                diff < 2 ? 'nextDay' :
	                diff < 7 ? 'nextWeek' : 'sameElse';
	    }

	    function moment_calendar__calendar (time, formats) {
	        // We want to compare the start of today, vs this.
	        // Getting start-of-today depends on whether we're local/utc/offset or not.
	        var now = time || local__createLocal(),
	            sod = cloneWithOffset(now, this).startOf('day'),
	            format = utils_hooks__hooks.calendarFormat(this, sod) || 'sameElse';

	        var output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);

	        return this.format(output || this.localeData().calendar(format, this, local__createLocal(now)));
	    }

	    function clone () {
	        return new Moment(this);
	    }

	    function isAfter (input, units) {
	        var localInput = isMoment(input) ? input : local__createLocal(input);
	        if (!(this.isValid() && localInput.isValid())) {
	            return false;
	        }
	        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
	        if (units === 'millisecond') {
	            return this.valueOf() > localInput.valueOf();
	        } else {
	            return localInput.valueOf() < this.clone().startOf(units).valueOf();
	        }
	    }

	    function isBefore (input, units) {
	        var localInput = isMoment(input) ? input : local__createLocal(input);
	        if (!(this.isValid() && localInput.isValid())) {
	            return false;
	        }
	        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
	        if (units === 'millisecond') {
	            return this.valueOf() < localInput.valueOf();
	        } else {
	            return this.clone().endOf(units).valueOf() < localInput.valueOf();
	        }
	    }

	    function isBetween (from, to, units, inclusivity) {
	        inclusivity = inclusivity || '()';
	        return (inclusivity[0] === '(' ? this.isAfter(from, units) : !this.isBefore(from, units)) &&
	            (inclusivity[1] === ')' ? this.isBefore(to, units) : !this.isAfter(to, units));
	    }

	    function isSame (input, units) {
	        var localInput = isMoment(input) ? input : local__createLocal(input),
	            inputMs;
	        if (!(this.isValid() && localInput.isValid())) {
	            return false;
	        }
	        units = normalizeUnits(units || 'millisecond');
	        if (units === 'millisecond') {
	            return this.valueOf() === localInput.valueOf();
	        } else {
	            inputMs = localInput.valueOf();
	            return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
	        }
	    }

	    function isSameOrAfter (input, units) {
	        return this.isSame(input, units) || this.isAfter(input,units);
	    }

	    function isSameOrBefore (input, units) {
	        return this.isSame(input, units) || this.isBefore(input,units);
	    }

	    function diff (input, units, asFloat) {
	        var that,
	            zoneDelta,
	            delta, output;

	        if (!this.isValid()) {
	            return NaN;
	        }

	        that = cloneWithOffset(input, this);

	        if (!that.isValid()) {
	            return NaN;
	        }

	        zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

	        units = normalizeUnits(units);

	        if (units === 'year' || units === 'month' || units === 'quarter') {
	            output = monthDiff(this, that);
	            if (units === 'quarter') {
	                output = output / 3;
	            } else if (units === 'year') {
	                output = output / 12;
	            }
	        } else {
	            delta = this - that;
	            output = units === 'second' ? delta / 1e3 : // 1000
	                units === 'minute' ? delta / 6e4 : // 1000 * 60
	                units === 'hour' ? delta / 36e5 : // 1000 * 60 * 60
	                units === 'day' ? (delta - zoneDelta) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
	                units === 'week' ? (delta - zoneDelta) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
	                delta;
	        }
	        return asFloat ? output : absFloor(output);
	    }

	    function monthDiff (a, b) {
	        // difference in months
	        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
	            // b is in (anchor - 1 month, anchor + 1 month)
	            anchor = a.clone().add(wholeMonthDiff, 'months'),
	            anchor2, adjust;

	        if (b - anchor < 0) {
	            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
	            // linear across the month
	            adjust = (b - anchor) / (anchor - anchor2);
	        } else {
	            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
	            // linear across the month
	            adjust = (b - anchor) / (anchor2 - anchor);
	        }

	        //check for negative zero, return zero if negative zero
	        return -(wholeMonthDiff + adjust) || 0;
	    }

	    utils_hooks__hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
	    utils_hooks__hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

	    function toString () {
	        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
	    }

	    function moment_format__toISOString () {
	        var m = this.clone().utc();
	        if (0 < m.year() && m.year() <= 9999) {
	            if (isFunction(Date.prototype.toISOString)) {
	                // native implementation is ~50x faster, use it when we can
	                return this.toDate().toISOString();
	            } else {
	                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
	            }
	        } else {
	            return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
	        }
	    }

	    function format (inputString) {
	        if (!inputString) {
	            inputString = this.isUtc() ? utils_hooks__hooks.defaultFormatUtc : utils_hooks__hooks.defaultFormat;
	        }
	        var output = formatMoment(this, inputString);
	        return this.localeData().postformat(output);
	    }

	    function from (time, withoutSuffix) {
	        if (this.isValid() &&
	                ((isMoment(time) && time.isValid()) ||
	                 local__createLocal(time).isValid())) {
	            return create__createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
	        } else {
	            return this.localeData().invalidDate();
	        }
	    }

	    function fromNow (withoutSuffix) {
	        return this.from(local__createLocal(), withoutSuffix);
	    }

	    function to (time, withoutSuffix) {
	        if (this.isValid() &&
	                ((isMoment(time) && time.isValid()) ||
	                 local__createLocal(time).isValid())) {
	            return create__createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
	        } else {
	            return this.localeData().invalidDate();
	        }
	    }

	    function toNow (withoutSuffix) {
	        return this.to(local__createLocal(), withoutSuffix);
	    }

	    // If passed a locale key, it will set the locale for this
	    // instance.  Otherwise, it will return the locale configuration
	    // variables for this instance.
	    function locale (key) {
	        var newLocaleData;

	        if (key === undefined) {
	            return this._locale._abbr;
	        } else {
	            newLocaleData = locale_locales__getLocale(key);
	            if (newLocaleData != null) {
	                this._locale = newLocaleData;
	            }
	            return this;
	        }
	    }

	    var lang = deprecate(
	        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
	        function (key) {
	            if (key === undefined) {
	                return this.localeData();
	            } else {
	                return this.locale(key);
	            }
	        }
	    );

	    function localeData () {
	        return this._locale;
	    }

	    function startOf (units) {
	        units = normalizeUnits(units);
	        // the following switch intentionally omits break keywords
	        // to utilize falling through the cases.
	        switch (units) {
	            case 'year':
	                this.month(0);
	                /* falls through */
	            case 'quarter':
	            case 'month':
	                this.date(1);
	                /* falls through */
	            case 'week':
	            case 'isoWeek':
	            case 'day':
	            case 'date':
	                this.hours(0);
	                /* falls through */
	            case 'hour':
	                this.minutes(0);
	                /* falls through */
	            case 'minute':
	                this.seconds(0);
	                /* falls through */
	            case 'second':
	                this.milliseconds(0);
	        }

	        // weeks are a special case
	        if (units === 'week') {
	            this.weekday(0);
	        }
	        if (units === 'isoWeek') {
	            this.isoWeekday(1);
	        }

	        // quarters are also special
	        if (units === 'quarter') {
	            this.month(Math.floor(this.month() / 3) * 3);
	        }

	        return this;
	    }

	    function endOf (units) {
	        units = normalizeUnits(units);
	        if (units === undefined || units === 'millisecond') {
	            return this;
	        }

	        // 'date' is an alias for 'day', so it should be considered as such.
	        if (units === 'date') {
	            units = 'day';
	        }

	        return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
	    }

	    function to_type__valueOf () {
	        return this._d.valueOf() - ((this._offset || 0) * 60000);
	    }

	    function unix () {
	        return Math.floor(this.valueOf() / 1000);
	    }

	    function toDate () {
	        return new Date(this.valueOf());
	    }

	    function toArray () {
	        var m = this;
	        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
	    }

	    function toObject () {
	        var m = this;
	        return {
	            years: m.year(),
	            months: m.month(),
	            date: m.date(),
	            hours: m.hours(),
	            minutes: m.minutes(),
	            seconds: m.seconds(),
	            milliseconds: m.milliseconds()
	        };
	    }

	    function toJSON () {
	        // new Date(NaN).toJSON() === null
	        return this.isValid() ? this.toISOString() : null;
	    }

	    function moment_valid__isValid () {
	        return valid__isValid(this);
	    }

	    function parsingFlags () {
	        return extend({}, getParsingFlags(this));
	    }

	    function invalidAt () {
	        return getParsingFlags(this).overflow;
	    }

	    function creationData() {
	        return {
	            input: this._i,
	            format: this._f,
	            locale: this._locale,
	            isUTC: this._isUTC,
	            strict: this._strict
	        };
	    }

	    // FORMATTING

	    addFormatToken(0, ['gg', 2], 0, function () {
	        return this.weekYear() % 100;
	    });

	    addFormatToken(0, ['GG', 2], 0, function () {
	        return this.isoWeekYear() % 100;
	    });

	    function addWeekYearFormatToken (token, getter) {
	        addFormatToken(0, [token, token.length], 0, getter);
	    }

	    addWeekYearFormatToken('gggg',     'weekYear');
	    addWeekYearFormatToken('ggggg',    'weekYear');
	    addWeekYearFormatToken('GGGG',  'isoWeekYear');
	    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

	    // ALIASES

	    addUnitAlias('weekYear', 'gg');
	    addUnitAlias('isoWeekYear', 'GG');

	    // PRIORITY

	    addUnitPriority('weekYear', 1);
	    addUnitPriority('isoWeekYear', 1);


	    // PARSING

	    addRegexToken('G',      matchSigned);
	    addRegexToken('g',      matchSigned);
	    addRegexToken('GG',     match1to2, match2);
	    addRegexToken('gg',     match1to2, match2);
	    addRegexToken('GGGG',   match1to4, match4);
	    addRegexToken('gggg',   match1to4, match4);
	    addRegexToken('GGGGG',  match1to6, match6);
	    addRegexToken('ggggg',  match1to6, match6);

	    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
	        week[token.substr(0, 2)] = toInt(input);
	    });

	    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
	        week[token] = utils_hooks__hooks.parseTwoDigitYear(input);
	    });

	    // MOMENTS

	    function getSetWeekYear (input) {
	        return getSetWeekYearHelper.call(this,
	                input,
	                this.week(),
	                this.weekday(),
	                this.localeData()._week.dow,
	                this.localeData()._week.doy);
	    }

	    function getSetISOWeekYear (input) {
	        return getSetWeekYearHelper.call(this,
	                input, this.isoWeek(), this.isoWeekday(), 1, 4);
	    }

	    function getISOWeeksInYear () {
	        return weeksInYear(this.year(), 1, 4);
	    }

	    function getWeeksInYear () {
	        var weekInfo = this.localeData()._week;
	        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
	    }

	    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
	        var weeksTarget;
	        if (input == null) {
	            return weekOfYear(this, dow, doy).year;
	        } else {
	            weeksTarget = weeksInYear(input, dow, doy);
	            if (week > weeksTarget) {
	                week = weeksTarget;
	            }
	            return setWeekAll.call(this, input, week, weekday, dow, doy);
	        }
	    }

	    function setWeekAll(weekYear, week, weekday, dow, doy) {
	        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
	            date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

	        this.year(date.getUTCFullYear());
	        this.month(date.getUTCMonth());
	        this.date(date.getUTCDate());
	        return this;
	    }

	    // FORMATTING

	    addFormatToken('Q', 0, 'Qo', 'quarter');

	    // ALIASES

	    addUnitAlias('quarter', 'Q');

	    // PRIORITY

	    addUnitPriority('quarter', 7);

	    // PARSING

	    addRegexToken('Q', match1);
	    addParseToken('Q', function (input, array) {
	        array[MONTH] = (toInt(input) - 1) * 3;
	    });

	    // MOMENTS

	    function getSetQuarter (input) {
	        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
	    }

	    // FORMATTING

	    addFormatToken('D', ['DD', 2], 'Do', 'date');

	    // ALIASES

	    addUnitAlias('date', 'D');

	    // PRIOROITY
	    addUnitPriority('date', 9);

	    // PARSING

	    addRegexToken('D',  match1to2);
	    addRegexToken('DD', match1to2, match2);
	    addRegexToken('Do', function (isStrict, locale) {
	        return isStrict ? locale._ordinalParse : locale._ordinalParseLenient;
	    });

	    addParseToken(['D', 'DD'], DATE);
	    addParseToken('Do', function (input, array) {
	        array[DATE] = toInt(input.match(match1to2)[0], 10);
	    });

	    // MOMENTS

	    var getSetDayOfMonth = makeGetSet('Date', true);

	    // FORMATTING

	    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

	    // ALIASES

	    addUnitAlias('dayOfYear', 'DDD');

	    // PRIORITY
	    addUnitPriority('dayOfYear', 4);

	    // PARSING

	    addRegexToken('DDD',  match1to3);
	    addRegexToken('DDDD', match3);
	    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
	        config._dayOfYear = toInt(input);
	    });

	    // HELPERS

	    // MOMENTS

	    function getSetDayOfYear (input) {
	        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
	        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
	    }

	    // FORMATTING

	    addFormatToken('m', ['mm', 2], 0, 'minute');

	    // ALIASES

	    addUnitAlias('minute', 'm');

	    // PRIORITY

	    addUnitPriority('minute', 14);

	    // PARSING

	    addRegexToken('m',  match1to2);
	    addRegexToken('mm', match1to2, match2);
	    addParseToken(['m', 'mm'], MINUTE);

	    // MOMENTS

	    var getSetMinute = makeGetSet('Minutes', false);

	    // FORMATTING

	    addFormatToken('s', ['ss', 2], 0, 'second');

	    // ALIASES

	    addUnitAlias('second', 's');

	    // PRIORITY

	    addUnitPriority('second', 15);

	    // PARSING

	    addRegexToken('s',  match1to2);
	    addRegexToken('ss', match1to2, match2);
	    addParseToken(['s', 'ss'], SECOND);

	    // MOMENTS

	    var getSetSecond = makeGetSet('Seconds', false);

	    // FORMATTING

	    addFormatToken('S', 0, 0, function () {
	        return ~~(this.millisecond() / 100);
	    });

	    addFormatToken(0, ['SS', 2], 0, function () {
	        return ~~(this.millisecond() / 10);
	    });

	    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
	    addFormatToken(0, ['SSSS', 4], 0, function () {
	        return this.millisecond() * 10;
	    });
	    addFormatToken(0, ['SSSSS', 5], 0, function () {
	        return this.millisecond() * 100;
	    });
	    addFormatToken(0, ['SSSSSS', 6], 0, function () {
	        return this.millisecond() * 1000;
	    });
	    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
	        return this.millisecond() * 10000;
	    });
	    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
	        return this.millisecond() * 100000;
	    });
	    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
	        return this.millisecond() * 1000000;
	    });


	    // ALIASES

	    addUnitAlias('millisecond', 'ms');

	    // PRIORITY

	    addUnitPriority('millisecond', 16);

	    // PARSING

	    addRegexToken('S',    match1to3, match1);
	    addRegexToken('SS',   match1to3, match2);
	    addRegexToken('SSS',  match1to3, match3);

	    var token;
	    for (token = 'SSSS'; token.length <= 9; token += 'S') {
	        addRegexToken(token, matchUnsigned);
	    }

	    function parseMs(input, array) {
	        array[MILLISECOND] = toInt(('0.' + input) * 1000);
	    }

	    for (token = 'S'; token.length <= 9; token += 'S') {
	        addParseToken(token, parseMs);
	    }
	    // MOMENTS

	    var getSetMillisecond = makeGetSet('Milliseconds', false);

	    // FORMATTING

	    addFormatToken('z',  0, 0, 'zoneAbbr');
	    addFormatToken('zz', 0, 0, 'zoneName');

	    // MOMENTS

	    function getZoneAbbr () {
	        return this._isUTC ? 'UTC' : '';
	    }

	    function getZoneName () {
	        return this._isUTC ? 'Coordinated Universal Time' : '';
	    }

	    var momentPrototype__proto = Moment.prototype;

	    momentPrototype__proto.add               = add_subtract__add;
	    momentPrototype__proto.calendar          = moment_calendar__calendar;
	    momentPrototype__proto.clone             = clone;
	    momentPrototype__proto.diff              = diff;
	    momentPrototype__proto.endOf             = endOf;
	    momentPrototype__proto.format            = format;
	    momentPrototype__proto.from              = from;
	    momentPrototype__proto.fromNow           = fromNow;
	    momentPrototype__proto.to                = to;
	    momentPrototype__proto.toNow             = toNow;
	    momentPrototype__proto.get               = stringGet;
	    momentPrototype__proto.invalidAt         = invalidAt;
	    momentPrototype__proto.isAfter           = isAfter;
	    momentPrototype__proto.isBefore          = isBefore;
	    momentPrototype__proto.isBetween         = isBetween;
	    momentPrototype__proto.isSame            = isSame;
	    momentPrototype__proto.isSameOrAfter     = isSameOrAfter;
	    momentPrototype__proto.isSameOrBefore    = isSameOrBefore;
	    momentPrototype__proto.isValid           = moment_valid__isValid;
	    momentPrototype__proto.lang              = lang;
	    momentPrototype__proto.locale            = locale;
	    momentPrototype__proto.localeData        = localeData;
	    momentPrototype__proto.max               = prototypeMax;
	    momentPrototype__proto.min               = prototypeMin;
	    momentPrototype__proto.parsingFlags      = parsingFlags;
	    momentPrototype__proto.set               = stringSet;
	    momentPrototype__proto.startOf           = startOf;
	    momentPrototype__proto.subtract          = add_subtract__subtract;
	    momentPrototype__proto.toArray           = toArray;
	    momentPrototype__proto.toObject          = toObject;
	    momentPrototype__proto.toDate            = toDate;
	    momentPrototype__proto.toISOString       = moment_format__toISOString;
	    momentPrototype__proto.toJSON            = toJSON;
	    momentPrototype__proto.toString          = toString;
	    momentPrototype__proto.unix              = unix;
	    momentPrototype__proto.valueOf           = to_type__valueOf;
	    momentPrototype__proto.creationData      = creationData;

	    // Year
	    momentPrototype__proto.year       = getSetYear;
	    momentPrototype__proto.isLeapYear = getIsLeapYear;

	    // Week Year
	    momentPrototype__proto.weekYear    = getSetWeekYear;
	    momentPrototype__proto.isoWeekYear = getSetISOWeekYear;

	    // Quarter
	    momentPrototype__proto.quarter = momentPrototype__proto.quarters = getSetQuarter;

	    // Month
	    momentPrototype__proto.month       = getSetMonth;
	    momentPrototype__proto.daysInMonth = getDaysInMonth;

	    // Week
	    momentPrototype__proto.week           = momentPrototype__proto.weeks        = getSetWeek;
	    momentPrototype__proto.isoWeek        = momentPrototype__proto.isoWeeks     = getSetISOWeek;
	    momentPrototype__proto.weeksInYear    = getWeeksInYear;
	    momentPrototype__proto.isoWeeksInYear = getISOWeeksInYear;

	    // Day
	    momentPrototype__proto.date       = getSetDayOfMonth;
	    momentPrototype__proto.day        = momentPrototype__proto.days             = getSetDayOfWeek;
	    momentPrototype__proto.weekday    = getSetLocaleDayOfWeek;
	    momentPrototype__proto.isoWeekday = getSetISODayOfWeek;
	    momentPrototype__proto.dayOfYear  = getSetDayOfYear;

	    // Hour
	    momentPrototype__proto.hour = momentPrototype__proto.hours = getSetHour;

	    // Minute
	    momentPrototype__proto.minute = momentPrototype__proto.minutes = getSetMinute;

	    // Second
	    momentPrototype__proto.second = momentPrototype__proto.seconds = getSetSecond;

	    // Millisecond
	    momentPrototype__proto.millisecond = momentPrototype__proto.milliseconds = getSetMillisecond;

	    // Offset
	    momentPrototype__proto.utcOffset            = getSetOffset;
	    momentPrototype__proto.utc                  = setOffsetToUTC;
	    momentPrototype__proto.local                = setOffsetToLocal;
	    momentPrototype__proto.parseZone            = setOffsetToParsedOffset;
	    momentPrototype__proto.hasAlignedHourOffset = hasAlignedHourOffset;
	    momentPrototype__proto.isDST                = isDaylightSavingTime;
	    momentPrototype__proto.isLocal              = isLocal;
	    momentPrototype__proto.isUtcOffset          = isUtcOffset;
	    momentPrototype__proto.isUtc                = isUtc;
	    momentPrototype__proto.isUTC                = isUtc;

	    // Timezone
	    momentPrototype__proto.zoneAbbr = getZoneAbbr;
	    momentPrototype__proto.zoneName = getZoneName;

	    // Deprecations
	    momentPrototype__proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
	    momentPrototype__proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
	    momentPrototype__proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
	    momentPrototype__proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', getSetZone);
	    momentPrototype__proto.isDSTShifted = deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', isDaylightSavingTimeShifted);

	    var momentPrototype = momentPrototype__proto;

	    function moment__createUnix (input) {
	        return local__createLocal(input * 1000);
	    }

	    function moment__createInZone () {
	        return local__createLocal.apply(null, arguments).parseZone();
	    }

	    function preParsePostFormat (string) {
	        return string;
	    }

	    var prototype__proto = Locale.prototype;

	    prototype__proto.calendar        = locale_calendar__calendar;
	    prototype__proto.longDateFormat  = longDateFormat;
	    prototype__proto.invalidDate     = invalidDate;
	    prototype__proto.ordinal         = ordinal;
	    prototype__proto.preparse        = preParsePostFormat;
	    prototype__proto.postformat      = preParsePostFormat;
	    prototype__proto.relativeTime    = relative__relativeTime;
	    prototype__proto.pastFuture      = pastFuture;
	    prototype__proto.set             = locale_set__set;

	    // Month
	    prototype__proto.months            =        localeMonths;
	    prototype__proto.monthsShort       =        localeMonthsShort;
	    prototype__proto.monthsParse       =        localeMonthsParse;
	    prototype__proto.monthsRegex       = monthsRegex;
	    prototype__proto.monthsShortRegex  = monthsShortRegex;

	    // Week
	    prototype__proto.week = localeWeek;
	    prototype__proto.firstDayOfYear = localeFirstDayOfYear;
	    prototype__proto.firstDayOfWeek = localeFirstDayOfWeek;

	    // Day of Week
	    prototype__proto.weekdays       =        localeWeekdays;
	    prototype__proto.weekdaysMin    =        localeWeekdaysMin;
	    prototype__proto.weekdaysShort  =        localeWeekdaysShort;
	    prototype__proto.weekdaysParse  =        localeWeekdaysParse;

	    prototype__proto.weekdaysRegex       =        weekdaysRegex;
	    prototype__proto.weekdaysShortRegex  =        weekdaysShortRegex;
	    prototype__proto.weekdaysMinRegex    =        weekdaysMinRegex;

	    // Hours
	    prototype__proto.isPM = localeIsPM;
	    prototype__proto.meridiem = localeMeridiem;

	    function lists__get (format, index, field, setter) {
	        var locale = locale_locales__getLocale();
	        var utc = create_utc__createUTC().set(setter, index);
	        return locale[field](utc, format);
	    }

	    function listMonthsImpl (format, index, field) {
	        if (typeof format === 'number') {
	            index = format;
	            format = undefined;
	        }

	        format = format || '';

	        if (index != null) {
	            return lists__get(format, index, field, 'month');
	        }

	        var i;
	        var out = [];
	        for (i = 0; i < 12; i++) {
	            out[i] = lists__get(format, i, field, 'month');
	        }
	        return out;
	    }

	    // ()
	    // (5)
	    // (fmt, 5)
	    // (fmt)
	    // (true)
	    // (true, 5)
	    // (true, fmt, 5)
	    // (true, fmt)
	    function listWeekdaysImpl (localeSorted, format, index, field) {
	        if (typeof localeSorted === 'boolean') {
	            if (typeof format === 'number') {
	                index = format;
	                format = undefined;
	            }

	            format = format || '';
	        } else {
	            format = localeSorted;
	            index = format;
	            localeSorted = false;

	            if (typeof format === 'number') {
	                index = format;
	                format = undefined;
	            }

	            format = format || '';
	        }

	        var locale = locale_locales__getLocale(),
	            shift = localeSorted ? locale._week.dow : 0;

	        if (index != null) {
	            return lists__get(format, (index + shift) % 7, field, 'day');
	        }

	        var i;
	        var out = [];
	        for (i = 0; i < 7; i++) {
	            out[i] = lists__get(format, (i + shift) % 7, field, 'day');
	        }
	        return out;
	    }

	    function lists__listMonths (format, index) {
	        return listMonthsImpl(format, index, 'months');
	    }

	    function lists__listMonthsShort (format, index) {
	        return listMonthsImpl(format, index, 'monthsShort');
	    }

	    function lists__listWeekdays (localeSorted, format, index) {
	        return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
	    }

	    function lists__listWeekdaysShort (localeSorted, format, index) {
	        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
	    }

	    function lists__listWeekdaysMin (localeSorted, format, index) {
	        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
	    }

	    locale_locales__getSetGlobalLocale('en', {
	        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
	        ordinal : function (number) {
	            var b = number % 10,
	                output = (toInt(number % 100 / 10) === 1) ? 'th' :
	                (b === 1) ? 'st' :
	                (b === 2) ? 'nd' :
	                (b === 3) ? 'rd' : 'th';
	            return number + output;
	        }
	    });

	    // Side effect imports
	    utils_hooks__hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', locale_locales__getSetGlobalLocale);
	    utils_hooks__hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', locale_locales__getLocale);

	    var mathAbs = Math.abs;

	    function duration_abs__abs () {
	        var data           = this._data;

	        this._milliseconds = mathAbs(this._milliseconds);
	        this._days         = mathAbs(this._days);
	        this._months       = mathAbs(this._months);

	        data.milliseconds  = mathAbs(data.milliseconds);
	        data.seconds       = mathAbs(data.seconds);
	        data.minutes       = mathAbs(data.minutes);
	        data.hours         = mathAbs(data.hours);
	        data.months        = mathAbs(data.months);
	        data.years         = mathAbs(data.years);

	        return this;
	    }

	    function duration_add_subtract__addSubtract (duration, input, value, direction) {
	        var other = create__createDuration(input, value);

	        duration._milliseconds += direction * other._milliseconds;
	        duration._days         += direction * other._days;
	        duration._months       += direction * other._months;

	        return duration._bubble();
	    }

	    // supports only 2.0-style add(1, 's') or add(duration)
	    function duration_add_subtract__add (input, value) {
	        return duration_add_subtract__addSubtract(this, input, value, 1);
	    }

	    // supports only 2.0-style subtract(1, 's') or subtract(duration)
	    function duration_add_subtract__subtract (input, value) {
	        return duration_add_subtract__addSubtract(this, input, value, -1);
	    }

	    function absCeil (number) {
	        if (number < 0) {
	            return Math.floor(number);
	        } else {
	            return Math.ceil(number);
	        }
	    }

	    function bubble () {
	        var milliseconds = this._milliseconds;
	        var days         = this._days;
	        var months       = this._months;
	        var data         = this._data;
	        var seconds, minutes, hours, years, monthsFromDays;

	        // if we have a mix of positive and negative values, bubble down first
	        // check: https://github.com/moment/moment/issues/2166
	        if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
	                (milliseconds <= 0 && days <= 0 && months <= 0))) {
	            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
	            days = 0;
	            months = 0;
	        }

	        // The following code bubbles up values, see the tests for
	        // examples of what that means.
	        data.milliseconds = milliseconds % 1000;

	        seconds           = absFloor(milliseconds / 1000);
	        data.seconds      = seconds % 60;

	        minutes           = absFloor(seconds / 60);
	        data.minutes      = minutes % 60;

	        hours             = absFloor(minutes / 60);
	        data.hours        = hours % 24;

	        days += absFloor(hours / 24);

	        // convert days to months
	        monthsFromDays = absFloor(daysToMonths(days));
	        months += monthsFromDays;
	        days -= absCeil(monthsToDays(monthsFromDays));

	        // 12 months -> 1 year
	        years = absFloor(months / 12);
	        months %= 12;

	        data.days   = days;
	        data.months = months;
	        data.years  = years;

	        return this;
	    }

	    function daysToMonths (days) {
	        // 400 years have 146097 days (taking into account leap year rules)
	        // 400 years have 12 months === 4800
	        return days * 4800 / 146097;
	    }

	    function monthsToDays (months) {
	        // the reverse of daysToMonths
	        return months * 146097 / 4800;
	    }

	    function as (units) {
	        var days;
	        var months;
	        var milliseconds = this._milliseconds;

	        units = normalizeUnits(units);

	        if (units === 'month' || units === 'year') {
	            days   = this._days   + milliseconds / 864e5;
	            months = this._months + daysToMonths(days);
	            return units === 'month' ? months : months / 12;
	        } else {
	            // handle milliseconds separately because of floating point math errors (issue #1867)
	            days = this._days + Math.round(monthsToDays(this._months));
	            switch (units) {
	                case 'week'   : return days / 7     + milliseconds / 6048e5;
	                case 'day'    : return days         + milliseconds / 864e5;
	                case 'hour'   : return days * 24    + milliseconds / 36e5;
	                case 'minute' : return days * 1440  + milliseconds / 6e4;
	                case 'second' : return days * 86400 + milliseconds / 1000;
	                // Math.floor prevents floating point math errors here
	                case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
	                default: throw new Error('Unknown unit ' + units);
	            }
	        }
	    }

	    // TODO: Use this.as('ms')?
	    function duration_as__valueOf () {
	        return (
	            this._milliseconds +
	            this._days * 864e5 +
	            (this._months % 12) * 2592e6 +
	            toInt(this._months / 12) * 31536e6
	        );
	    }

	    function makeAs (alias) {
	        return function () {
	            return this.as(alias);
	        };
	    }

	    var asMilliseconds = makeAs('ms');
	    var asSeconds      = makeAs('s');
	    var asMinutes      = makeAs('m');
	    var asHours        = makeAs('h');
	    var asDays         = makeAs('d');
	    var asWeeks        = makeAs('w');
	    var asMonths       = makeAs('M');
	    var asYears        = makeAs('y');

	    function duration_get__get (units) {
	        units = normalizeUnits(units);
	        return this[units + 's']();
	    }

	    function makeGetter(name) {
	        return function () {
	            return this._data[name];
	        };
	    }

	    var milliseconds = makeGetter('milliseconds');
	    var seconds      = makeGetter('seconds');
	    var minutes      = makeGetter('minutes');
	    var hours        = makeGetter('hours');
	    var days         = makeGetter('days');
	    var months       = makeGetter('months');
	    var years        = makeGetter('years');

	    function weeks () {
	        return absFloor(this.days() / 7);
	    }

	    var round = Math.round;
	    var thresholds = {
	        s: 45,  // seconds to minute
	        m: 45,  // minutes to hour
	        h: 22,  // hours to day
	        d: 26,  // days to month
	        M: 11   // months to year
	    };

	    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
	    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
	        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
	    }

	    function duration_humanize__relativeTime (posNegDuration, withoutSuffix, locale) {
	        var duration = create__createDuration(posNegDuration).abs();
	        var seconds  = round(duration.as('s'));
	        var minutes  = round(duration.as('m'));
	        var hours    = round(duration.as('h'));
	        var days     = round(duration.as('d'));
	        var months   = round(duration.as('M'));
	        var years    = round(duration.as('y'));

	        var a = seconds < thresholds.s && ['s', seconds]  ||
	                minutes <= 1           && ['m']           ||
	                minutes < thresholds.m && ['mm', minutes] ||
	                hours   <= 1           && ['h']           ||
	                hours   < thresholds.h && ['hh', hours]   ||
	                days    <= 1           && ['d']           ||
	                days    < thresholds.d && ['dd', days]    ||
	                months  <= 1           && ['M']           ||
	                months  < thresholds.M && ['MM', months]  ||
	                years   <= 1           && ['y']           || ['yy', years];

	        a[2] = withoutSuffix;
	        a[3] = +posNegDuration > 0;
	        a[4] = locale;
	        return substituteTimeAgo.apply(null, a);
	    }

	    // This function allows you to set the rounding function for relative time strings
	    function duration_humanize__getSetRelativeTimeRounding (roundingFunction) {
	        if (roundingFunction === undefined) {
	            return round;
	        }
	        if (typeof(roundingFunction) === 'function') {
	            round = roundingFunction;
	            return true;
	        }
	        return false;
	    }

	    // This function allows you to set a threshold for relative time strings
	    function duration_humanize__getSetRelativeTimeThreshold (threshold, limit) {
	        if (thresholds[threshold] === undefined) {
	            return false;
	        }
	        if (limit === undefined) {
	            return thresholds[threshold];
	        }
	        thresholds[threshold] = limit;
	        return true;
	    }

	    function humanize (withSuffix) {
	        var locale = this.localeData();
	        var output = duration_humanize__relativeTime(this, !withSuffix, locale);

	        if (withSuffix) {
	            output = locale.pastFuture(+this, output);
	        }

	        return locale.postformat(output);
	    }

	    var iso_string__abs = Math.abs;

	    function iso_string__toISOString() {
	        // for ISO strings we do not use the normal bubbling rules:
	        //  * milliseconds bubble up until they become hours
	        //  * days do not bubble at all
	        //  * months bubble up until they become years
	        // This is because there is no context-free conversion between hours and days
	        // (think of clock changes)
	        // and also not between days and months (28-31 days per month)
	        var seconds = iso_string__abs(this._milliseconds) / 1000;
	        var days         = iso_string__abs(this._days);
	        var months       = iso_string__abs(this._months);
	        var minutes, hours, years;

	        // 3600 seconds -> 60 minutes -> 1 hour
	        minutes           = absFloor(seconds / 60);
	        hours             = absFloor(minutes / 60);
	        seconds %= 60;
	        minutes %= 60;

	        // 12 months -> 1 year
	        years  = absFloor(months / 12);
	        months %= 12;


	        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
	        var Y = years;
	        var M = months;
	        var D = days;
	        var h = hours;
	        var m = minutes;
	        var s = seconds;
	        var total = this.asSeconds();

	        if (!total) {
	            // this is the same as C#'s (Noda) and python (isodate)...
	            // but not other JS (goog.date)
	            return 'P0D';
	        }

	        return (total < 0 ? '-' : '') +
	            'P' +
	            (Y ? Y + 'Y' : '') +
	            (M ? M + 'M' : '') +
	            (D ? D + 'D' : '') +
	            ((h || m || s) ? 'T' : '') +
	            (h ? h + 'H' : '') +
	            (m ? m + 'M' : '') +
	            (s ? s + 'S' : '');
	    }

	    var duration_prototype__proto = Duration.prototype;

	    duration_prototype__proto.abs            = duration_abs__abs;
	    duration_prototype__proto.add            = duration_add_subtract__add;
	    duration_prototype__proto.subtract       = duration_add_subtract__subtract;
	    duration_prototype__proto.as             = as;
	    duration_prototype__proto.asMilliseconds = asMilliseconds;
	    duration_prototype__proto.asSeconds      = asSeconds;
	    duration_prototype__proto.asMinutes      = asMinutes;
	    duration_prototype__proto.asHours        = asHours;
	    duration_prototype__proto.asDays         = asDays;
	    duration_prototype__proto.asWeeks        = asWeeks;
	    duration_prototype__proto.asMonths       = asMonths;
	    duration_prototype__proto.asYears        = asYears;
	    duration_prototype__proto.valueOf        = duration_as__valueOf;
	    duration_prototype__proto._bubble        = bubble;
	    duration_prototype__proto.get            = duration_get__get;
	    duration_prototype__proto.milliseconds   = milliseconds;
	    duration_prototype__proto.seconds        = seconds;
	    duration_prototype__proto.minutes        = minutes;
	    duration_prototype__proto.hours          = hours;
	    duration_prototype__proto.days           = days;
	    duration_prototype__proto.weeks          = weeks;
	    duration_prototype__proto.months         = months;
	    duration_prototype__proto.years          = years;
	    duration_prototype__proto.humanize       = humanize;
	    duration_prototype__proto.toISOString    = iso_string__toISOString;
	    duration_prototype__proto.toString       = iso_string__toISOString;
	    duration_prototype__proto.toJSON         = iso_string__toISOString;
	    duration_prototype__proto.locale         = locale;
	    duration_prototype__proto.localeData     = localeData;

	    // Deprecations
	    duration_prototype__proto.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', iso_string__toISOString);
	    duration_prototype__proto.lang = lang;

	    // Side effect imports

	    // FORMATTING

	    addFormatToken('X', 0, 0, 'unix');
	    addFormatToken('x', 0, 0, 'valueOf');

	    // PARSING

	    addRegexToken('x', matchSigned);
	    addRegexToken('X', matchTimestamp);
	    addParseToken('X', function (input, array, config) {
	        config._d = new Date(parseFloat(input, 10) * 1000);
	    });
	    addParseToken('x', function (input, array, config) {
	        config._d = new Date(toInt(input));
	    });

	    // Side effect imports


	    utils_hooks__hooks.version = '2.15.0';

	    setHookCallback(local__createLocal);

	    utils_hooks__hooks.fn                    = momentPrototype;
	    utils_hooks__hooks.min                   = min;
	    utils_hooks__hooks.max                   = max;
	    utils_hooks__hooks.now                   = now;
	    utils_hooks__hooks.utc                   = create_utc__createUTC;
	    utils_hooks__hooks.unix                  = moment__createUnix;
	    utils_hooks__hooks.months                = lists__listMonths;
	    utils_hooks__hooks.isDate                = isDate;
	    utils_hooks__hooks.locale                = locale_locales__getSetGlobalLocale;
	    utils_hooks__hooks.invalid               = valid__createInvalid;
	    utils_hooks__hooks.duration              = create__createDuration;
	    utils_hooks__hooks.isMoment              = isMoment;
	    utils_hooks__hooks.weekdays              = lists__listWeekdays;
	    utils_hooks__hooks.parseZone             = moment__createInZone;
	    utils_hooks__hooks.localeData            = locale_locales__getLocale;
	    utils_hooks__hooks.isDuration            = isDuration;
	    utils_hooks__hooks.monthsShort           = lists__listMonthsShort;
	    utils_hooks__hooks.weekdaysMin           = lists__listWeekdaysMin;
	    utils_hooks__hooks.defineLocale          = defineLocale;
	    utils_hooks__hooks.updateLocale          = updateLocale;
	    utils_hooks__hooks.locales               = locale_locales__listLocales;
	    utils_hooks__hooks.weekdaysShort         = lists__listWeekdaysShort;
	    utils_hooks__hooks.normalizeUnits        = normalizeUnits;
	    utils_hooks__hooks.relativeTimeRounding = duration_humanize__getSetRelativeTimeRounding;
	    utils_hooks__hooks.relativeTimeThreshold = duration_humanize__getSetRelativeTimeThreshold;
	    utils_hooks__hooks.calendarFormat        = getCalendarFormat;
	    utils_hooks__hooks.prototype             = momentPrototype;

	    var _moment = utils_hooks__hooks;

	    return _moment;

	}));
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(17)(module)))

/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


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

/***/ }
/******/ ]);