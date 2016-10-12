"use strict";

exports.staticDir = __dirname + "/static";

exports.initApp = function(app, config){
	app.get("/config", function(req, res){
		res.json(config);
	})
};
