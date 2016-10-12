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



