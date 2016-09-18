"use strict";

var hogan = require("hogan");
var fs = require("fs");
var indexTmplSrc = fs.readFileSync(__dirname + "/web-src/index.html", {encoding: "utf-8"});
var indexTmpl = hogan.compile(indexTmplSrc);

exports.staticDir = __dirname + "/static";

exports.initApp = function(app, config){
	app.get("/", function(req, res){
		var html = indexTmpl.render({
			baseUrl: req.baseUrl
		});
		res.send(html);
	})
};



