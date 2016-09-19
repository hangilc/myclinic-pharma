"use strict";

var service = require("./pharma-service");
var task = require("./task");
var DrugBagData = require("./drugbag-data");
var DrugBag = require("myclinic-drawer-forms").DrugBag;
var DrawerSVG = require("myclinic-drawer-svg");

(function(){
	var q = location.search;
	var match = q.match(/drug_id=(\d+)/);
	if( match ){
		previewDrug(+match[1]);
	}
})();

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
