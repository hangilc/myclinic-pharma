"use strict";

// var service = require("./pharma-service");
// var task = require("./task");
var mConsts = require("myclinic-consts");
var DrugBag = require("myclinic-drawer-forms").DrugBag;
var DrawerCompiler = require("myclinic-drawer").Compiler;
var kanjidate = require("kanjidate");

exports.createData = function(drug, visit, patient, pharmaDrug){
	return {
		kind: drugCategoryToSlug(drug.d_category),
		instructions: composeInstructions(drug.d_category, 
            drug.d_usage, drug.d_amount, drug.unit, drug.d_days, drug.d_iyakuhincode),
		drug_name: composeDrugName(drug.name, drug.d_iyakuhincode),
		patient_name: patient.last_name + " " + patient.first_name,
		patient_name_yomi: patient.last_name_yomi + " " + patient.first_name_yomi,
		desc: pharmaDrug ? composeDesc(pharmaDrug.description, pharmaDrug.sideeffect) : "",
		prescribed_at: kanjidate.format(kanjidate.f2, visit.v_datetime)
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

