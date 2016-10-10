var express = require("express");
var bodyParser = require("body-parser");
var pharma = require("./index");
var config = require("./test-config/pharma-config");

var app = express();

(function(){
	var subApp = express();
	var service = require("myclinic-service");
	var serviceConfig = require("./test-config/service-config");
	subApp.use(bodyParser.urlencoded({extended: false}));
	subApp.use(bodyParser.json());
	service.initApp(subApp, serviceConfig);
	app.use("/service", subApp);
})();

var subApp = express();
subApp.use(bodyParser.urlencoded({extended: false}));
subApp.use(bodyParser.json());
pharma.initApp(subApp, config);
subApp.use(express.static(pharma.staticDir));
app.use("/pharma", subApp);

var port = 8081;
app.listen(port, function(){
	console.log("pharma server listening to " + port);
})

