var express = require("express");
var bodyParser = require("body-parser");
var config = require("./config");
var httpProxy = require("http-proxy");

var app = express();
var proxy = httpProxy.createProxyServer({});

(function(){
	var sub = express();
	var App = require("./index");
	var appConfig = config;
	var subdir = "/pharma";
	sub.use(bodyParser.urlencoded({ extended: false }));
	sub.use(bodyParser.json());
	App.initApp(sub, appConfig);
	if( App.staticDir ){
		sub.use(express.static(App.staticDir));
	}
	app.use(subdir, sub);
})();

(function(){
	var sub = express();
	var App = require("myclinic-drawer-print-server");
	var appConfig = {};
	var subdir = "/printer";
	sub.use(bodyParser.urlencoded({ extended: false }));
	sub.use(bodyParser.json());
	App.initApp(sub, appConfig);
	if( App.staticDir ){
		sub.use(express.static(App.staticDir));
	}
	app.use(subdir, sub);
})();

app.use("/service", function(req, res){
	proxy.web(req, res, { target: config["service-url"] });
});

var port = config.port || 8081;
app.listen(port, function(){
	console.log("pharma server listening to " + port);
})

