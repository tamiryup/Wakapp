// Arguments passed into this controller can be accessed via the `$.args` object directly or:

var args = $.args;
var dispatcher = require("dispatcher");
var mainCont = args.mainCont;
var AddHelper = require("AddHelper");
var ListenerObject = require("ListenerObject");
var isEdit = Boolean(args.isEdit);
var Mainwin = args.Mainwin;
var listeners = initListeners();

//closing and openning

////////////////////
////DO NOT TOUCH///
//////////////////

AddHelper.initPlace($);

function animateOpen() {
	AddHelper.animateOpen($, Mainwin);
}

function animateClose() {
	AddHelper.animateClose($);
}

//end of block

var location = args.location || null;
var placeId = args.placeId || null;
var name = args.name || "";
var locationName = args.locationName || "";
var formattedAddress = args.formattedAddress || "";
var locationTypes = args.locationTypes || null;
var shuffle = false;
var sounds = args.sounds || [Alloy.Globals.defaultSound];
var radius = args.radius || 0.5;

$.save.addEventListener("click", onSave);

function initialize() {
	setLocation({
		location : location,
		name : name,
		placeId : placeId,
		formattedAddress : formattedAddress,
		locationTypes : locationTypes,
	});
	if (args.locationName != "") {
		$.location.text = args.locationName;
	}
	setRadius({
		radius : radius
	});
	$.sound.setText(AddHelper.setSoundHelp($, sounds, shuffle));
}

initialize();

function initListeners() {
	arr = [];
	arr[0] = new ListenerObject($.nameRow, "click", openLabel);
	arr[1] = new ListenerObject($.locationRow, "click", openLocation);
	arr[2] = new ListenerObject($.soundRow, "click", openSound);
	arr[3] = new ListenerObject($.radiusRow, "click", openRadius);
	return arr;
}

/**
 * a function calling AddHelper's "addAllListeners" to add back event listeners.
 */
function addAllListeners() {
	AddHelper.addAllListeners(listeners, addAllListeners);
}

function onCancel() {
	mainCont.trigger("cancel");
	animateClose();
}

////////////////////
//location func's//
//////////////////

function openLocation() {
	AddHelper.removeAllListeners(listeners, addAllListeners);
	var r = Alloy.createController("Location", {
		win : $.win,
		placeId : placeId,
		isEdit : args.isEdit,
	});
	$.win.openWindow(r.getView());
	dispatcher.on("setLocation", setLocation);
}

function setLocation(args) {
	dispatcher.off("setLocation", setLocation);
	if (!args.cancel) {
		location = args.location;
		name = args.name;
		locationName = name;
		placeId = args.placeId;
		formattedAddress = args.formattedAddress;
		locationTypes = args.locationTypes;
		$.name.text = name;
		$.location.text = locationName;
	}
}

//end of block

/////////////////
//label func's//
///////////////

function openLabel(e) {
	AddHelper.removeAllListeners(listeners, addAllListeners);
	var l = Alloy.createController("Label", {
		win : $.win,
		text : name,
		charLimit : 60,
		element : $.name,
		title : "Name",
	});
	$.win.openWindow(l.getView());
	dispatcher.on("setLabel", setLabel);
}

function setLabel(e) {
	dispatcher.off("setLabel", setLabel);
	name = e.value;
	$.name.text = name;
}

//end of block

//////////////////
//radius func's//
////////////////

function openRadius() {
	AddHelper.removeAllListeners(listeners, addAllListeners);
	var r = Alloy.createController("Radius", {
		win : $.win,
		radius : radius,
	});
	$.win.openWindow(r.getView());
	dispatcher.on("setRadius", setRadius);
}

function setRadius(args) {
	dispatcher.off("setRadius", setRadius);
	radius = args.radius;
	Ti.API.info(radius);
	$.radius.setText(radius + " km");
}

//end of block

/////////////////
//sound func's//
///////////////

function openSound() {
	AddHelper.removeAllListeners(listeners, addAllListeners);
	AddHelper.openSound($, setSound, sounds, shuffle, isEdit, true);
}

function setSound(args) {
	dispatcher.off("setSound", setSound);
	sounds = args.sounds;
	$.sound.setText(AddHelper.setSoundHelp($, sounds, shuffle));
}

// end of sounds func's

function onSave() {
	if (location != null) {
		dispatcher.on("closeAdd", function onCloseAdd() {
			animateClose();
			dispatcher.off("closeAdd", onCloseAdd);
		});
		var eventStr = "saveAlarm";
		if (isEdit) {
			eventStr = "updateAlarm";
		}
		mainCont.trigger(eventStr, {
			location : location,
			radius : radius,
			name : String(name),
			locationName : locationName,
			placeId : placeId,
			formattedAddress : formattedAddress,
			locationTypes : locationTypes,
			sounds : sounds,
			isEdit : isEdit,
		});
	} else {
		alert("choose location");
	}
}
