"use strict";

var service = require("./pharma-service");
var task = require("./task");

(function(){
	var match = location.search.match(/visit_id=(\d+)/);
	if( !match ){
		alert("cannot find visit_id");
		return;
	}
	start(+match[1]);
})();

function start(visitId){
	console.log(visitId);
}