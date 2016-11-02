"use strict";

module.exports = {
	drugbag: {
		clinic_name: "{CLINIC_NAME}",
		clinic_address: [
			"Åß123-4567",
			"CLINIC_ADDR",
			"CLINIC_PHONE",
			"CLINIC_HOMEPAGE"
		]
	},
	presc: {
		clinic: [
	        "{CLINIC NAME}",
	        "{CLINIC ADDRESS}",
	        "{CLINIC PHONE}",
	        "{CLINIC DOCTOR}"
		]
	},
	"service-url": process.env.MYCLINIC_SERVER,
	port: 9002
};
