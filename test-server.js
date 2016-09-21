var express = require("express");
var bodyParser = require("body-parser");
var pharma = require("./index");
var config = require("./sample-config/pharma-config");

var app = express();
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

