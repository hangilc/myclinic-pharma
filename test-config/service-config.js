"use strict";

var fs = require("fs");

module.exports = {
	dbConfig: {
		host: process.env.MYCLINIC_DB_HOST,
	    user: process.env.MYCLINIC_DB_USER,
	    password: process.env.MYCLINIC_DB_PASS,
	    database: "myclinic",
	    dateStrings: true
	},
	masterMap: __dirname + "/service-master-map.txt",
	nameMap: __dirname + "/service-master-name.txt",
	houkatsuList: JSON.parse(fs.readFileSync(__dirname + "/service-rcpt-houkatsu.json", "utf-8")).houkatsu
};