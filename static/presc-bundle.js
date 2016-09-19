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
			v_datetime: "2016-0918 14:38:12",
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

	exports.listDrugs = function(visitId, cb){ // list_full_drugs
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
	}


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

/***/ }
/******/ ]);