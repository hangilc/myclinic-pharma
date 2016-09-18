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
}
