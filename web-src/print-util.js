"use strict";

var conti = require("conti");

var printServerPort = 8082;

function printServerUrl(){
	return location.protocol + "//" + "localhost" + ":" + printServerPort;
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
	}, done);
};

