// Arguments passed into this controller can be accessed via the `$.args` object directly or:

var args = $.args;
var dispatcher = require("dispatcher");

var win = args.win;
var location;
var name;
var placeId;
var types;
var formattedAddress;

Ti.App.addEventListener("returnVal", handleVal);
Ti.App.addEventListener("getLocation", sendArgs);

function addListeners() {
	dispatcher.trigger("addListeners");
}

function onCancel() {
	dispatcher.trigger("setLocation", {
		cancel : true
	});
	$.trigger("cancel");
	win.closeWindow($.w);
}

function handleVal(args) {
	Ti.App.removeEventListener("returnVal", handleVal);
	location = args.location;
	name = args.name;
	formattedAddress = args.formattedAddress;
	placeId = args.placeId;
	if (name.indexOf(",") > 0) {
		name = name.substr(0, name.indexOf(","));
	}
	types = args.types;
	dispatcher.trigger("setLocation", {
		location : location,
		name : name,
		placeId : placeId,
		formattedAddress : formattedAddress,
		locationTypes : types,
	});
	win.closeWindow($.w);
}

function onSave() {
	Ti.App.fireEvent("getVal");
}

function sendArgs() {
	Ti.App.removeEventListener("getLocation", sendArgs);
	if (Ti.Geolocation.locationServicesEnabled) {
		Ti.Geolocation.getCurrentPosition(handleSendArgsPosition);
	} else {
		alert("please enable location services");
	}
}

function handleSendArgsPosition(e) {
	if (!e.error) {
		var location = {
			lng : e.coords.longitude,
			lat : e.coords.latitude,
		};
		var sendArgs = {
			location : location,
			language : Ti.Locale.currentLanguage,
			region : Ti.Locale.currentCountry,
			isEdit : args.isEdit,
		};
		if (args.placeId) {
			sendArgs.placeId = args.placeId;
		}
		Ti.App.fireEvent("locationSent", sendArgs);
	}
}
