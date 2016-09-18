"use strict";

var conti = require("conti");

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
